import {escapeHTML} from '../helpers/helpers';
import {getHistoryHTML} from '../helpers/helpers-history';
import Panel from './panel';

export default class extends Panel {

    constructor(options) {
        super(Object.assign({
            className: 'station-history-panel',
            modal: true
        }, options));
    }

    addTo(map) {
        const {object: stations, history} = this._options,
            {lang, dict} = map,
            titles = [];

        // Stations of different lines can share a name, so list each name once
        for (const station of stations) {
            const title = map.getLocalizedStationTitle(station);

            if (!titles.includes(title)) {
                titles.push(title);
            }
        }

        return super.addTo(map)
            .setTitle(escapeHTML(titles.join(dict['and'])))
            .setHTML([
                `<div class="card-title">${dict['history']}</div>`,
                '<div class="card-body">',
                getHistoryHTML(history, lang, dict),
                '</div>'
            ].join(''));
    }

    remove() {
        const onRemove = this._options.onRemove;

        super.remove();
        if (onRemove) {
            onRemove();
        }
        return this;
    }

}
