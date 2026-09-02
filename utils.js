const _soundBufferCache = new Map(); // url → AudioBuffer
let _audioCtx = null;

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
 
function _getAudioCtx() {
    if (!_audioCtx || _audioCtx.state === "closed") {
        _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (_audioCtx.state === "suspended") _audioCtx.resume();
    return _audioCtx;
}

function resolveSoundBuffer(entry) {
    return new Promise((resolve) => {
        if (!entry) return resolve(null);
        if (_soundBufferCache.has(entry))
            return resolve(_soundBufferCache.get(entry));
        const ctx = _getAudioCtx();
        const onAB = (ab) =>
            ctx
                .decodeAudioData(ab.slice(0))
                .then((buf) => {
                    _soundBufferCache.set(entry, buf);
                    resolve(buf);
                })
                .catch(() => resolve(null));
        fetchAsset(entry)
            .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
            .then(onAB)
            .catch(() => resolve(null));
    });
}

