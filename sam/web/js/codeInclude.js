import { loadFile } from './file.js';
import { config } from './config.js';

async function includeCode(md, language) {
    const regex = new RegExp("\\{" + language.toLowerCase() + " ([^}]+)\\}");
    const match = md.match(regex);

    if (match) {
        console.log(match[0]); 
        let code = await loadFile('/add/'+config().content+'/'+match[1]);
        md = md.replace(match[0],'```'+language+'\n'+code+'\n```');
    }
    
    return md;
}

export { includeCode }