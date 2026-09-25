import {loadJSON, saveJSON} from './helpers';

export default async function() {

    const data = await loadJSON('data/railway-info.json');

    saveJSON('build/data/railway-info.json.gz', data);

    console.log('Railway info data was loaded');

}
