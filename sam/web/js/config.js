let cfg;

async function loadConfig(content) {
    try {
        const response = await fetch("content/"+content+'/'+"config.json"); 
        if (!response.ok) {
            throw new Error("Error loading config.json: " + response.status);
        }
        cfg = await response.json();
        cfg.content = content;
    
        addPackage();
        
    } catch (err) {
        document.getElementById('nav').style.display = 'none';
        document.getElementById('content').innerHTML = '<p>⛔ Error: loading config.json.</p>';
    }
}

async function addPackage() {
    try {
        const response = await fetch("package.json"); 
        if (!response.ok) {
            throw new Error("Error loading package.json: " + response.status);
        }
        const pack = await response.json();
        cfg.sam = pack;
        document.getElementById('sam').innerHTML = document.getElementById('sam').innerHTML.replace('{$version}','<i>v.'+cfg.sam.version+'</i>');
    } catch (err) {
        document.getElementById('nav').style.display = 'none';
        document.getElementById('content').innerHTML = '<p>⛔ Error: loading package.json.</p>';
    }
}

function config() {
    return cfg;    
}

export { config, loadConfig }