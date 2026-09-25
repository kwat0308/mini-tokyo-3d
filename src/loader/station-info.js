import {loadJSON, saveJSON} from './helpers';

export default async function() {

    const data = await loadJSON('data/station-info.json'),
        histories = {};

    // The app only needs the history, and it is what makes the file large, so
    // everything else (the article titles, the dates of the update) is left out
    for (const id of Object.keys(data)) {
        const {ja, en, sources, sourceTitle} = data[id].history || {};

        if (ja || en) {
            histories[id] = {ja, en, sources, sourceTitle};
        }
    }

    saveJSON('build/data/station-info.json.gz', histories);

    console.log('Station info data was loaded');

}
