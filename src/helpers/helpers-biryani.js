import {escapeHTML} from './helpers';
import {getStationDetail, getStationTitle} from './helpers-boulangerie';

// An Indian flag on a pole. The base of the pole is at the bottom center.
export const INDIA_FLAG_SVG = [
    '<svg class="biryani-flag" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 44" width="40" height="44">',
    '<ellipse cx="20" cy="42" rx="7" ry="2.5" fill="rgba(0,0,0,.35)"/>',
    '<rect x="19" y="4" width="2" height="38" rx="1" fill="#555"/>',
    '<circle cx="20" cy="4" r="2.6" fill="#f0c040"/>',
    '<rect x="21" y="7" width="18" height="4" fill="#FF9933"/>',
    '<rect x="21" y="11" width="18" height="4" fill="#fff"/>',
    '<rect x="21" y="15" width="18" height="4" fill="#138808"/>',
    '<circle cx="30" cy="13" r="1.7" fill="none" stroke="#000080" stroke-width=".55"/>',
    '<circle cx="30" cy="13" r=".45" fill="#000080"/>',
    '<rect x="21" y="7" width="18" height="12" fill="none" stroke="#333" stroke-width=".8"/>',
    '</svg>'
].join('');

export function getBiryaniName(place, lang) {
    return lang === 'ja' && place.nameJa ? place.nameJa : place.name;
}

export function getBiryaniArea(place, lang) {
    return lang === 'ja' && place.areaJa ? place.areaJa : place.area;
}

/**
 * Returns the HTML of the compact popup shown while hovering over a biryani restaurant.
 * @param {Map} map - The Mini Tokyo 3D map
 * @param {Object} place - The restaurant
 * @returns {string} The HTML
 */
export function getBiryaniPopupHTML(map, place) {
    const {lang, dict} = map,
        [nearest] = place.stations;

    return [
        '<div class="biryani-popup-title">',
        `<strong>${escapeHTML(getBiryaniName(place, lang))}</strong>`,
        `<span class="biryani-area">${escapeHTML(getBiryaniArea(place, lang))}</span>`,
        '</div>',
        '<div class="biryani-fact">',
        `<span class="biryani-fact-label">${dict['nearest-station']}</span>`,
        '<span>',
        `<strong>${escapeHTML(getStationTitle(map, nearest.id))}</strong>`,
        `<span class="biryani-fact-note"> ${escapeHTML(getStationDetail(map, nearest))}</span>`,
        '</span>',
        '</div>',
        '<div class="biryani-fact">',
        `<span class="biryani-fact-label">${dict['served-label']}</span>`,
        `<span>${place.dishes.map(escapeHTML).join(' · ')}</span>`,
        '</div>',
        `<div class="railway-popup-hint">${dict['click-for-details']}</div>`
    ].join('');
}

/**
 * Returns the HTML of the details panel of a biryani restaurant.
 * @param {Map} map - The Mini Tokyo 3D map
 * @param {Object} place - The restaurant
 * @returns {string} The HTML
 */
export function getBiryaniDetailsHTML(map, place) {
    const dict = map.dict;

    return [
        '<div class="biryani-details">',
        `<div class="biryani-fact"><span class="biryani-fact-label">${dict['address']}</span><span>${escapeHTML(place.address)}</span></div>`,
        `<div class="card-title">${dict['nearest-station']}</div>`,
        '<div class="card-body">',
        place.stations.map(station => [
            '<div class="biryani-station-row">',
            '<div>',
            `<strong>${escapeHTML(getStationTitle(map, station.id))}</strong>`,
            `<div class="biryani-fact-note">${escapeHTML(getStationDetail(map, station))}</div>`,
            '</div>',
            `<button class="biryani-station-button" data-station="${escapeHTML(station.id)}">${dict['show-on-map']}</button>`,
            '</div>'
        ].join('')).join(''),
        '</div>',
        `<div class="card-title">${dict['served-label']}</div>`,
        '<div class="card-body">',
        '<ul class="history-bullet-list">',
        place.dishes.map(item => `<li>${escapeHTML(item)}</li>`).join(''),
        '</ul>',
        '</div>',
        `<div class="card-title">${dict['about-restaurant']}</div>`,
        `<div class="card-body"><p>${escapeHTML(place.about)}</p></div>`,
        '</div>'
    ].join('');
}
