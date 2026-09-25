import {loadJSON, saveJSON, buildLookup} from './helpers';

export default async function() {

    const [railwayHistoryData, data] = await Promise.all([
        'data/railway-history.json',
        'data/railways.json'
    ].map(loadJSON));

    const lookup = buildLookup(data);

    for (const railway of data) {
        const history = railwayHistoryData[railway.id];

        if (history) {
            railway.history = history;
        }
    }

    saveJSON('build/data/railways.json.gz', data.filter(({del}) => !del));

    console.log('Railway data was loaded');

    return lookup;

}
