import { loadFile } from './file.js';
import { config } from './config.js';

function anchor(term) {
  return term
    .toLowerCase()
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-") 
    .replace(/^-+|-+$/g, ""); 
}

async function generateGlossary(full) {
    var result = full;  
    var lines = ["| Term        | Definition |",
                 "|-------------|------------|"];
    
    const regex = /`([^`]+)`\{([^}]+)\}/g;
    let match;
    let terms = 0;    
    while ((match = regex.exec(full)) !== null) {
        terms++;
        const term = match[1];        
        const definition = match[2];
        
        lines.push("|<a id="+anchor(term)+"></a>"+term+"|"+definition+"|");

        if (config().autoGlossary.strict) {
            result = result.replaceAll("`"+term+"`{"+definition+"}",term);
            result = result.replaceAll(term, "[`"+term+"`](#"+anchor(term)+")");
        } else {
            result = result.replaceAll("`"+term+"`{"+definition+"}", "[`"+term+"`](#"+anchor(term)+")");
        }
    }
    if (terms != 0) {
        return result + "\n" + lines.join("\n");
    } 
    return result;
}

export { generateGlossary }