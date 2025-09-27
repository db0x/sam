async function loadFile(path) {
    const response = await fetch(path);

    if (!response.ok) {
        throw new Error(`IO`);
    }

    return await response.text();
}

export { loadFile }