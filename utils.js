async function fetchAsset(url, init) {
    try {
        const r = await fetch(url, init);
        if (r.ok) return r;
        const fb = toPagesUrl(url);
        return fb !== url ? fetch(fb, init) : r;
    } catch (e) {
        const fb = toPagesUrl(url);
        if (fb !== url) return fetch(fb, init);
        throw e;
    }
}

//do not touch this
async function waitFor(func, cancelFunc = () => false) {
    while (!func()) {
        if (cancelFunc()) return false;
        await sleep(10);
    }
    return true;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
