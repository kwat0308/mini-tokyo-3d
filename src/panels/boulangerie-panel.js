import {FLAG_SVG, getBoulangerieArea, getBoulangerieDetailsHTML, getBoulangerieName} from '../helpers/helpers-boulangerie';
import {escapeHTML} from '../helpers/helpers';
import Panel from './panel';

export default class extends Panel {

    constructor(options) {
        super(Object.assign({
            className: 'boulangerie-panel',
            modal: true
        }, options));
    }

    addTo(map) {
        const me = this,
            shop = me._options.object,
            lang = map.lang;

        super.addTo(map)
            .setTitle([
                `<span class="boulangerie-title-flag">${FLAG_SVG}</span>`,
                escapeHTML(getBoulangerieName(shop, lang)),
                ` <span class="boulangerie-area">${escapeHTML(getBoulangerieArea(shop, lang))}</span>`
            ].join(''))
            .setHTML(getBoulangerieDetailsHTML(map, shop));

        for (const button of me._container.querySelectorAll('.boulangerie-station-button')) {
            button.addEventListener('click', () => {
                me.remove();
                map.setSelection(button.getAttribute('data-station'));
            });
        }

        return me;
    }

}
