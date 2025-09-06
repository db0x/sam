import { loadFile } from './file.js';
import { config } from './config.js';

async function renderPlantUML(umlText, server = config.plantUML.server) {
    const res = await fetch(server, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: umlText
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Rendering fehlgeschlagen (${res.status}): ${errText}`);
      }
      
      return await res.text();
}

async function resolvePlantUML(outer) {

    const includeRegex = /!\[\]\(([^)]+\.wsd)\)/g;

    let match;
    let result = outer;
    const replacements = [];
    while ((match = includeRegex.exec(outer)) !== null) {
        let importPath = match[1];
        const importedText = await loadFile(importPath);
        const uml = await renderPlantUML(importedText, config().plantUML.server);
        replacements.push({ match: match[0], text: uml });
    }

    for (const r of replacements) {
        result = result.replace(r.match, r.text);
    }

    return result;
}


export { resolvePlantUML }