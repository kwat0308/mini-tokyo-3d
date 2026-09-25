import {INDIA_FLAG_SVG, getBiryaniArea, getBiryaniDetailsHTML, getBiryaniName} from '../helpers/helpers-biryani';
import {escapeHTML} from '../helpers/helpers';
import Panel from './panel';

export default class extends Panel {

    constructor(options) {
        super(Object.assign({
            className: 'biryani-panel',
            modal: true
        }, options));
    }

    addTo(map) {
        const me = this,
            place = me._options.object,
            lang = map.lang;

        super.addTo(map)
            .setTitle([
                `<span class="biryani-title-flag">${INDIA_FLAG_SVG}</span>`,
                escapeHTML(getBiryaniName(place, lang)),
                ` <span class="biryani-area">${escapeHTML(getBiryaniArea(place, lang))}</span>`
            ].join(''))
            .setHTML(getBiryaniDetailsHTML(map, place));

        for (const button of me._container.querySelectorAll('.biryani-station-button')) {
            button.addEventListener('click', () => {
                me.remove();
                map.setSelection(button.getAttribute('data-station'));
            });
        }

        return me;
    }

}
