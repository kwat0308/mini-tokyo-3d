import {getHistoryHTML} from '../helpers/helpers-history';
import Panel from './panel';

export default class extends Panel {

    constructor(options) {
        super(Object.assign({
            className: 'railway-history-panel',
            modal: true
        }, options));
    }

    addTo(map) {
        const railway = this._options.object,
            {lang, dict} = map,
            history = map.getRailwayHistory(railway);

        return super.addTo(map)
            .setTitle([
                `<span class="railway-title-strip" style="background-color: ${railway.color};"></span>`,
                map.getLocalizedRailwayTitle(railway)
            ].join(''))
            .setHTML([
                map.getRailwayFactsHTML(railway),
                history ? [
                    `<div class="card-title">${dict['history']}</div>`,
                    '<div class="card-body">',
                    getHistoryHTML(history, lang, dict),
                    '</div>'
                ].join('') : ''
            ].join(''));
    }

}
