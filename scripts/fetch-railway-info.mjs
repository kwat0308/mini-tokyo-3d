/* eslint-disable no-await-in-loop -- requests are deliberately sequential (retries, rate limiting) */
import fs from 'node:fs';

// Fetches per-railway facts (length, opening date, construction history) from
// Wikipedia and writes them to data/railway-info.json, which the data build
// (src/loader/railway-info.js) ships to the browser.
//
//   node scripts/fetch-railway-info.mjs          fetch everything (~3 min)
//   node scripts/fetch-railway-info.mjs ID...    fetch only the given railway IDs
//
// Each railway is matched to a Japanese Wikipedia article automatically (see
// candidateTitles) and the match is only accepted when the article actually
// mentions the railway's stations. Anything that cannot be matched is listed at
// the end; fix those by hand in data/railway-wikipedia.json, whose entries
// always win over the automatic match:
//
//   {"Odakyu.Odawara": {"ja": "小田急小田原線", "en": "Odakyu Odawara Line"}}
//
// The text is extracted from Wikipedia (CC BY-SA) and is credited in the UI.

const API = {ja: 'https://ja.wikipedia.org/w/api.php', en: 'https://en.wikipedia.org/w/api.php'};
const USER_AGENT = 'mini-tokyo-3d-railway-info/1.0 (https://github.com/nagix/mini-tokyo-3d)';
const MATCH_THRESHOLD = 0.6;
const MAX_HISTORY_JA = 10;
const MAX_HISTORY_EN = 8;
const MAX_JA_LENGTH = 130;
const MAX_EN_LENGTH = 240;

const OUTPUT = 'data/railway-info.json';
const OVERRIDES = 'data/railway-wikipedia.json';

// Prefixes that Wikipedia article titles carry for each operator
const OPERATOR_PREFIXES = {
    'TWR': ['東京臨海高速鉄道'],
    'TokyoMetro': ['東京メトロ', '東京地下鉄'],
    'Toei': ['都営地下鉄', '東京都交通局'],
    'YokohamaMunicipal': ['横浜市営地下鉄'],
    'Keio': ['京王'],
    'Keikyu': ['京急', '京浜急行電鉄'],
    'Keisei': ['京成'],
    'Hokuso': ['北総鉄道'],
    'Shibayama': ['芝山鉄道'],
    'Tobu': ['東武'],
    'Seibu': ['西武'],
    'Odakyu': ['小田急'],
    'OdakyuHakone': ['箱根登山鉄道'],
    'Tokyu': ['東急'],
    'Minatomirai': ['横浜高速鉄道'],
    'Sotetsu': ['相鉄'],
    'SaitamaRailway': ['埼玉高速鉄道'],
    'MIR': ['首都圏新都市鉄道'],
    'ToyoRapid': ['東葉高速鉄道'],
    'KantoRailway': ['関東鉄道'],
    'Ryutetsu': ['流鉄'],
    'Kominato': ['小湊鉄道'],
    'Isumi': ['いすみ鉄道'],
    'Choshi': ['銚子電気鉄道'],
    'KashimaRinkai': ['鹿島臨海鉄道'],
    'Hitachinaka': ['ひたちなか海浜鉄道'],
    'Moka': ['真岡鐵道'],
    'Enoden': ['江ノ島電鉄'],
    'IzuHakone': ['伊豆箱根鉄道'],
    'Izukyu': ['伊豆急行'],
    'Fujikyu': ['富士急行'],
    'Chichibu': ['秩父鉄道'],
    'Jomo': ['上毛電気鉄道'],
    'Joshin': ['上信電鉄'],
    'WataraseKeikoku': ['わたらせ渓谷鐡道'],
    'Yurikamome': ['ゆりかもめ'],
    'YokohamaSeaside': ['横浜シーサイドライン'],
    'SaitamaTransit': ['埼玉新都市交通'],
    'Yamaman': ['山万'],
    'TokyoMonorail': ['東京モノレール'],
    'TamaMonorail': ['多摩都市モノレール'],
    'ChibaMonorail': ['千葉都市モノレール'],
    'ShonanMonorail': ['湘南モノレール']
};

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

function candidateTitles(railway) {
    const [operator] = railway.id.split('.'),
        title = railway.title.ja,
        variants = new Set([title]),
        inner = title.match(/^(.*?)[(（](.*?)[)）]/);

    if (inner) {
        variants.add(inner[1]);
        variants.add(inner[2]);
    }
    const candidates = [];

    for (const variant of variants) {
        candidates.push(variant);
        for (const prefix of OPERATOR_PREFIXES[operator] || []) {
            if (!variant.startsWith(prefix)) {
                candidates.push(prefix + variant);
            }
        }
        if (/線$/.test(variant) && !/本線$/.test(variant)) {
            candidates.push(variant.replace(/線$/, '本線'));
        }
    }
    return [...new Set(candidates)];
}

const stationName = station => station.title.ja.replace(/[()（）].*$/, '');

function scoreArticle(railway, stationLookup, text) {
    const names = [...new Set(railway.stations.map(id => stationLookup.get(id)).filter(Boolean).map(stationName))];

    if (names.length === 0) {
        return 0;
    }
    return names.filter(name => text.includes(name)).length / names.length;
}

// True if the railway on the map covers only a section of the article's line.
// Loops and articles without termini are treated as covering the whole line.
function isPartOfArticle(railway, stationLookup, wikitext) {
    const stations = railway.stations.map(id => stationLookup.get(id)).filter(station => station && !station.alternate),
        first = stations[0],
        last = stations[stations.length - 1],
        termini = [infoboxField(wikitext, ['起点']), infoboxField(wikitext, ['終点'])].filter(Boolean).join(' ');

    if (!first || !last || first === last || !termini) {
        return false;
    }
    return !termini.includes(stationName(first)) || !termini.includes(stationName(last));
}

async function fetchPage(lang, title) {
    const data = await api(lang, {
        action: 'query',
        redirects: '1',
        titles: title,
        prop: 'extracts|revisions|langlinks|pageprops',
        explaintext: '1',
        exsectionformat: 'wiki',
        rvprop: 'content',
        rvslots: 'main',
        rvsection: '0',
        lllang: lang === 'ja' ? 'en' : 'ja',
        ppprop: 'disambiguation'
    });
    const page = data.query.pages[0];

    if (!page || page.missing || (page.pageprops && 'disambiguation' in page.pageprops)) {
        return;
    }
    return {
        title: page.title,
        extract: page.extract || '',
        wikitext: page.revisions && page.revisions[0] ? page.revisions[0].slots.main.content : '',
        otherTitle: page.langlinks && page.langlinks[0] ? page.langlinks[0].title : undefined
    };
}

// ---------- Infobox ----------

function stripMarkup(input) {
    let value = input
        .replace(/\{\{\s*(?:start date(?: and age)?|開始日)\s*\|\s*(\d{4})\s*\|\s*(\d{1,2})\s*\|\s*(\d{1,2})[^{}]*\}\}/gi, '$1年$2月$3日')
        .replace(/&nbsp;|\u00a0/g, ' ')
        .replace(/<ref[^>]*\/>/g, '')
        .replace(/<ref[^>]*>[^]*?<\/ref>/g, '')
        .replace(/<!--[^]*?-->/g, '')
        .replace(/<br\s*\/?>/gi, ' ');
    let previous;

    // Templates can be nested, so strip the innermost ones repeatedly
    do {
        previous = value;
        value = value.replace(/\{\{[^{}]*\}\}/g, '');
    } while (value !== previous);

    return value
        .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1')
        .replace(/'''?/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function infoboxField(wikitext, names) {
    for (const name of names) {
        const match = wikitext.match(new RegExp(`^\\|\\s*${name}\\s*=([^]*?)(?=\\n\\s*\\|[^|=\\n]{1,20}=|\\n\\s*\\}\\})`, 'm'));

        const value = match && stripMarkup(match[1]);

        if (value) {
            return value;
        }
    }
}

function parseLength(wikitext) {
    const value = infoboxField(wikitext, ['路線距離', '営業キロ', '路線総延長', '総延長', 'linelength_km']),
        numbers = value ? [...value.matchAll(/([\d,]+(?:\.\d+)?)\s*(?:km|キロ)(?!\/)/gi)].map(match => Number(match[1].replace(/,/g, ''))) : [];

    if (!numbers.length && value && /^[\d,]+(?:\.\d+)?$/.test(value)) {
        numbers.push(Number(value.replace(/,/g, '')));
    }

    // Several segment lengths may be listed; the total is the largest
    return numbers.length ? Math.max(...numbers) : undefined;
}

function parseOpened(wikitext) {
    const value = infoboxField(wikitext, ['開業']);
    const match = value && value.match(/(\d{4})年(?:[（(][^）)]*[）)])?(?:(\d{1,2})月)?(?:(\d{1,2})日)?/);

    if (!match) {
        return;
    }
    const [, year, month, day] = match;

    return [year, month && month.padStart(2, '0'), month && day && day.padStart(2, '0')].filter(Boolean).join('-');
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

function parseHistoryJa(extract) {
    const body = section(extract, /^(歴史|沿革|歴史・沿革|沿革・歴史)/);
    const entries = [];
    let year;

    for (const raw of body.split('\n')) {
        const line = raw.trim();
        let rest = line;
        const yearMatch = line.match(/^(\d{4})年(?:[（(][^）)]*[）)])?(.*)$/);

        if (yearMatch) {
            year = yearMatch[1];
            rest = yearMatch[2].trim();
            if (!rest) {
                continue;
            }
        }
        const dateMatch = rest.match(/^(?:(\d{1,2})月(?:(\d{1,2})日|[上中下]旬)?)?\s*[：:]\s*(.+)$/);

        if (year && dateMatch && (yearMatch || /^\d{1,2}月/.test(rest))) {
            const [, month, day, text] = dateMatch,
                date = `${year}年${month ? `${month}月` : ''}${day ? `${day}日` : ''}`;

            entries.push({year, text: clean(text), label: date});
        }
    }
    const relevant = entries.filter(({text}) => /開業|開通|敷設|着工|免許|延伸|全通|複線|電化|運輸開始|営業開始|路線名|改称|国有化|統合|地下化|高架/.test(text));
    const picked = (relevant.length >= 4 ? relevant : entries).slice(0, MAX_HISTORY_JA);

    if (picked.length >= 3) {
        return picked.map(({label, text}) => shorten(`${label}：${text}`, MAX_JA_LENGTH));
    }

    const sentences = body
        .split('\n')
        .filter(line => !/^=+ /.test(line))
        .join('')
        .split('。')
        .map(clean)
        .filter(sentence => /\d{4}年/.test(sentence) && sentence.length > 15);

    return sentences.slice(0, MAX_HISTORY_JA).map(sentence => shorten(`${sentence}。`, MAX_JA_LENGTH * 1.6));
}

function parseHistoryEn(extract) {
    const body = section(extract, /^History$/i);
    const sentences = body
        .split('\n')
        .filter(line => line.trim() && !/^=+ /.test(line))
        .join(' ')
        .split(/(?<=[.!?])\s+(?=[A-Z"])/)
        .map(clean)
        .filter(sentence => /\b(1[89]\d\d|20\d\d)\b/.test(sentence) && sentence.length > 25);

    return sentences.slice(0, MAX_HISTORY_EN).map(sentence => shorten(sentence, MAX_EN_LENGTH));
}

function wikiUrl(lang, title) {
    return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`;
}

// ---------- Main ----------

async function main() {
    const railways = JSON.parse(fs.readFileSync('data/railways.json', 'utf8')),
        stations = JSON.parse(fs.readFileSync('data/stations.json', 'utf8')),
        stationLookup = new Map(stations.map(station => [station.id, station])),
        railwayLookup = new Map(railways.map(railway => [railway.id, railway])),
        overrides = fs.existsSync(OVERRIDES) ? JSON.parse(fs.readFileSync(OVERRIDES, 'utf8')) : {},
        curated = fs.existsSync('data/railway-history.json') ? JSON.parse(fs.readFileSync('data/railway-history.json', 'utf8')) : {},
        existing = fs.existsSync(OUTPUT) ? JSON.parse(fs.readFileSync(OUTPUT, 'utf8')) : {},
        only = new Set(process.argv.slice(2)),
        targets = railways.filter(railway => only.size === 0 || only.has(railway.id)),
        pageCache = new Map(),
        cachedFetch = (lang, title) => {
            const key = `${lang}:${title}`;

            if (!pageCache.has(key)) {
                pageCache.set(key, fetchPage(lang, title).catch(() => undefined));
            }
            return pageCache.get(key);
        },
        matches = new Map(),
        unresolved = [];

    console.log(`Matching ${targets.length} railways to Japanese Wikipedia articles...`);
    await mapLimit(targets, 4, async railway => {
        const override = overrides[railway.id];

        if (override && override.skip) {
            return;
        }
        const titles = override && override.ja ? [override.ja] : candidateTitles(railway);
        let best;

        for (const title of titles) {
            const page = await cachedFetch('ja', title);

            if (!page) {
                continue;
            }
            const score = override && override.ja ? 1 : scoreArticle(railway, stationLookup, page.extract);

            if (!best || score > best.score) {
                best = {page, score};
            }
            if (score >= 0.95) {
                break;
            }
        }
        if (best && best.score >= MATCH_THRESHOLD) {
            matches.set(railway.id, best);
        } else {
            unresolved.push(`${railway.id} (${railway.title.ja})${best ? ` best="${best.page.title}" score=${best.score.toFixed(2)}` : ''}`);
        }
    });

    const result = Object.assign({}, existing),
        today = new Date().toISOString().slice(0, 10);

    console.log(`Fetching details for ${matches.size} matched railways...`);
    await mapLimit([...matches], 4, async ([id, {page}]) => {
        const override = overrides[id] || {},
            enTitle = override.en || page.otherTitle,
            enPage = enTitle ? await cachedFetch('en', enTitle) : undefined,
            historyJa = parseHistoryJa(page.extract),
            historyEn = enPage ? parseHistoryEn(enPage.extract) : [],
            info = {
                wiki: {ja: page.title}
            },
            length = parseLength(page.wikitext),
            opened = parseOpened(page.wikitext);

        if (enPage) {
            info.wiki.en = enPage.title;
        }
        if (length !== undefined) {
            info.length = length;
        }
        if (opened) {
            info.opened = opened;
        }
        if (isPartOfArticle(railwayLookup.get(id), stationLookup, page.wikitext)) {
            info.part = true;
        }
        if ((historyJa.length || historyEn.length) && !curated[id]) {
            info.history = {sources: {}, sourceTitle: 'Wikipedia', updated: today};
            if (historyJa.length) {
                info.history.ja = historyJa;
                info.history.sources.ja = wikiUrl('ja', page.title);
            }
            if (historyEn.length) {
                info.history.en = historyEn;
                info.history.sources.en = wikiUrl('en', enPage.title);
            }
        }
        info.updated = today;
        result[id] = info;
    });

    const sorted = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a < b ? -1 : 1));

    fs.writeFileSync(OUTPUT, `${JSON.stringify(sorted, null, 1)}\n`);

    const values = Object.values(sorted);

    console.log(`\nWrote ${OUTPUT}: ${values.length} railways`);
    console.log(`  with length:     ${values.filter(v => v.length !== undefined).length}`);
    console.log(`  with opened:     ${values.filter(v => v.opened).length}`);
    console.log(`  with ja history: ${values.filter(v => v.history && v.history.ja).length}`);
    console.log(`  with en history: ${values.filter(v => v.history && v.history.en).length}`);
    if (unresolved.length) {
        console.log(`\nUnresolved (${unresolved.length}) - add them to ${OVERRIDES}:`);
        for (const line of unresolved.sort()) {
            console.log(`  ${line}`);
        }
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
