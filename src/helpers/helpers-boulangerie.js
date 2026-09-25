import {escapeHTML} from './helpers';

// A French flag on a pole. The base of the pole is at the bottom center.
export const FLAG_SVG = [
    '<svg class="boulangerie-flag" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">',
    '<ellipse cx="16" cy="42" rx="7" ry="2.5" fill="rgba(0,0,0,.35)"/>',
    '<rect x="15" y="4" width="2" height="38" rx="1" fill="#555"/>',
    '<circle cx="16" cy="4" r="2.6" fill="#f0c040"/>',
    '<rect x="17" y="7" width="4.7" height="16" fill="#0055A4"/>',
    '<rect x="21.7" y="7" width="4.6" height="16" fill="#fff"/>',
    '<rect x="26.3" y="7" width="4.7" height="16" fill="#EF4135"/>',
    '<rect x="17" y="7" width="14" height="16" fill="none" stroke="#333" stroke-width=".8"/>',
    '</svg>'
].join('');

export function getBoulangerieName(shop, lang) {
    return lang === 'ja' && shop.nameJa ? shop.nameJa : shop.name;
}

export function getBoulangerieArea(shop, lang) {
    return lang === 'ja' && shop.areaJa ? shop.areaJa : shop.area;
}

export function getStationTitle(map, id) {
    const station = map.stations.get(id);

    return station ? map.getLocalizedStationTitle(station) : id;
}

export function getStationDetail(map, {distance, walk}) {
    const dict = map.dict,
        parts = [];

    if (walk) {
        parts.push(dict[/[–-]/.test(walk) ? 'walk-minutes' : 'walk-minutes-approx'].replace('$1', walk));
    }
    if (distance) {
        parts.push(dict['straight-line'].replace('$1', distance));
    }
    return parts.join(' · ');
}

/**
 * Returns the HTML of the compact popup shown while hovering over a bakery.
 * @param {Map} map - The Mini Tokyo 3D map
 * @param {Object} shop - The bakery
 * @returns {string} The HTML
 */
export function getBoulangeriePopupHTML(map, shop) {
    const {lang, dict} = map,
        [nearest] = shop.stations;

    return [
        '<div class="boulangerie-popup-title">',
        `<strong>${escapeHTML(getBoulangerieName(shop, lang))}</strong>`,
        `<span class="boulangerie-area">${escapeHTML(getBoulangerieArea(shop, lang))}</span>`,
        '</div>',
        '<div class="boulangerie-fact">',
        `<span class="boulangerie-fact-label">${dict['nearest-station']}</span>`,
        '<span>',
        `<strong>${escapeHTML(getStationTitle(map, nearest.id))}</strong>`,
        `<span class="boulangerie-fact-note"> ${escapeHTML(getStationDetail(map, nearest))}</span>`,
        '</span>',
        '</div>',
        '<div class="boulangerie-fact">',
        `<span class="boulangerie-fact-label">${dict['try-label']}</span>`,
        `<span>${shop.tryItems.map(escapeHTML).join(' · ')}</span>`,
        '</div>',
        `<div class="railway-popup-hint">${dict['click-for-details']}</div>`
    ].join('');
}

/**
 * Returns the HTML of the details panel of a bakery.
 * @param {Map} map - The Mini Tokyo 3D map
 * @param {Object} shop - The bakery
 * @returns {string} The HTML
 */
export function getBoulangerieDetailsHTML(map, shop) {
    const dict = map.dict;

    return [
        '<div class="boulangerie-details">',
        `<div class="boulangerie-fact"><span class="boulangerie-fact-label">${dict['address']}</span><span>${escapeHTML(shop.address)}</span></div>`,
        `<div class="card-title">${dict['nearest-station']}</div>`,
        '<div class="card-body">',
        shop.stations.map(station => [
            '<div class="boulangerie-station-row">',
            '<div>',
            `<strong>${escapeHTML(getStationTitle(map, station.id))}</strong>`,
            `<div class="boulangerie-fact-note">${escapeHTML(getStationDetail(map, station))}</div>`,
            '</div>',
            `<button class="boulangerie-station-button" data-station="${escapeHTML(station.id)}">${dict['show-on-map']}</button>`,
            '</div>'
        ].join('')).join(''),
        '</div>',
        `<div class="card-title">${dict['try-label']}</div>`,
        '<div class="card-body">',
        '<ul class="history-bullet-list">',
        shop.tryItems.map(item => `<li>${escapeHTML(item)}</li>`).join(''),
        '</ul>',
        '</div>',
        `<div class="card-title">${dict['about-bakery']}</div>`,
        `<div class="card-body"><p>${escapeHTML(shop.about)}</p></div>`,
        `<div class="card-title">${dict['about-station']}</div>`,
        `<div class="card-body"><p>${escapeHTML(shop.stationFact)}</p></div>`,
        '</div>'
    ].join('');
}
