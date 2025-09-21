import { loadFile } from '../file.js';

async function exec(md) {
    const match = md.match(/\{java=([^}]+)\}/);

    if (match) {
        console.log(match[0]); 
        let code = await loadFile('/add/ebs-arc42/'+match[1]);
        md = md.replace(match[0],'```Java\n'+code+'\n```');
    }
    
    return md;
}

export {exec}