async function loadFile(path) {
    const response = await fetch(path); 
    return await response.text();  
}

export { loadFile }