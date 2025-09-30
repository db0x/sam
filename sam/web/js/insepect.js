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
                    } else if ( json.language == 'java') { 
                        replacement = await processJava(json);
                    } else if ( json.language == 'yml') { 
                        replacement = await processYml(json);
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
        if ( inspect.offset ) {
            return shiftMarkdownHeadings(code, inspect.offset);
        }
        return code;    
    }
    return '```'+inspect.language+'\n'+code+'\n```';
}

async function processJava(inspect) {
    let code = await loadFile('/add/'+config().content+'/'+inspect.inspect);
    if ( inspect.mode && inspect.mode == 'lines') {
        return '```'+inspect.language+'\n'+extractLines(code, inspect.parameter)+'\n```';    
    }
    return '```'+inspect.language+'\n'+code+'\n```';
}

async function processYml(inspect) {
    let code = await loadFile('/add/'+config().content+'/'+inspect.inspect);
    return '```'+inspect.language+'\n'+code+'\n```';
}

async function fallback(inspect) {
    let code = await loadFile('/add/'+config().content+'/'+inspect.inspect);
    return '```'+inspect.language+'\n'+code+'\n```';
}

function extractLines(codeString, ranges) {
  const lines = codeString.split("\n");

  const blocks = ranges.map(range => {
    const [start, end] = range.split("..").map(Number);
    return lines.slice(start, end + 1);
  });

  return blocks.map(block => block.join("\n")).join("\n  .. \n");
}

function shiftMarkdownHeadings(markdown, offset) {
  return markdown.replace(/^(#{1,6})\s+(.*)$/gm, (match, hashes, title) => {
    let newLevel = Math.max(1, Math.min(6, hashes.length + offset));
    return '#'.repeat(newLevel) + ' ' + title;
  });
}

export { inspect }