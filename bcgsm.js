async function runBCGSM() {
    await waitFor(() => ServerSocket && ServerIsConnected);
    var bcModSDK = window.bcModSdk;
    const modApi = bcModSDK.registerMod({
        name: "BCGS",
        fullName: "Bondage Club Gag Sounds",
        version: "0.1",
        // Optional - Link to the source code of the mod
        repository: "https://github.com/BufaloAcquatico/BCGagSoundMod",
    });

    console.log("BCGagSound loaded!");

    registerSocketListener(
        "LoginResponse",
        () => (currentlyGagged = Player.IsGagged()),
    );
}
const subcommands = ["enable", "disable", "status", "volume"];
const subcommands_help = [
    {
        command:"enable",
        help_text:"<b>/gagsound enable</b>: Enables all sound effects of the addon"
    },
    {
        command:"disable",
        help_text:"<b>/gagsound disable</b>: Disables all sound effects of the addon"
    },
    {
        command:"status",
        help_text:"<b>/gagsound status</b>: Displays if the addon is enabled"
    },
    {
        command:"volume",
        help_text:"<b>/gagsound volume</b>: Displays the current volume<br />"+
        "<b>/gagsound volume [0-100]</b>: Changes the volume from 0% to 100%<i> - Example: /gagsound volume 50</i>"
    },



]
const MEDIA_FOLDER = "Media";
const SOUNDS_FOLDER = "Sounds";
const ROOT_URI = "https://bufaloacquatico.github.io/BCGagSoundMod/";
let currentlyGagged;

var CONFIG = {};
CONFIG.enabled = true;
CONFIG.volume = 0.8;
CONFIG.commandsDelay = 30000;
CONFIG.sounds = [];
CONFIG.sounds["gagtalk_short"] = [
    getSoundsFolder() + "Media/Sounds/Generic/Short/Moan Short (7).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Short/Moan Short (6).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Short/Moan Short (9).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Short/Moan Short (8).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Short/Moan Short (4).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Short/Moan Short (10).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Short/Gag talk short.ogg",
];
CONFIG.sounds["gagtalk_medium"] = [
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Moan Medium (3).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Moan Medium (2).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Moan Long.ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk (5).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk (4).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk (3).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk (2).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk (1).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk.mp3",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk medium soft.mp3",
];
CONFIG.sounds["gagtalk_long"] = [
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Moan Medium (3).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Moan Medium (2).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Moan Long.ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk (5).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk (4).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk (3).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk (2).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk (1).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk.mp3",
    getSoundsFolder() + "Media/Sounds/Generic/Medium/Gag talk medium soft.mp3",
];
CONFIG.sounds["get_gagged"] = [
    getSoundsFolder() + "Media/Sounds/Gagging/Gagging (3).mp3",
    getSoundsFolder() + "Media/Sounds/Gagging/Gagging (4).mp3",
    getSoundsFolder() + "Media/Sounds/Gagging/Body binding (4).mp3",
    getSoundsFolder() + "Media/Sounds/Gagging/Gag talk short soft.ogg",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Gagging (2).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Gagging (1).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moan Short Soft 1.mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moan Short Soft.mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moan Medium Soft 1.mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moans of pleasure (3).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moans of pleasure (4).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moans of pleasure (2).mp3",
];

function getSoundsFolder() {
    return ROOT_URI + MEDIA_FOLDER + "/" + SOUNDS_FOLDER + "/";
}

let _previewSrc = null;
function playSoundEntry(entry, stopPrev = true) {
    if(!CONFIG.enabled)
        return;
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
            g.gain.value = Math.min(Math.max(CONFIG.volume, 0), 1);
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
    Description: "BCGS",
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
                    playSoundCategory("get_gagged");
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
                let help = [];
                for(let sub of subcommands_help)
                    help.push(sub.help_text);
                window.ChatRoomSendLocal(
                    help.join(",<br />"),
                    CONFIG.commandsDelay
                );
            }
            if (words.length === 1) {
                const matches = [];
                const matches_help = [];
                for (let sub of subcommands_help) {
                    if (sub.command.startsWith(words[0])) {
                        matches_help.push(sub.help_text);
                        matches.push(sub.command);
                    }
                }

                if (matches.length > 1) {
                    const common_prefix = prefix(matches);
                    if (common_prefix.length > words[0].length)
                        window.ElementValue("InputChat", "/gagsound " + common_prefix);
                    window.ChatRoomSendLocal(
                        "<b>" +
                        matches_help.join("</b>,<b>") +
                        "</b>",
                        CONFIG.commandsDelay,
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
    if(cmd == "enable"){
        CONFIG.enabled = true;
        window.ChatRoomSendLocal("Gag sounds are <b>enabled</b>", CONFIG.commandsDelay);
    }
}

function commandHandlerDisable(args){
    cmd = args[0];
    if(cmd == "disable"){
        CONFIG.enabled = false;
        window.ChatRoomSendLocal("Gag sounds are <b>disabled</b>", CONFIG.commandsDelay);
    }
}

function commandHandlerStatus(args){
    cmd = args[0];
    if(cmd == "status")
        if(CONFIG.enabled)
            window.ChatRoomSendLocal("Gag sounds are <b>enabled</b>", CONFIG.commandsDelay);
        else
            window.ChatRoomSendLocal("Gag sounds are <b>disabled</b>", CONFIG.commandsDelay);
}

function commandHandlerVolume(args){
    cmd = args[0];
    if(cmd == "volume"){
        if(args.length == 1)
            window.ChatRoomSendLocal("Volume: <b>" + Number(CONFIG.volume*100) + "</b>", CONFIG.commandsDelay);
        else {
            var volume = Number(args[1]);
            if(volume >= 0 && volume <= 100)
                CONFIG.volume = volume/100.0;
            else
                window.ChatRoomSendLocal("Volume needs to be a number between 0 and 100", CONFIG.commandsDelay);
        }
    }
}
runBCGSM();
