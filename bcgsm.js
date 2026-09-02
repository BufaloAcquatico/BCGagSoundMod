import {
    fetchAsset,
    waitFor,
    sleep
} from "./utils.js";

async function runBCGSM() {
    await waitFor(() => ServerSocket && ServerIsConnected);

    var bcModSDK = window.bcModSdk;
    const modApi = bcModSDK.registerMod({
        name: "BCGSM",
        fullName: "Bondage Club Gag Sound Mod",
        version: "0.1",
        // Optional - Link to the source code of the mod
        repository: "https://github.com/BufaloAcquatico/BCGagSoundMod",
    });

    console.log("BCGagSoundMod loaded!");

    registerSocketListener(
        "LoginResponse",
        () => (currentlyGagged = Player.IsGagged()),
    );
}

const _soundBufferCache = new Map(); // url → AudioBuffer
let _audioCtx = null;
const MEDIA_FOLDER = "Media";
const SOUNDS_FOLDER = "Sounds";
const ROOT_URI = "https://bufaloacquatico.github.io/BCGagSoundMod/";
let currentlyGagged;

var CONFIG = {};
CONFIG.sounds = [];
CONFIG.sounds["gagtalk_short"] = [
    getSoundsFolder() + "Gagtalk/Gag talk (1).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (2).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (3).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (4).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (5).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (6).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (7).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (8).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (9).mp3",
];

CONFIG.sounds["gagtalk_medium"] = [
    getSoundsFolder() + "Gagtalk/Gag talk (1).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (2).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (3).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (4).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (5).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (6).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (7).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (8).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (9).mp3",
];

CONFIG.sounds["gagtalk_long"] = [
    getSoundsFolder() + "Gagtalk/Gag talk (1).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (2).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (3).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (4).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (5).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (6).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (7).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (8).mp3",
    getSoundsFolder() + "Gagtalk/Gag talk (9).mp3",
];

CONFIG.enabled = true;
CONFIG.volume = 0.8;

function getSoundsFolder() {
    return ROOT_URI + MEDIA_FOLDER + "/" + SOUNDS_FOLDER + "/";
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
let _previewSrc = null;
function playSoundEntry(entry, vol = 0.8, stopPrev = false) {
    resolveSoundBuffer(entry).then((buf) => {
        if (!buf) return;
        try {
            if (stopPrev && _previewSrc) {
                try {
                    _previewSrc.stop();
                } catch (e) { }
                _previewSrc = null;
            }
            const ctx = _getAudioCtx();
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const g = ctx.createGain();
            g.gain.value = Math.min(Math.max(vol, 0), 1);
            src.connect(g);
            g.connect(ctx.destination);
            src.start();
            if (stopPrev) {
                _previewSrc = src;
                src.onended = () => {
                    if (_previewSrc === src) _previewSrc = null;
                };
            }
        } catch (e) { }
    });
}

function playSoundCategory(cat, vol = 0.8, useDefault = true) {
    let list = ((CONFIG.sounds && CONFIG.sounds[cat]) || []).filter(Boolean);
    if (list.length === 0 && useDefault) list = SOUND_DEFAULTS[cat] || [];
    if (list.length === 0) return false;
    playSoundEntry(list[Math.floor(Math.random() * list.length)], vol);
    return true;
}

// register a message handler. If it is a message coming from us and we're currently gagged, play a sound from the gagtalk category
window.ChatRoomRegisterMessageHandler({
    Priority: 600,
    Description: "BCGSM Gagtalk",
    Callback: (data, sender, msg, metadata) => {
        const match = /^(\D+)$/.exec(data.Type);
            switch (match?.[1]) {
                case "Chat":
                    if (!Player.IsGagged() || sender.MemberNumber === Player.MemberNumber) return;
                    if (data.content[0] == "(") return;
                    else if (data.content.length < 5) {
                        playSoundCategory("gagtalk_short");
                    } else if (data.content.length < 20) {
                        playSoundCategory("gagtalk_medium");
                    } else {
                        playSoundCategory("gagtalk_long");
                    }
                    break;
                case "Action":
                    console.log(currentlyGagged);
                    console.log("Gagged now: " + Player.IsGagged());
                    // if before the action you weren't gagged and now you are, make a short gagging sound
                    if (!currentlyGagged && Player.IsGagged()) {
                        playSoundCategory("gagtalk_short");
                    }
                    currentlyGagged = Player.IsGagged();
                    break;

                default:
            }
    },
});

const listeners = [];
function registerSocketListener(event, listener) {
    if (!listeners.some((l) => l[1] === listener)) {
        listeners.push([event, listener]);
        ServerSocket.on(event, listener);
    }
}	

CommandCombine([
    {
        Tag: "test",
        Description: ": My test command",

        Action: () => {
            console.log("Test function launched successfully");
        },
    },
]);


runBCGSM();
