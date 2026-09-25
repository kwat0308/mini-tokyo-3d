/* eslint-disable no-await-in-loop -- requests are deliberately sequential (retries, rate limiting) */
import fs from 'node:fs';

// Fetches the history of every station from Wikipedia and writes it to
// data/station-info.json, which the data build (src/loader/station-info.js)
// ships to the browser.
//
//   node scripts/fetch-station-history.mjs                  fetch everything (~15 min)
//   node scripts/fetch-station-history.mjs ID...            fetch only the given station groups
//   node scripts/fetch-station-history.mjs --cache=FILE     keep the downloaded article text in
//                                                           FILE, so that a rerun only parses
//
// A station group is the set of stations that share one physical station, and
// it is identified by the ID of its first station, the same key that
// data/station-history.json uses. The article of each group is found through
// the Wikipedia titles in data/stations.json and is only accepted when its
// coordinates lie next to the station, so that a station of the same name
// elsewhere in Japan cannot be picked up by mistake. Groups that cannot be
// matched are left without history; fix them by hand in
// data/station-wikipedia.json, whose entries always win over the automatic
// match:
//
//   {"TokyoMetro.Chiyoda.Otemachi": {"ja": "大手町駅 (東京都)", "en": "Ōtemachi Station"}}
//   {"Keikyu.Main.Aomonoyokocho": {"skip": true}}
//
// Groups that have a hand-written history in data/station-history.json are
// skipped. The text is extracted from Wikipedia (CC BY-SA) and is credited in
// the UI.

const API = {ja: 'https://ja.wikipedia.org/w/api.php', en: 'https://en.wikipedia.org/w/api.php'};
const USER_AGENT = 'mini-tokyo-3d-station-history/1.0 (https://github.com/nagix/mini-tokyo-3d)';
const MAX_DISTANCE = 1200; // meters between the article's coordinates and the station
const BATCH_SIZE = 50;
const MAX_HISTORY_JA = 7;
const MAX_HISTORY_EN = 6;
const MAX_JA_LENGTH = 120;
const MAX_EN_LENGTH = 230;
const PREFECTURES = ['東京都', '神奈川県', '埼玉県', '千葉県', '茨城県', '群馬県', '栃木県', '山梨県'];
const EN_QUALIFIERS = ['Tokyo', 'Kanagawa', 'Saitama', 'Chiba', 'Ibaraki', 'Gunma', 'Tochigi', 'Yamanashi'];

const OUTPUT = 'data/station-info.json';
const OVERRIDES = 'data/station-wikipedia.json';
const CURATED = 'data/station-history.json';

const sleep = ms => new Promise(resolve => {
    setTimeout(resolve, ms);
});

let nextRequestAt = 0;

async function throttle() {
    const wait = Math.max(0, nextRequestAt - Date.now());

    nextRequestAt = Date.now() + wait + 200;
    if (wait) {
        await sleep(wait);
    }
}

async function api(lang, params, retries = 4) {
    const url = `${API[lang]}?${new URLSearchParams(Object.assign({format: 'json', formatversion: '2'}, params))}`;

    for (let attempt = 0; ; attempt++) {
        try {
            await throttle();
            const response = await fetch(url, {headers: {'User-Agent': USER_AGENT}});

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (attempt >= retries) {
                throw error;
            }
            await sleep(1000 * (attempt + 1));
        }
    }
}

async function mapLimit(items, limit, fn) {
    const results = new Array(items.length);
    let next = 0;

    await Promise.all(Array.from({length: limit}, async () => {
        while (next < items.length) {
            const index = next++;

            results[index] = await fn(items[index], index);
        }
    }));
    return results;
}

function distance([lng1, lat1], [lng2, lat2]) {
    const rad = Math.PI / 180,
        a = Math.sin((lat2 - lat1) * rad / 2) ** 2 +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin((lng2 - lng1) * rad / 2) ** 2;

    return 12742000 * Math.asin(Math.sqrt(a));
}

// ---------- Finding the articles ----------

// Looks up the given titles in batches and returns a Map from each requested
// title to {title, coords, otherTitle}, for the pages that exist, are not
// disambiguation pages and have coordinates.
async function lookup(lang, titles) {
    const found = new Map(),
        unique = [...new Set(titles)],
        batches = [];

    for (let i = 0; i < unique.length; i += BATCH_SIZE) {
        batches.push(unique.slice(i, i + BATCH_SIZE));
    }
    await mapLimit(batches, 3, async batch => {
        const data = await api(lang, {
            action: 'query',
            redirects: '1',
            titles: batch.join('|'),
            prop: 'coordinates|pageprops|langlinks',
            colimit: 'max',
            lllimit: 'max',
            lllang: lang === 'ja' ? 'en' : 'ja',
            ppprop: 'disambiguation'
        });
        const {query} = data,
            alias = new Map(),
            pages = new Map((query.pages || []).map(page => [page.title, page]));

        for (const {from, to} of [...query.normalized || [], ...query.redirects || []]) {
            alias.set(from, to);
        }
        for (const title of batch) {
            let resolved = title;

            for (let i = 0; i < 5 && alias.has(resolved); i++) {
                resolved = alias.get(resolved);
            }
            const page = pages.get(resolved);

            if (page && !page.missing && !(page.pageprops && 'disambiguation' in page.pageprops)) {
                found.set(title, {
                    title: page.title,
                    coords: (page.coordinates || []).map(({lon, lat}) => [lon, lat]),
                    otherTitle: page.langlinks && page.langlinks[0] ? page.langlinks[0].title : undefined
                });
            }
        }
    });
    return found;
}

const isNear = (page, group) => page.coords.some(coord => group.some(station => distance(coord, station.coord) <= MAX_DISTANCE));

const jaTitle = station => station.title['ja-Wiki'] || `${station.title.ja.replace(/[〈<（(].*$/, '')}駅`;
const enTitle = station => `${station.title.en.replace(/[〈<（(].*$/, '')} Station`;

// Picks, for each group, the first candidate whose article is next to the station
function choose(groups, candidatesOf, found) {
    const chosen = new Map();

    for (const [key, group] of groups) {
        for (const candidate of candidatesOf(group)) {
            const page = found.get(candidate);

            if (page && isNear(page, group)) {
                chosen.set(key, page);
                break;
            }
        }
    }
    return chosen;
}

async function findArticles(lang, groups, overrides) {
    const titlesOf = lang === 'ja' ? jaTitle : enTitle,
        qualifiers = lang === 'ja' ? PREFECTURES.map(prefecture => ` (${prefecture})`) : EN_QUALIFIERS.map(qualifier => ` (${qualifier})`),
        candidatesOf = group => [...new Set(group.map(titlesOf))],
        chosen = new Map(),
        pending = new Map(groups);
    const overridden = [...groups.keys()].filter(key => overrides[key] && overrides[key][lang]);

    // Hand-written titles are trusted without checking the coordinates
    if (overridden.length) {
        const found = await lookup(lang, overridden.map(key => overrides[key][lang]));

        for (const key of overridden) {
            const page = found.get(overrides[key][lang]);

            if (page) {
                chosen.set(key, page);
                pending.delete(key);
            }
        }
    }

    // The plain titles first, then the ones with a prefecture (or its English
    // equivalent) added, for the names that are shared by several stations
    const qualified = group => candidatesOf(group).flatMap(title => qualifiers.map(qualifier => title + qualifier));

    for (const candidatesFor of [candidatesOf, qualified]) {
        const titles = [...pending.values()].flatMap(candidatesFor),
            found = await lookup(lang, titles),
            picked = choose(pending, candidatesFor, found);

        for (const [key, page] of picked) {
            chosen.set(key, page);
            pending.delete(key);
        }
    }
    return chosen;
}

async function fetchExtract(lang, title) {
    const data = await api(lang, {
        action: 'query',
        redirects: '1',
        titles: title,
        prop: 'extracts',
        explaintext: '1',
        exsectionformat: 'wiki'
    });
    const page = data.query.pages[0];

    return page && !page.missing ? page.extract || '' : '';
}

// ---------- History ----------

function section(extract, pattern) {
    const headings = [...extract.matchAll(/^== ([^=].*?) ==\s*$/gm)],
        index = headings.findIndex(match => pattern.test(match[1]));

    if (index < 0) {
        return '';
    }
    const start = headings[index].index + headings[index][0].length,
        end = index + 1 < headings.length ? headings[index + 1].index : extract.length;

    return extract.slice(start, end);
}

function clean(text) {
    return text
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function shorten(text, max) {
    if (text.length <= max) {
        return text;
    }
    const cut = text.slice(0, max),
        breaks = ['。', '、', '；', '. ', ', ', '; '].map(mark => cut.lastIndexOf(mark)),
        best = Math.max(...breaks);

    return `${(best > max * 0.5 ? cut.slice(0, best) : cut).replace(/[、,;；\s]+$/, '')}…`;
}

// What made a station's history worth telling, and what was only routine
const STRONG_JA = [
    [/開業|開設|開駅|営業を開始|運輸営業を開始|運輸開始|開通|開場/, 5],
    [/改称|駅名を|改名|名称を変更|名称変更/, 4],
    [/移転|移設|位置を変更|新駅|新設|統合|合併/, 3],
    [/駅舎|改築|新築|改装|竣工|完成|リニューアル|再開発|全面/, 3],
    [/高架|地下化|地下駅|橋上|複々線|複線|島式|増設|拡幅/, 3],
    [/空襲|震災|焼失|全焼|戦災|災害|被災|復旧|再建|大火/, 3],
    [/国有化|民営化|分割|発足|国鉄|移管|譲渡|継承/, 3],
    [/乗り入れ|乗入|直通運転|相互直通|接続|新幹線|延伸|延長|ターミナル/, 2],
    [/廃止|休止|閉鎖|閉業|撤去/, 2]
];
const TRIVIA_JA = /自動改札|ICカード|Suica|PASMO|ICOCA|manaca|エスカレーター|エレベーター|ホームドア|ホーム柵|発車メロディ|接近メロディ|みどりの窓口|指定席券売機|自動券売機|券売機|定期券|トイレ|手荷物|荷物|貨物取扱|ダイヤ改正|えきねっと|案内|喫煙|バリアフリー|点字|ナンバリング|営業時間|クレジット|サービスを開始|使用を開始|導入|冷房|空調|Wi-?Fi|停車を開始|通過となる|商業施設|エキナカ|エキュート|アトレ|ルミネ|シェアオフィス|旅行センター|びゅうプラザ|コンビニ|ホテル|レストラン|バス/;
const TRIVIA_EN = /Suica|PASMO|IC card|platform (?:edge|screen) door|escalator|elevator|\blifts?\b|station numbering|numbering|melod|ticket (?:office|vending|gate)|Wi-?Fi|toilet|air.?condition|passengers|ridership|fiscal|boarding|ticket barrier|automatic ticket|installed|colou?r-coded/i;

function scoreJa(text) {
    const strong = STRONG_JA.reduce((sum, [pattern, points]) => sum + (pattern.test(text) ? points : 0), 0);

    return TRIVIA_JA.test(text) ? Math.min(strong, 0) - 2 : strong;
}

// The dated lines ("1922年（大正11年）7月15日：…") of a piece of the history section
function parseEntriesJa(body) {
    const entries = [];
    let year;

    for (const raw of body.split('\n')) {
        const line = raw.trim();

        if (!line) {
            continue;
        }
        const yearMatch = line.match(/^(\d{4})年(?:[（(][^）)]*[）)])?(.*)$/),
            rest = yearMatch ? yearMatch[2].trim() : line;

        if (yearMatch && !rest) {
            year = yearMatch[1];
            continue;
        }
        const dateMatch = rest.match(/^(?:(\d{1,2})月(?:(\d{1,2})日|[上中下]旬)?(?:[（(][^）)]*[）)])?)?\s*[：:\-－―–—]\s*(.+)$/);

        if ((yearMatch || year) && dateMatch && (yearMatch || /^\d{1,2}月/.test(rest))) {
            const [, month, day, text] = dateMatch,
                entryYear = yearMatch ? yearMatch[1] : year;

            year = entryYear;
            entries.push({
                label: `${entryYear}年${month ? `${month}月` : ''}${day ? `${day}日` : ''}`,
                text: clean(text)
            });
        }
    }
    return entries;
}

// A station used by several operators has a sub-section of the history for each,
// and the first one is taken. A history that is divided by era instead is used
// in full. Sub-sections can be nested (an era heading with the operators below).
function entriesOf(body, level = 3) {
    const isEra = heading => /年|時代|戦前|戦後|昭和|平成|令和|明治|大正|以前|以降|現在/.test(heading);

    if (level > 5) {
        return parseEntriesJa(body);
    }
    const marks = '='.repeat(level),
        parts = body.split(new RegExp(`^${marks} (.*?) ${marks}\\s*$`, 'm'));
    let entries = [];

    if (parts.length === 1) {
        return entriesOf(body, level + 1);
    }
    for (let i = 1; i < parts.length; i += 2) {
        const found = entriesOf(parts[i + 1], level + 1);

        if (!entries.length && found.length) {
            entries = found;
            if (!isEra(parts[i])) {
                break;
            }
        } else if (entries.length && isEra(parts[i])) {
            entries = entries.concat(found);
        } else if (entries.length) {
            break;
        }
    }
    return entries.length ? entries : parseEntriesJa(parts[0]);
}

const historyEntriesJa = extract => entriesOf(section(extract, /^(歴史|沿革|歴史・沿革|沿革・歴史)/));

function parseHistoryJa(extract) {
    const scored = historyEntriesJa(extract).map((entry, index) => Object.assign({index, score: scoreJa(entry.text)}, entry)),
        // Routine changes (ticket gates, IC cards, ...) are never worth telling
        worthy = scored.filter(({score}) => score > 0);
    let picked = worthy;

    if (!worthy.length) {
        picked = scored.filter(({score}) => score === 0).slice(0, 3);
    } else if (worthy.length > MAX_HISTORY_JA) {
        // The station's opening is always told, and the rest of the story is
        // spread over the years: the best entry of each equal share of them
        const opening = worthy.find(({text}) => STRONG_JA[0][0].test(text));

        picked = Array.from({length: MAX_HISTORY_JA}, (_, i) => worthy
            .slice(Math.floor(i * worthy.length / MAX_HISTORY_JA), Math.floor((i + 1) * worthy.length / MAX_HISTORY_JA))
            .reduce((best, entry) => {
                const value = entry.score + (entry === opening ? 100 : 0);

                return value > best.value ? {value, entry} : best;
            }, {value: -1}).entry);
    }

    return picked.map(({label, text}) => shorten(`${label}：${text}`, MAX_JA_LENGTH));
}

function parseHistoryEn(extract) {
    const body = section(extract, /^History$/i);

    return body
        .split('\n')
        .filter(line => line.trim() && !/^=+ /.test(line))
        .join(' ')
        .split(/(?<=[.!?])\s+(?=[A-Z"])/)
        .map(clean)
        .filter(sentence => /\b(1[89]\d\d|20\d\d)\b/.test(sentence) && sentence.length > 25 && !TRIVIA_EN.test(sentence))
        .slice(0, MAX_HISTORY_EN)
        .map(sentence => shorten(sentence, MAX_EN_LENGTH));
}

function wikiUrl(lang, title) {
    return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}

// ---------- Main ----------

async function main() {
    const args = process.argv.slice(2),
        cacheFile = (args.find(arg => arg.startsWith('--cache=')) || '').slice('--cache='.length),
        only = new Set(args.filter(arg => !arg.startsWith('--'))),
        stations = JSON.parse(fs.readFileSync('data/stations.json', 'utf8')).filter(station => station.coord),
        groupData = JSON.parse(fs.readFileSync('data/station-groups.json', 'utf8')),
        overrides = fs.existsSync(OVERRIDES) ? JSON.parse(fs.readFileSync(OVERRIDES, 'utf8')) : {},
        curated = fs.existsSync(CURATED) ? JSON.parse(fs.readFileSync(CURATED, 'utf8')) : {},
        existing = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : {},
        cache = cacheFile && fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {},
        groupKeys = new Map(),
        groups = new Map();

    for (const groupList of groupData) {
        for (const id of [].concat(...groupList)) {
            groupKeys.set(id, groupList[0][0]);
        }
    }
    for (const station of stations) {
        const key = groupKeys.get(station.id) || station.id;

        if (!groups.has(key)) {
            groups.set(key, []);
        }
        groups.get(key).push(station);
    }
    // The first station of a group is the one whose ID is the key
    for (const [key, group] of groups) {
        group.sort((a, b) => (b.id === key) - (a.id === key));
        if (curated[key] || (overrides[key] && overrides[key].skip) || (only.size && !only.has(key))) {
            groups.delete(key);
        }
    }

    console.log(`Matching ${groups.size} station groups to Wikipedia articles...`);
    const jaPages = await findArticles('ja', groups, overrides),
        enPages = new Map();

    // The English article that the Japanese one links to is trusted, unless a
    // title was written by hand
    for (const [key, page] of jaPages) {
        if (page.otherTitle && !(overrides[key] && overrides[key].en)) {
            enPages.set(key, {title: page.otherTitle});
        }
    }
    // Everything else is searched for, which also finds English articles of the
    // groups without a Japanese one
    for (const [key, page] of await findArticles('en', new Map([...groups].filter(([key]) => !enPages.has(key))), overrides)) {
        enPages.set(key, page);
    }

    const targets = [...groups.keys()].filter(key => jaPages.has(key) || enPages.has(key)),
        result = Object.assign({}, existing),
        today = new Date().toISOString().slice(0, 10);
    let done = 0;

    console.log(`Fetching the history of ${targets.length} station groups...`);
    await mapLimit(targets, 4, async key => {
        const jaPage = jaPages.get(key),
            enPage = enPages.get(key),
            cached = cache[key] || (cache[key] = {});

        if (jaPage && (!cached.ja || cached.ja.title !== jaPage.title)) {
            cached.ja = {title: jaPage.title, extract: await fetchExtract('ja', jaPage.title).catch(() => '')};
        }
        if (enPage && (!cached.en || cached.en.title !== enPage.title)) {
            cached.en = {title: enPage.title, extract: await fetchExtract('en', enPage.title).catch(() => '')};
        }
        if (++done % 100 === 0) {
            console.log(`  ${done}/${targets.length}`);
        }
    });

    for (const key of targets) {
        const cached = cache[key],
            historyJa = jaPages.has(key) && cached.ja ? parseHistoryJa(cached.ja.extract) : [],
            historyEn = enPages.has(key) && cached.en ? parseHistoryEn(cached.en.extract) : [];

        delete result[key];
        if (!historyJa.length && !historyEn.length) {
            continue;
        }
        const info = {wiki: {}, history: {sources: {}, sourceTitle: 'Wikipedia', updated: today}, updated: today};

        if (jaPages.has(key)) {
            info.wiki.ja = jaPages.get(key).title;
        }
        if (enPages.has(key)) {
            info.wiki.en = enPages.get(key).title;
        }
        if (historyJa.length) {
            info.history.ja = historyJa;
            info.history.sources.ja = wikiUrl('ja', jaPages.get(key).title);
        }
        if (historyEn.length) {
            info.history.en = historyEn;
            info.history.sources.en = wikiUrl('en', enPages.get(key).title);
        }
        result[key] = info;
    }

    if (cacheFile) {
        fs.writeFileSync(cacheFile, JSON.stringify(cache));
    }
    const sorted = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a < b ? -1 : 1));

    fs.writeFileSync(OUTPUT, `${JSON.stringify(sorted, null, 1)}\n`);

    const values = Object.values(sorted),
        unmatched = [...groups.keys()].filter(key => !jaPages.has(key) && !enPages.has(key)),
        noHistory = targets.filter(key => !sorted[key]);

    console.log(`\nWrote ${OUTPUT}: ${values.length} station groups`);
    console.log(`  with ja history: ${values.filter(v => v.history.ja).length}`);
    console.log(`  with en history: ${values.filter(v => v.history.en).length}`);
    console.log(`  matched, but no history section: ${noHistory.length}`);
    console.log(`  no article found: ${unmatched.length}`);
    if (only.size) {
        for (const key of unmatched) {
            console.log(`  unmatched: ${key}`);
        }
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
