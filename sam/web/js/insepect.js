import { loadFile } from './file.js';
import { config } from './config.js';

function startsWithInspect(str) {
    return /^\{\s*"inspect/.test(str);
}

async function inspect(md) {

    const regex = /(\{[\s\S]*?\}|\[[\s\S]*?\])/g;
    let match;

    while ((match = regex.exec(md)) !== null) {
        if (startsWithInspect(match[0]) ) {
            try { 
                     
                const json = JSON.parse(match[0]);
                
                try {
                    let replacement = '';
                    if ( json.language == 'markdown') { 
                        replacement = await processMarkdown(json);
                    } else {
                        replacement = await fallback(json);
                    }

                    md = md.replace(match[0],replacement);

                } catch (e) {
                    md = md.replace(match[0],'```\n⛔ Error:\n>>>\n'+match[0]+'\n<<<\nfile to inspect not found!\n```');    
                    break;
                }
            } catch (e) {
                md = md.replace(match[0],'```\n⛔ Error:\n>>>\n'+match[0]+'\n<<<\nis an invalid inspect\n```');
                break;
            }
        }
    }
    return md;
}

async function processMarkdown(inspect) {
    let code = await loadFile('/add/'+config().content+'/'+inspect.inspect);
    if ( inspect.mode && inspect.mode == 'render') {
        return code;    
    }
    return '```'+inspect.language+'\n'+code+'\n```';
}

async function fallback(inspect) {
    let code = await loadFile('/add/'+config().content+'/'+inspect.inspect);
    return '```'+inspect.language+'\n'+code+'\n```';
}

export { inspect }