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
const subcommands = ["enable", "disable", "status", "volume"];
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
                console.log(data);
                if (
                    !Player.IsGagged() ||
                    !(sender.MemberNumber === Player.MemberNumber)
                )
                    return;
                if (!data.Content || data.Content?.startsWith("(")) return;
                else if (data.Content.length < 5) {
                    playSoundCategory("gagtalk_short");
                } else if (data.Content.length < 20) {
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
        Tag: "gagsound",
        Description: "gagsound help",
        AutoComplete: (words) => {
            if (words.length < 1) {
                window.ChatRoomSendLocal(
                    "<b>" +
                    subcommands.join("</b>, <b>") +
                    "</b>",
                    60000,
                );
            }
            if (words.length === 1) {
                const matches = [];
                for (let sub of subcommands) {
                    if (sub.startsWith(words[0])) matches.push(sub);
                }

                if (matches.length > 1) {
                    const common_prefix = prefix(matches);
                    if (common_prefix.length > words[0].length)
                        window.ElementValue("InputChat", "/bcar " + common_prefix);
                    window.ChatRoomSendLocal(
                        "<b>" +
                        matches.join("</b>,<b>") +
                        "</b>",
                        60000,
                    );
                }

                if (matches.length < 1) {
                    /*No output, because no match*/
                }

                if (matches.length === 1) {
                    window.ElementValue("InputChat", "/gagsound " + matches[0]);
                }
            }
        },
        Action: (args) => {
            commandHandlerEnable(args.split(" "));
            commandHandlerDisable(args.split(" "));
            commandHandlerStatus(args.split(" "));
            commandHandlerVolume(args.split(" "));
        },
    },
]);

function commandHandlerEnable(args){
    cmd = args[0];
    if(cmd == "enable")
        CONFIG.enabled = true;
}

function commandHandlerDisable(args){
    cmd = args[0];
    if(cmd == "disable")
        CONFIG.enabled = false;
}

function commandHandlerStatus(args){
    cmd = args[0];
    if(cmd == "status")
        if(CONFIG.enabled)
            window.ChatRoomSendLocal("Gag sounds are <b> enabled </b>");
        else
            window.ChatRoomSendLocal("Gag sounds are <b> disabled </b>");
}

function commandHandlerVolume(args){
    cmd = args[0];
    if(cmd == "volume"){
        if(args.length == 1)
            window.ChatRoomSendLocal("Volume: <b> " + CONFIG.volume + " </b>");
        else {
            var volume = Number(args[1]);
            if(volume >= 0 && volume <= 100)
                CONFIG.volume = 100.0/volume;
            else
                window.ChatRoomSendLocal("Volume needs to be a number between 0 and 100");   
        }
    }
}
runBCGSM();
