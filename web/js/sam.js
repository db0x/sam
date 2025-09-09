let startDocument = "";

import { loadFile } from './file.js';
import { config, loadConfig } from './config.js';
import { resolvePlantUML } from './plantuml.js';
import { resolveSVG, makeSVGResponsive } from './svg.js';
import { generateGlossary } from './glossary.js';

const params = new URLSearchParams(window.location.search);
const content = params.get("content");

async function resolveIncludes(outer) {
    
    const includeRegex = /!\[\]\(([^)]+\.md)\)/g;

    let match;
    let result = outer;
    const replacements = [];
    while ((match = includeRegex.exec(outer)) !== null) {
        let importPath = match[1];
        var importedText = await loadFile(importPath);
        importedText = await fixPaths(importedText);
        replacements.push({ match: match[0], text: importedText });
    }

    for (const r of replacements) {
        result = result.replace(r.match, r.text);
    }

    return result;
}

async function fixPaths(md) {
  const prefix = '/content/'+ config().content + '/';
  const regex = /!\[[^\]]*]\((?!\.?\/)([^)]+\.[a-zA-Z0-9]+)\)/g;

  return md.replace(regex, (match, path) => {
    return match.replace(path, prefix + path);
  });
}

async function render(md) {
    var full;

    full = await fixPaths(md)
    full = await resolveIncludes(full);   
    
    if (config().plantUML.active) {
        full = await resolvePlantUML(full);
    }
    if (config().embedSVG) {
        full = await resolveSVG(full);
    }
    if (config().autoGlossary.active) {
        full = await generateGlossary(full);
    }

    const html = marked.parse(full);    
    document.getElementById('content').innerHTML = html;    
}

async function generateToc() {
    const toc = document.getElementById('toc');
    toc.innerHTML = '';

    const selectors = [];
    for (let i = 1; i <= config().tocDepth; i++) {
        selectors.push(`#content h${i}`);
    }
    const query = selectors.join(', ');

    document.querySelectorAll(query).forEach((heading) => {
        if (heading.classList.contains("diskret")) {
            return;
        }
        const id = heading.textContent.trim().toLowerCase().replace(/[^\w]+/g, '-');
        heading.id = id;

        const li = document.createElement('li');
        li.style.marginLeft =
            heading.tagName === 'H2' ? '10px' :
            heading.tagName === 'H3' ? '20px' :
            heading.tagName === 'H4' ? '30px' : '0';

        const a = document.createElement('a');
        a.href = '#' + id;
        a.textContent = heading.textContent;

        li.appendChild(a);
        toc.appendChild(li);
    });
}

async function generateCover() {
    if ( !config().print.coverPage ) {
        document.getElementById("print-cover").style.display = "none";        
    } else {
        document.getElementById("cover-image").src = " /content/"+content+'/'+ config().print.coverImage;
        document.getElementById("cover-title").innerText = config().print.coverTitle;
        document.getElementById("cover-author").innerText = config().author;        
        document.getElementById("cover-version").innerText = config().version;        
        document.getElementById("cover-date").innerText =  new Intl.DateTimeFormat(config().locale, {day: '2-digit', month: 'long', year: 'numeric'})
            .format(new Date());
    }
}

async function main() {
    if (!content) {
        document.getElementById('nav').style.display = 'none';
        document.getElementById('content').innerHTML = '<p>⛔ Error: No content specified.</p>';
        return res.status(400).send("miss content");
    }
    try {

        await loadConfig(content);
        
        document.title = config().title;
        document.getElementById('pdf-link').href = "/_pdf/?content="+config().content+"&title="+config().title;

        const md = await loadFile('content/'+content+'/'+ config().startDocument);

        await render(md);
        
        makeSVGResponsive(1200);
        
        await generateToc();
        await generateCover();

    } catch (err) {
        document.getElementById('nav').style.display = 'none';
        document.getElementById('content').innerHTML = '<p>⛔ Error: Markdown-file not found or corrupt.</p>';
        console.error(err);
    }
}

main();

