let startDocument = "";
async function loadMarkdown(path) {
    const response = await fetch(path); 
    return await response.text();  
}

async function resolveIncludes(outer) {
    
    const includeRegex = /!\[\]\(([^)]+\.md)\)/g;
    let match;
    let result = outer;
    const replacements = [];
    while ((match = includeRegex.exec(outer)) !== null) {
        let importPath = match[1];
        const importedText = await loadMarkdown(importPath);
        replacements.push({ match: match[0], text: importedText });
    }

    for (const r of replacements) {
        result = result.replace(r.match, r.text);
    }

    return result;
}

async function render(md) {
    const full = await resolveIncludes(md);
    const html = marked.parse(full);
    document.getElementById('content').innerHTML = html;    
}

async function generateToc() {
    const toc = document.getElementById('toc');
    toc.innerHTML = '';
    document.querySelectorAll('#content h1, #content h2, #content h3').forEach((heading) => {
        const id = heading.textContent.trim().toLowerCase().replace(/[^\w]+/g, '-');
        heading.id = id;
        const li = document.createElement('li');
        li.style.marginLeft = heading.tagName === 'H2' ? '10px' : heading.tagName === 'H3' ? '20px' : '0';
        const a = document.createElement('a');
        a.href = '#' + id;
        a.textContent = heading.textContent;
        li.appendChild(a);
        toc.appendChild(li);
    });   
}
async function loadConfig() {
    try {
        const response = await fetch("content/config.json"); 
        if (!response.ok) {
            throw new Error("Config konnte nicht geladen werden: " + response.status);
        }
        const config = await response.json();

        if (config.title) {
            document.title = config.title; 
            startDocument = config.startDocument;
        }
    } catch (err) {
        document.getElementById('content').innerHTML = '<p>Error loading config.json.</p>';
        console.error(err);
    }
}
async function main() {
    try {
        await loadConfig();

        const md = await loadMarkdown('content/'+ startDocument);
        await render(md);
        await generateToc();

    } catch (err) {
        document.getElementById('content').innerHTML = '<p>Error loading Markdown file.</p>';
        console.error(err);
    }
}

main();