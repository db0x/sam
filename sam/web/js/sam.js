import { loadFile } from './file.js';
import { config, loadConfig } from './config.js';
import { resolvePlantUML } from './plantuml.js';
import { resolveSVG, makeSVGResponsive } from './svg.js';
import { generateGlossary } from './glossary.js';

import { inspect, inspectValue} from './insepect.js';


const params = new URLSearchParams(window.location.search);
const content = params.get("content");
const format = params.get("format");

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
    const prefix = 'content/'+ config().content + '/';
    const regex = /!\[[^\]]*]\((?!\.?\/)([^)]+\.[a-zA-Z0-9]+)\)/g;

    return md.replace(regex, (match, path) => {
        return match.replace(path, prefix + path);
    });
}

async function markdownReplace(md) {
    var content = md;
    content = content.replaceAll('{page-break}','<div class="page-break"></div>');
    content = content.replaceAll('{ok}','<img class=\'inline-icon\' src=\'assets/ok.svg\'>');
    content = content.replaceAll('{nok}','<img class=\'inline-icon\' src=\'assets/nok.svg\'>');
    return content;
}

async function htmlReplace() {
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
        if ( el.innerHTML.includes('{discreet}')) {
            el.innerHTML = el.innerHTML.replace('{discreet}','');
            el.classList.add('discreet')
        }
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

    full = await markdownReplace(full);

    full = await inspect(full);
    
    const html = marked.parse(full);    

    document.getElementById('content').innerHTML = html;    
    await htmlReplace();

    if (config().highlightJs == undefined || config().highlightJs == true) {
        document.querySelectorAll('pre code').forEach((el) => {
            hljs.highlightElement(el);
        });
    }
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
        if (heading.classList.contains("discreet")) {
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

async function generatePdfToc() {
    const toc = document.getElementById('print-toc');
    toc.innerHTML = '';

    const selectors = [];
    for (let i = 1; i <= config().tocDepth; i++) {
        selectors.push(`#content h${i}`);
    }
    const query = selectors.join(', ');

    document.querySelectorAll(query).forEach((heading) => {
        if (heading.classList.contains("discreet")) {
            return;
        }
        const id = heading.textContent.trim().toLowerCase().replace(/[^\w]+/g, '-');
        heading.id = id;

        const li = document.createElement('li');

        li.classList.add('pdftoc');
        li.classList.add(
            heading.tagName === 'H2' ? 'toc-h2' :
            heading.tagName === 'H3' ? 'toc-h3' :
            heading.tagName === 'H4' ? 'toc-h4' : '0');

        const a = document.createElement('a');
        a.href = '#' + id;
        a.textContent = heading.textContent.replace(/^\s*\d+\s*-\s*/, "");;
        const wrapper = document.createElement('span');
        wrapper.classList.add("toc-wrapper");        
        const title = document.createElement('span');
        title.classList.add('toc-title');
        const page = document.createElement('span');
        page.classList.add('toc-page');
        page.id = 'page_'+id;

        page.innerText = "";
        title.append(a);
        wrapper.append(title, page);
        li.appendChild(wrapper);
        toc.appendChild(li);
    });
}

async function generateCover() {
    if ( !config().print.coverPage ) {
        document.getElementById("print-cover").style.display = "none";        
    } else {
        document.getElementById("cover-image").src = "content/"+content+'/'+ config().print.coverImage;
        document.getElementById("cover-title").innerHTML = config().print.coverTitle;
        document.getElementById("cover-author").innerHTML = config().author;        

        if ( config().version ) {
            if ( typeof config().version == "object" ) {
                 document.getElementById("cover-version").innerHTML = await inspectValue(config().version);
            } else {
                document.getElementById("cover-version").innerHTML = config().version;        
            }
        } else {
            document.getElementById("cover-version").innerHTML = "";
        }

        document.getElementById("cover-date").innerHTML =  new Intl.DateTimeFormat(config().locale, {day: '2-digit', month: 'long', year: 'numeric'})
            .format(new Date());
    }
}

async function menu() {
    const menuBtn = document.getElementById("menuBtn");
    const menu = document.getElementById("menu");

    menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
            menu.classList.remove("show");
        }
    });
}

function setFavicon(url) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
    }
    link.href = url;
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
        document.getElementById('zip-link').href = "/_zip/?content="+config().content+"&title="+config().title;

        await menu();

        if (config().navImage) {
            document.getElementById('nav-img').src = 'content/'+content+'/'+ config().navImage;
        }
        if (config().navLink) {
            document.getElementById('nav-link').href = config().navLink;
        }
        if (config().favicon) {
            setFavicon('content/'+content+'/'+ config().favicon);
        }
        const md = await loadFile('content/'+content+'/'+ config().startDocument);

        await render(md);
        
        if ( format == 'pdf') {
            makeSVGResponsive(900);
            await generateCover();
            await generatePdfToc();
        } else {
            makeSVGResponsive(1200);
            await generateCover();
            await generateToc();
        }
        
        
    } catch (err) {
        document.getElementById('nav').style.display = 'none';
        document.getElementById('content').innerHTML = `<p>⛔ Error: The content <code>${content}</code> misses configuration or is unknown.</p>`;
        console.log(err);
        //return res.status(400).send("miss content");
    }
}


main();

