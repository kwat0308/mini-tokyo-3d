// Indian restaurants highlighted by the biryani layer. Each one serves biryani and
// was found open on Tabelog or its own site in September 2026, in lists from the
// Michelin Guide, Tabelog, Time Out Tokyo and Tokyo food writers. Coordinates come
// from the GSI geocoder (Geospatial Information Authority of Japan) for `address`,
// except Bangera's Kitchen, whose "銀座西" address GSI does not know, so the
// OpenStreetMap building point is used. `stations` are ordered from the nearest;
// `distance` is the straight-line distance in meters (rounded to 10) to the
// station in this app's own station data. The descriptions are in English only.
export default [
    {
        id: 'biryani-osawa',
        name: 'Biryani Osawa',
        nameJa: 'ビリヤニ大澤',
        area: 'Kanda / Ogawamachi',
        areaJa: '神田・小川町',
        address: '東京都千代田区内神田1-15-12 内神田サトウビル B1F',
        coord: [139.76598, 35.69224],
        stations: [
            {id: 'Toei.Shinjuku.Ogawamachi', distance: 310},
            {id: 'TokyoMetro.Marunouchi.Awajicho', distance: 320},
            {id: 'JR-East.Yamanote.Kanda', distance: 430},
            {id: 'TokyoMetro.Chiyoda.ShinOchanomizu', distance: 520}
        ],
        dishes: ['Mutton biryani', 'chicken biryani (one variety per sitting)'],
        about: 'Serves nothing but biryani: one variety per sitting, cooked to finish just as everyone is seated at a 10-seat horseshoe counter. Reservation-only, booked online up to a week ahead. Michelin Bib Gourmand (2026) and a Tabelog Asian/Ethnic Top 100 restaurant.'
    },
    {
        id: 'biryani-master',
        name: 'BIRYANI MASTER',
        nameJa: 'ビリヤニマスター',
        area: 'Kanda / Ogawamachi',
        areaJa: '神田・小川町',
        address: '東京都千代田区神田司町2-15-16 サトウビル 2F',
        coord: [139.76671, 35.69403],
        stations: [
            {id: 'Toei.Shinjuku.Ogawamachi', distance: 110},
            {id: 'TokyoMetro.Marunouchi.Awajicho', distance: 110},
            {id: 'TokyoMetro.Chiyoda.ShinOchanomizu', distance: 340},
            {id: 'TokyoMetro.Ginza.Kanda', distance: 380}
        ],
        dishes: ['Chicken biryani', 'mutton biryani', 'half-and-half plate'],
        about: 'The walk-in sister shop of Biryani Osawa, opened in May 2026. Weekday lunch only, no reservations, and it closes when the pot is empty. Long queues have been reported.'
    },
    {
        id: 'johnnys-biryani',
        name: 'Johnny\'s Biryani Kanda',
        nameJa: 'ジョニーのビリヤニ 神田店',
        area: 'Kanda',
        areaJa: '神田',
        address: '東京都千代田区内神田3-8-1',
        coord: [139.76991, 35.69081],
        stations: [
            {id: 'JR-East.Yamanote.Kanda', distance: 110},
            {id: 'JR-East.SobuRapid.ShinNihombashi', distance: 440},
            {id: 'TokyoMetro.Marunouchi.Awajicho', distance: 500},
            {id: 'TokyoMetro.Ginza.Mitsukoshimae', distance: 520}
        ],
        dishes: ['Daily biryani (the variety changes)', 'chicken biryani'],
        about: 'Tokyo branch of a biryani specialist from Ishikawa, opened in June 2024. Five counter seats, take-out available, and it closes as soon as it sells out.'
    },
    {
        id: 'shahi-dawat',
        name: 'Shahi Dawat',
        nameJa: 'シャヒ・ダワット',
        area: 'Kanda / Ogawamachi',
        areaJa: '神田・小川町',
        address: '東京都千代田区神田錦町2-2-11 田口ビル B1F',
        coord: [139.76321, 35.69321],
        stations: [
            {id: 'Toei.Shinjuku.Ogawamachi', distance: 350},
            {id: 'TokyoMetro.Marunouchi.Awajicho', distance: 420},
            {id: 'TokyoMetro.Chiyoda.ShinOchanomizu', distance: 460},
            {id: 'Toei.Mita.Jimbocho', distance: 510}
        ],
        dishes: ['Biryani'],
        about: 'A long-established basement Indian restaurant near Ogawamachi, picked out by Tabelog Magazine\'s biryani enthusiast for its authentic biryani.'
    },
    {
        id: 'torkari',
        name: 'Torkari Jimbocho',
        nameJa: 'トルカリ 神保町本店',
        area: 'Jimbocho',
        areaJa: '神保町',
        address: '東京都千代田区神田神保町2-34 Phoenix神保町ビル 1F',
        coord: [139.75525, 35.69739],
        stations: [
            {id: 'TokyoMetro.Hanzomon.Jimbocho', distance: 260},
            {id: 'Toei.Shinjuku.Kudanshita', distance: 380},
            {id: 'JR-East.ChuoSobuLocal.Suidobashi', distance: 550}
        ],
        dishes: [
            'Bengali dum biryani (bone-in chicken set with raita and jhol curry)',
            'bhorta and bhaji',
            'khichuri'
        ],
        about: 'East and West Bengal home cooking. Biryani is listed as one of its special-occasion dishes, made by the low-temperature "dum" method so the rice stays fluffy and takes on the flavor of the meat.'
    },
    {
        id: 'sri-balaji',
        name: 'Sri Balaji Suidobashi',
        nameJa: 'シリ バラジ 水道橋店',
        area: 'Suidobashi / Jimbocho',
        areaJa: '水道橋・神保町',
        address: '東京都千代田区西神田2-1-11 エスティエラ水道橋 1F・2F',
        coord: [139.75636, 35.69896],
        stations: [
            {id: 'TokyoMetro.Hanzomon.Jimbocho', distance: 340},
            {id: 'JR-East.ChuoSobuLocal.Suidobashi', distance: 440},
            {id: 'TokyoMetro.Tozai.Kudanshita', distance: 560},
            {id: 'TokyoMetro.Marunouchi.Ochanomizu', distance: 710}
        ],
        dishes: ['Chicken biryani', 'South Indian meals'],
        about: 'A South Indian restaurant open since 2008. The biryani is scented with cumin, coriander, cardamom, clove and cinnamon.'
    },
    {
        id: 'biryani-suisanshitsu',
        name: 'Biryani Suisanshitsu',
        nameJa: 'ビリヤニすいさんしつ 日本橋店',
        area: 'Nihonbashi-Honcho',
        areaJa: '日本橋本町',
        address: '東京都中央区日本橋本町3-11-10 BONUS BLD 2F',
        coord: [139.77733, 35.6889],
        stations: [
            {id: 'TokyoMetro.Hibiya.Kodemmacho', distance: 210},
            {id: 'JR-East.SobuRapid.ShinNihombashi', distance: 280},
            {id: 'TokyoMetro.Ginza.Mitsukoshimae', distance: 390},
            {id: 'Toei.Asakusa.Ningyocho', distance: 530}
        ],
        dishes: ['Original chicken biryani', 'Hyderabad chicken biryani', 'mutton biryani set'],
        about: 'Formerly "Nagashi no Biryani Stand": the permanent shop of a wandering biryani cook who has held biryani pop-ups since 2017, with a weekly-changing menu. Reviewers describe a gentler, Japanese-style take with less heat.'
    },
    {
        id: 'nawab-kayabacho',
        name: 'Nawab Biryani House Kayabacho',
        nameJa: 'ナワブ ビリヤニ ハウス 茅場町店',
        area: 'Kayabacho',
        areaJa: '茅場町',
        address: '東京都中央区日本橋茅場町1-11-4 小林ビル 1F',
        coord: [139.78052, 35.6795],
        stations: [
            {id: 'TokyoMetro.Hibiya.Kayabacho', distance: 90},
            {id: 'Toei.Asakusa.Nihombashi', distance: 500},
            {id: 'TokyoMetro.Hibiya.Hatchobori', distance: 540},
            {id: 'TokyoMetro.Hanzomon.Suitengumae', distance: 570}
        ],
        dishes: ['Chicken dum biryani', 'lamb korma', 'curry sets'],
        about: 'Pakistani-style biryani, opened in 2015 as a stand-up counter. From the counter seats you can watch the rice being layered and mixed.'
    },
    {
        id: 'erick-south-yaesu',
        name: 'ERICK SOUTH Yaesu',
        nameJa: 'エリックサウス 八重洲店',
        area: 'Yaesu / Tokyo Station',
        areaJa: '八重洲・東京駅',
        address: '東京都中央区八重洲2-1 八重洲地下街 中4号',
        coord: [139.76961, 35.67986],
        stations: [
            {id: 'JR-East.Yamanote.Tokyo', distance: 280},
            {id: 'TokyoMetro.Ginza.Kyobashi', distance: 350},
            {id: 'TokyoMetro.Ginza.Nihombashi', distance: 400},
            {id: 'Toei.Asakusa.Takaracho', distance: 520}
        ],
        dishes: ['Chicken biryani plate (M or L)', 'South Indian meals'],
        about: 'A South Indian counter in the Yaesu Underground Shopping Street, a short walk from Tokyo Station. The biryani plate comes with curry and raita; there is no naan on the menu.'
    },
    {
        id: 'andhra-dining-ginza',
        name: 'Andhra Dining Ginza',
        nameJa: 'アーンドラ・ダイニング 銀座',
        area: 'Ginza',
        areaJa: '銀座',
        address: '東京都中央区銀座1-8-2 銀座プルミエビル 2F',
        coord: [139.76906, 35.67458],
        stations: [
            {id: 'TokyoMetro.Yurakucho.GinzaItchome', distance: 210},
            {id: 'TokyoMetro.Ginza.Kyobashi', distance: 250},
            {id: 'Toei.Asakusa.Takaracho', distance: 290},
            {id: 'TokyoMetro.Ginza.Ginza', distance: 480}
        ],
        dishes: ['Hyderabadi dum biryani (Saturday special)', 'Andhra meals (thali)'],
        about: 'Andhra Pradesh cooking that has earned a Michelin Bib Gourmand listing and a run in Tabelog\'s Curry Top 100. A special biryani is offered on Saturdays.'
    },
    {
        id: 'khan-kebab-biryani',
        name: 'Khan Kebab Biryani',
        nameJa: 'カーン・ケバブ・ビリヤニ',
        area: 'Shimbashi / Ginza',
        areaJa: '新橋・銀座',
        address: '東京都中央区銀座8-8-11 銀座博品館 6F',
        coord: [139.76106, 35.66774],
        stations: [
            {id: 'TokyoMetro.Ginza.Shimbashi', distance: 230},
            {id: 'Toei.Oedo.Shiodome', distance: 510},
            {id: 'TokyoMetro.Hibiya.Ginza', distance: 540},
            {id: 'Toei.Mita.Uchisaiwaicho', distance: 550}
        ],
        dishes: ['Lamb biryani', 'chicken biryani', 'kebabs'],
        about: 'Basmati rice and spicy stock cooked together in a sealed pot, on the 6th floor of the Hakuhinkan toy-store building. Popular with Tokyo\'s Indian community; sister shop of Halima Kebab Biryani in Ueno.'
    },
    {
        id: 'bangeras-kitchen',
        name: 'Bangera\'s Kitchen',
        nameJa: 'バンゲラズ キッチン',
        area: 'Ginza / Yurakucho',
        areaJa: '銀座・有楽町',
        address: '東京都中央区銀座西2-2 銀座インズ2 2F',
        coord: [139.76489, 35.67485],
        stations: [
            {id: 'TokyoMetro.Yurakucho.GinzaItchome', distance: 180},
            {id: 'JR-East.Yamanote.Yurakucho', distance: 180},
            {id: 'TokyoMetro.Marunouchi.Ginza', distance: 270},
            {id: 'TokyoMetro.Hibiya.Hibiya', distance: 390}
        ],
        dishes: ['Mangalorean fish biryani', 'fish curry'],
        about: 'Billed as Japan\'s first Mangalore-cuisine specialist, cooking the seafood-rich food of India\'s south-west coast. The biryani is served in a bamboo container.'
    },
    {
        id: 'nandhini-toranomon',
        name: 'Nandhini Toranomon',
        nameJa: 'ナンディニ 虎ノ門店',
        area: 'Toranomon / Shimbashi',
        areaJa: '虎ノ門・新橋',
        address: '東京都港区西新橋2-22-1 ル・グラシエルBLDG4 1F',
        coord: [139.75276, 35.66561],
        stations: [
            {id: 'JR-East.Yamanote.Shimbashi', distance: 470},
            {id: 'Toei.Mita.Uchisaiwaicho', distance: 480},
            {id: 'TokyoMetro.Hibiya.ToranomonHills', distance: 500},
            {id: 'Toei.Mita.Onarimon', distance: 550}
        ],
        dishes: ['Mutton biryani (served in a metal pot)', 'non-veg meals'],
        about: 'South Indian restaurant whose biryani arrives in a metal container with fluffy rice and a strong spice aroma. The non-veg meals set has more than 17 components.'
    },
    {
        id: 'halima-kebab-biryani',
        name: 'Halima Kebab Biryani',
        nameJa: 'ハリマ・ケバブ・ビリヤニ',
        area: 'Ueno / Inaricho',
        areaJa: '上野・稲荷町',
        address: '東京都台東区東上野3-36-7 1F',
        coord: [139.7803, 35.71158],
        stations: [
            {id: 'TokyoMetro.Ginza.Inaricho', distance: 210},
            {id: 'TokyoMetro.Hibiya.Ueno', distance: 290},
            {id: 'MIR.TsukubaExpress.ShinOkachimachi', distance: 530},
            {id: 'Keisei.Main.KeiseiUeno', distance: 620}
        ],
        dishes: ['Lamb biryani', 'chicken biryani', 'kebabs and curries'],
        about: 'Known for generous portions of lamb biryani marinated in a spicy sauce, with several free side dishes. Sister shop of Khan Kebab Biryani in Ginza.'
    },
    {
        id: 'andhra-kitchen',
        name: 'Andhra Kitchen',
        nameJa: 'アーンドラ・キッチン',
        area: 'Ueno / Okachimachi',
        areaJa: '上野・御徒町',
        address: '東京都台東区上野3-20-2 水野ビル B1F',
        coord: [139.77396, 35.70568],
        stations: [
            {id: 'JR-East.Yamanote.Okachimachi', distance: 170},
            {id: 'TokyoMetro.Hibiya.NakaOkachimachi', distance: 230},
            {id: 'TokyoMetro.Ginza.UenoHirokoji', distance: 250},
            {id: 'Toei.Oedo.UenoOkachimachi', distance: 260}
        ],
        dishes: ['Hyderabadi dum biryani (mutton)', 'Andhra meals'],
        about: 'Andhra Pradesh cooking by Indian chefs in a basement near Okachimachi, with generous portions. A Tabelog Asian/Ethnic Top 100 restaurant for 2026.'
    },
    {
        id: 'veg-kitchen',
        name: 'Veg Kitchen',
        nameJa: 'ベジキッチン',
        area: 'Ueno / Naka-Okachimachi',
        areaJa: '上野・仲御徒町',
        address: '東京都台東区台東3-44-8',
        coord: [139.77783, 35.70547],
        stations: [
            {id: 'TokyoMetro.Hibiya.NakaOkachimachi', distance: 200},
            {id: 'JR-East.Yamanote.Okachimachi', distance: 350},
            {id: 'MIR.TsukubaExpress.ShinOkachimachi', distance: 420},
            {id: 'Toei.Oedo.UenoOkachimachi', distance: 490}
        ],
        dishes: ['Vegetable biryani', 'masala dosa'],
        about: 'A fully vegetarian Indian restaurant, so the biryani here is a vegetable one. A Tabelog Asian/Ethnic Top 100 restaurant from 2022 to 2024.'
    },
    {
        id: 'andhra-dining-shibuya',
        name: 'Andhra Dining Shibuya',
        nameJa: 'アーンドラ・ダイニング 渋谷',
        area: 'Shibuya',
        areaJa: '渋谷',
        address: '東京都渋谷区宇田川町32-7 HULIC&New UDAGAWA 4F',
        coord: [139.69705, 35.66108],
        stations: [
            {id: 'Keio.Inokashira.Shibuya', distance: 370},
            {id: 'Keio.Inokashira.Shinsen', distance: 560}
        ],
        dishes: ['Hyderabadi dum biryani (on selected days)', 'Andhra meals'],
        about: 'The Shibuya branch of Andhra Dining, a few minutes from the station. Hyderabad-style biryani is its signature, offered on limited days.'
    },
    {
        id: 'erick-south-masala-diner',
        name: 'ERICK SOUTH Masala Diner',
        nameJa: 'エリックサウス マサラダイナー',
        area: 'Jingumae / Harajuku',
        areaJa: '神宮前・原宿',
        address: '東京都渋谷区神宮前6-19-17 GEMS神宮前 5F',
        coord: [139.70229, 35.66372],
        stations: [
            {id: 'TokyoMetro.Hanzomon.Shibuya', distance: 490},
            {id: 'TokyoMetro.Fukutoshin.MeijiJingumae', distance: 570}
        ],
        dishes: ['Hyderabad-style bone-in mutton biryani', 'South Indian meals', 'stone-oven grills'],
        about: 'The modern, stone-oven-grill side of the Erick South family, on the 5th floor of GEMS Jingumae.'
    },
    {
        id: 'sitaara-aoyama',
        name: 'Sitaara Aoyama',
        nameJa: 'シターラ 青山店',
        area: 'Omotesando / Aoyama',
        areaJa: '表参道・青山',
        address: '東京都港区南青山5-7-17 小原流会館 B1F',
        coord: [139.71281, 35.66269],
        stations: [
            {id: 'TokyoMetro.Ginza.OmoteSando', distance: 260}
        ],
        dishes: [
            'Biryani set with two bone-in chicken pieces',
            'chicken curry, raita and pakora on the side'
        ],
        about: 'An Indian restaurant in the basement of Ohara Hall. The biryani set hides two bone-in chicken pieces in moist, mildly spiced rice.'
    },
    {
        id: 'biryani-tokyo',
        name: 'Biryani Tokyo',
        nameJa: 'ビリヤニ トウキョウ',
        area: 'Takadanobaba / Omokagebashi',
        areaJa: '高田馬場・面影橋',
        address: '東京都新宿区高田馬場2-4-11 KSEビル 1F',
        coord: [139.70979, 35.71336],
        stations: [
            {id: 'Seibu.Shinjuku.Takadanobaba', distance: 310},
            {id: 'Toei.Arakawa.Omokagebashi', distance: 400},
            {id: 'Toei.Arakawa.Gakushuinshita', distance: 410},
            {id: 'TokyoMetro.Fukutoshin.NishiWaseda', distance: 620}
        ],
        dishes: ['Biryani (including a half-and-half plate)', 'grilled kebabs'],
        about: 'A biryani specialist opened in December 2024 by two Indian co-owners, with a chef from a five-star Indian hotel. Counter seats plus an open terrace; families and pets welcome.'
    },
    {
        id: 'katchar-batchar',
        name: 'Katchar Batchar',
        nameJa: 'カッチャルバッチャル',
        area: 'Otsuka',
        areaJa: '大塚',
        address: '東京都豊島区南大塚3-2-10 林ビル 2F',
        coord: [139.72949, 35.72731],
        stations: [
            {id: 'TokyoMetro.Marunouchi.ShinOtsuka', distance: 170},
            {id: 'Toei.Arakawa.OtsukaEkimae', distance: 430},
            {id: 'Toei.Arakawa.Mukohara', distance: 460},
            {id: 'JR-East.Yamanote.Otsuka', distance: 500}
        ],
        dishes: ['Chicken biryani', 'lamb biryani', 'butter chicken curry'],
        about: 'A perennial Tokyo Indian favorite: Michelin Bib Gourmand (2026) and a repeat high-ranker in Tabelog\'s curry rankings, with biryani on the regular menu.'
    },
    {
        id: 'marhaba',
        name: 'Marhaba',
        nameJa: 'マルハバ',
        area: 'Ikebukuro',
        areaJa: '池袋',
        address: '東京都豊島区池袋2-63-6 パレスガーデンミラノ 1F',
        coord: [139.71065, 35.73513],
        stations: [
            {id: 'Tobu.Tojo.Ikebukuro', distance: 440},
            {id: 'Tobu.Tojo.KitaIkebukuro', distance: 780}
        ],
        dishes: ['Mutton biryani', 'chicken karahi'],
        about: 'A Pakistani restaurant. The biryani uses 100% Pakistani basmati and is moist and lightly seasoned. Also famous for its brain masala.'
    },
    {
        id: 'erick-south-koenji',
        name: 'ERICK SOUTH Koenji Curry & Biryani Centre',
        nameJa: 'エリックサウス 高円寺カレー&ビリヤニセンター',
        area: 'Koenji',
        areaJa: '高円寺',
        address: '東京都杉並区高円寺南4-49-1',
        coord: [139.6514, 35.7054],
        stations: [
            {id: 'JR-East.ChuoRapid.Koenji', distance: 170}
        ],
        dishes: [
            'Hyderabadi-style biryani (chicken, mutton, fish)',
            'royal kacchi biryani',
            'Tamil-style biryani'
        ],
        about: 'Under the railway arches, with six or more kinds of biryani on the menu at all times. Each is cooked and served in its own small pot and you lift the lid yourself. Opened in 2020; a Tabelog Asian/Ethnic Top 100 restaurant for 2026.'
    },
    {
        id: 'biryani-mujina',
        name: 'Biryani Mujina',
        nameJa: 'ビリヤニ 狢',
        area: 'Minami-Asagaya',
        areaJa: '南阿佐ヶ谷',
        address: '東京都杉並区成田東5-20-6 フラットガーデン 1F',
        coord: [139.63088, 35.70098],
        stations: [
            {id: 'TokyoMetro.Marunouchi.MinamiAsagaya', distance: 460},
            {id: 'JR-East.ChuoRapid.Asagaya', distance: 590}
        ],
        dishes: ['Chicken biryani', 'mutton biryani', 'silver salmon and raisin biryani'],
        about: 'A biryani specialist run by a solo Japanese chef, opened in December 2023, known for creative variations such as silver salmon with raisins.'
    },
    {
        id: 'mashal',
        name: 'Mashal',
        nameJa: 'インド宮廷料理 マシャール',
        area: 'Omori',
        areaJa: '大森',
        address: '東京都大田区大森北1-10-14 LUZ大森 3F',
        coord: [139.72807, 35.5864],
        stations: [
            {id: 'JR-East.KeihinTohokuNegishi.Omori', distance: 270},
            {id: 'Keikyu.Main.Omorikaigan', distance: 650}
        ],
        dishes: ['Mutton dum biryani (steamed in a sealed pot)', 'Mughlai dishes'],
        about: 'Mughlai "royal court" cooking a couple of minutes from Omori Station, opened in July 2022. The dum biryani layers basmati and spiced mutton and steams them together in a pot.'
    },
    {
        id: 'nandhini-kiyosumi',
        name: 'Nandhini Kiyosumi-Shirakawa',
        nameJa: 'ナンディニ 清澄白河店',
        area: 'Kiyosumi-Shirakawa',
        areaJa: '清澄白河',
        address: '東京都江東区三好3-11-8 三好3丁目ビル 1F',
        coord: [139.8065, 35.68122],
        stations: [
            {id: 'TokyoMetro.Hanzomon.KiyosumiShirakawa', distance: 610},
            {id: 'Toei.Shinjuku.Kikukawa', distance: 800}
        ],
        dishes: ['Chicken biryani', 'South Indian meals', 'porotta'],
        about: 'A popular South Indian restaurant run by chefs from South India, in the café neighborhood of Kiyosumi-Shirakawa.'
    },
    {
        id: 'lucknowi',
        name: 'Lucknowi Family Restaurant',
        nameJa: 'ラクナウィ ファミリーレストラン',
        area: 'Funabori',
        areaJa: '船堀',
        address: '東京都江戸川区東小松川4-49-11 2F',
        coord: [139.86635, 35.68901],
        stations: [
            {id: 'Toei.Shinjuku.Funabori', distance: 620}
        ],
        dishes: ['Lucknowi chicken dum biryani', 'chapli kebab', 'mutton achari'],
        about: 'Awadhi cooking from Lucknow, home of one of India\'s classic biryani styles, opened in October 2024. Reviewers praise the light, fluffy biryani for its price.'
    },
    {
        id: 'hunza',
        name: 'Spice Cafe HUNZA',
        nameJa: 'スパイスカフェ フンザ',
        area: 'Kasai',
        areaJa: '葛西',
        address: '東京都江戸川区中葛西3-29-1 スワロービル 1F',
        coord: [139.8725, 35.66569],
        stations: [
            {id: 'TokyoMetro.Tozai.Kasai', distance: 230}
        ],
        dishes: ['Chicken, mutton, shrimp or vegetable biryani', 'butter chicken curry'],
        about: 'Halal Indian-Pakistani cooking by a chef trained at a five-star Indian hotel. The biryani is layered and steamed, and is as popular as the butter chicken.'
    }
];
