let cfg;

async function loadConfig(content) {
    try {
        const response = await fetch("content/"+content+'/'+"config.json"); 
        if (!response.ok) {
            throw new Error("Error loading config.json: " + response.status);
        }

        cfg = await response.json();
        cfg.content = content;
        
    } catch (err) {
        document.getElementById('nav').style.display = 'none';
        document.getElementById('content').innerHTML = '<p>⛔ Error: loading config.json.</p>';
    }
}

function config() {
    return cfg;    
}

export { config, loadConfig }