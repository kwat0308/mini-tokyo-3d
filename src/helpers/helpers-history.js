import {escapeHTML} from './helpers';

/**
 * Returns the history bullets in the given language, falling back to English
 * and then Japanese when there is no text in that language.
 * @param {Object} history - The history object (language codes mapped to arrays
 *     of bullets, plus source information)
 * @param {string} lang - The preferred language
 * @returns {Object} Object with the following properties:
 *     - language: The language actually used
 *     - bullets: Array of bullet texts
 *     - source: URL of the Wikipedia article the bullets came from
 */
export function getHistory(history, lang) {
    const language = history && [lang, 'en', 'ja'].find(l => history[l] && history[l].length);

    if (!language) {
        return;
    }
    return {
        language,
        bullets: history[language],
        source: (history.sources && history.sources[language]) || history.source
    };
}

/**
 * Returns the HTML of the history bullet list followed by the source credit
 * that the Wikipedia license (CC BY-SA) requires.
 * @param {Object} history - The history object
 * @param {string} lang - The preferred language
 * @param {Object} dict - The dictionary
 * @param {number} [limit] - Maximum number of bullets to show
 * @returns {string} The HTML, or an empty string if there is no history
 */
export function getHistoryHTML(history, lang, dict, limit) {
    const found = getHistory(history, lang);

    if (!found) {
        return '';
    }
    return [
        '<ul class="history-bullet-list">',
        found.bullets.slice(0, limit).map(bullet => `<li>${escapeHTML(bullet)}</li>`).join(''),
        '</ul>',
        '<div class="history-source">',
        `${dict['history-source']} `,
        `<a href="${escapeHTML(found.source)}" target="_blank" rel="noopener">${escapeHTML(history.sourceTitle)}</a>`,
        '</div>'
    ].join('');
}
