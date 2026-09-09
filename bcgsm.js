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

    prepareSettings();
}
const subcommands = ["enable", "disable", "status", "volume", "categories", "[category]"];
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
        help_text:"<b>/gagsound volume</b>: Displays the current volume,<br />"+
        "<b>/gagsound volume [0-100]</b>: Changes the volume from 0% to 100%<i> - Example: /gagsound volume 50</i>"
    },
    {
        command:"categories",
        help_text:"<b>/gagsound categories</b>: Shows the sound categories and the probability of each to play - " +
            "<i> Example: if \"struggle\" is 70%, there is a 70% for a struggle sound to play when using a struggle action or escaping a restraint</i>"
    },
    {
        command: "[category]",
        help_text: "<b>/gagsound [category]</b>: Shows the probability for sounds of the category specified to play - " +
            "<i> Example: /gagsound giggle </i>,<br />" +
                    "<b>/gagsound [category] [0-100]</b>: Changes the probability for sounds of the category specified to play - " +
                    "<i> Example: /gagsound giggle 75 </i>"
    }

]
const MEDIA_FOLDER = "Media";
const SOUNDS_FOLDER = "Sounds";
const ROOT_URI = "https://bufaloacquatico.github.io/BCGagSoundMod/";
let currentlyGagged;

var DEFAULT_CONFIG = {};
DEFAULT_CONFIG.enabled = true;
DEFAULT_CONFIG.volume = 0.8;
DEFAULT_CONFIG.commandsDelay = 30000;
DEFAULT_CONFIG.sounds = [];
DEFAULT_CONFIG.sounds["gagtalk_short"] = [
    getSoundsFolder() + "Media/Sounds/Generic/Short/Moan Short (7).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Short/Moan Short (6).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Short/Moan Short (9).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Short/Moan Short (8).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Short/Moan Short (4).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Short/Moan Short (10).ogg",
    getSoundsFolder() + "Media/Sounds/Generic/Short/Gag talk short.ogg",
];
DEFAULT_CONFIG.sounds["gagtalk_medium"] = [
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
/*
DEFAULT_CONFIG.sounds["gagtalk_long"] = [
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
*/
DEFAULT_CONFIG.sounds["get_gagged"] = [
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

DEFAULT_CONFIG.sounds["giggle"] = [
    getSoundsFolder() + "Media/Sounds/Giggle/haha (1).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/haha (2).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/haha (3).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/haha (4).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/haha (5).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/hehe (1).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/hehe (2).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/hehe (3).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/hehe (4).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/hehe (5).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/hehe (6).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/hehe (7).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/Tickling (1).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/Tickling (2).ogg",
    getSoundsFolder() + "Media/Sounds/Giggle/Tickling (3).ogg",
];

DEFAULT_CONFIG.sounds["struggle"] = [
    getSoundsFolder() + "Media/Sounds/Struggle/Struggle (2).mp3",
    getSoundsFolder() + "Media/Sounds/Struggle/Struggle (3).mp3",
];

DEFAULT_CONFIG.sounds["whimper"] = [
    getSoundsFolder() + "Media/Sounds/Whimper/Whimper (2).ogg",
    getSoundsFolder() + "Media/Sounds/Whimper/Whimper (3).ogg",
    getSoundsFolder() + "Media/Sounds/Whimper/Whimper (4).ogg",
    getSoundsFolder() + "Media/Sounds/Whimper/Whimper (6).ogg",
    getSoundsFolder() + "Media/Sounds/Whimper/Whimper (5).ogg",
    getSoundsFolder() + "Media/Sounds/Whimper/Whimper (1).ogg",
    getSoundsFolder() + "Media/Sounds/Whimper/Short soft Whimper.ogg",
];

DEFAULT_CONFIG.sounds["moan_medium"] = [
    getSoundsFolder() + "Media/Sounds/Moans/Short/Gagging (2).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Gagging (1).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moan Short Soft 1.mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moan Short Soft.mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moan Medium Soft 1.mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moans of pleasure (3).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moans of pleasure (4).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moans of pleasure (2).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Medium/Moans long soft (3).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Medium/Moans of pleasure (9).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Medium/Moans of pleasure (5).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Long/Moans long soft (5).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Long/Moans long soft (1).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Long/Penetration.mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Long/Moans of pleasure (1).mp3",
];

DEFAULT_CONFIG.sounds["orgasm"] = [
    getSoundsFolder() + "Media/Sounds/Moans/Deep/Moans of pleasure (7).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Deep/Moans of pleasure (6).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Deep/Moans of pleasure (8).mp3",
];

DEFAULT_CONFIG.sounds["moan_short"] = [
    getSoundsFolder() + "Media/Sounds/Moans/Short/Gagging (2).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Gagging (1).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moan Short Soft 1.mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moan Short Soft.mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moan Medium Soft 1.mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moans of pleasure (3).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moans of pleasure (4).mp3",
    getSoundsFolder() + "Media/Sounds/Moans/Short/Moans of pleasure (2).mp3",
];
DEFAULT_CONFIG.sounds["mumble_short"] = [
    getSoundsFolder() + "Media/Sounds/Mumble/Neutral/Short/Moan Short (8).ogg",
    getSoundsFolder() + "Media/Sounds/Mumble/Neutral/Short/Moan Short (5).ogg",
    getSoundsFolder() + "Media/Sounds/Mumble/Neutral/Short/Moan Short (2).ogg",
    getSoundsFolder() + "Media/Sounds/Mumble/Neutral/Short/Moan Short (6).ogg",
    getSoundsFolder() + "Media/Sounds/Mumble/Neutral/Short/Moan Short (10).ogg",
    getSoundsFolder() + "Media/Sounds/Mumble/Soft/Short/Moan Short Soft.mp3",
    getSoundsFolder() + "Media/Sounds/Mumble/Soft/Short/Moan Short Soft 1.mp3",
    getSoundsFolder() + "Media/Sounds/Mumble/Soft/Short/Moan Short Soft (2).ogg",
    getSoundsFolder() + "Media/Sounds/Mumble/Soft/Short/Moan Short Soft (3).ogg",
    getSoundsFolder() + "Media/Sounds/Mumble/Soft/Short/Moan Short Soft (1).ogg",
];
DEFAULT_CONFIG.sounds["mumble_medium"] = [
    getSoundsFolder() + "Media/Sounds/Mumble/Neutral/Medium/Moan Medium (3).ogg",
    getSoundsFolder() + "Media/Sounds/Mumble/Neutral/Medium/Moan Medium (2).ogg",
    getSoundsFolder() + "Media/Sounds/Mumble/Soft/Medium/Moan Medium Soft 1.mp3",
    getSoundsFolder() + "Media/Sounds/Mumble/Soft/Medium/Moans long soft (3).mp3",
    getSoundsFolder() + "Media/Sounds/Mumble/Soft/Medium/Moan Medium Soft (1).ogg",
];

DEFAULT_CONFIG.category_probability = {
    gagtalk_short: 0.50,
    gagtalk_medium: 0.50,
    get_gagged: 1,
    giggle: 0.50,
    struggle: 0.80,
    whimper: 1,
    moan_short: 0.50,
    moan_medium: 0.50,
    orgasm: 1,
    mumble_short: 0.50,
    mumble_medium: 0.50
}

function getSoundsFolder() {
    return ROOT_URI + "/";
}

let _previewSrc = null;
function playSoundEntry(entry, stopPrev = true) {
    if(!Player.BCGS.enabled)
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
            g.gain.value = Math.min(Math.max(Player.BCGS.volume, 0), 1);
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
    let list = ((DEFAULT_CONFIG.sounds && DEFAULT_CONFIG.sounds[cat]) || []).filter(Boolean);
    if (list.length === 0 && useDefault) list = SOUND_DEFAULTS[cat] || [];
    if (list.length === 0) return false;
    if(Math.random() < Player.BCGS.category_probability[cat])
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
                if (
                    !Player.IsGagged() ||
                    !(sender.MemberNumber === Player.MemberNumber)
                )
                    return;
                if (!data.Content || data.Content?.startsWith("(")) return;
                
                var content = data.Content.toLowerCase();
                if(content.indexOf("haha") >= 0 ||
                    content.indexOf("hehe") >= 0 ||
                    content.indexOf("hihi") >= 0 ||
                    content.indexOf("ha ha") >= 0 ||
                    content.indexOf("he he") >= 0 ||
                    content.indexOf("hi hi") >= 0){
                    playSoundCategory("giggle");
                }
                if(content.indexOf("mh~") == 0) {
                    playSoundCategory("moan_short");
                } else if(content.indexOf("mh") == 0){
                    playSoundCategory("mumble_short");
                } else if(content.indexOf("mmm") >= 0){
                    if(content.endsWith("~"))
                            playSoundCategory("moan_medium");
                    else
                        playSoundCategory("mumble_medium");
                }
                else if (data.Content.length < 5) {
                    playSoundCategory("gagtalk_short");
                } else {
                    playSoundCategory("gagtalk_medium");
                }
                break;
                
            case "Action":
                // if before the action you weren't gagged and now you are, make a short gagging sound
                if (!currentlyGagged && Player.IsGagged()) {
                    playSoundCategory("get_gagged");
                }
                currentlyGagged = Player.IsGagged();

                if (data.Content.indexOf("Struggle") >= 0) {
                    if (Player.IsGagged() && (sender.MemberNumber === Player.MemberNumber) )
                        playSoundCategory("struggle");
                }
                break;
                
            case "Activity":
                if(data.Content.indexOf("Struggle") >= 0){
                    if (Player.IsGagged() && (sender.MemberNumber === Player.MemberNumber) )
                        playSoundCategory("struggle");
                } else if(data.Content.indexOf("Tickle") >= 0){
                    if (Player.IsGagged() && 
                    data.Dictionary && 
                    data.Dictionary.find((el) => el.TargetCharacter !== undefined)?.TargetCharacter === Player.MemberNumber )
                        playSoundCategory("giggle");
                } else if (data.Content.indexOf("Giggle") >= 0){                    
                    if (Player.IsGagged() && (sender.MemberNumber === Player.MemberNumber) )
                        playSoundCategory("giggle");
                }
                else if(data.Content.indexOf("Whimper")>=0){
                    if (Player.IsGagged() && sender.MemberNumber === Player.MemberNumber )
                        playSoundCategory("whimper");
                } else if(data.Content.indexOf("Orgasm")>= 0){
                    if (Player.IsGagged() && sender.MemberNumber === Player.MemberNumber )
                        playSoundCategory("orgasm");
                } else if(data.Content.endsWith("Caress")){
                    if (Player.IsGagged() && 
                        data.Dictionary && 
                        data.Dictionary.find((el) => el.TargetCharacter !== undefined)?.TargetCharacter === Player.MemberNumber ){
                        let group = data.Dictionary.find((el) => el.FocusGroupName !== undefined)?.FocusGroupName;
                        if(group == "ItemVulva" || group == "ItemBreast")
                            playSoundCategory("moan_medium");
                        
                        if(group == "ItemMouth" || group == "ItemHead")
                            playSoundCategory("moan_short");
                    }
                }
                else if(data.Content.indexOf("MoanGagTalk")>= 0){
                    if (Player.IsGagged() && sender.MemberNumber === Player.MemberNumber )
                        playSoundCategory("mumble_medium");
                                                       
                } else if(data.Content.endsWith("MoanGag") ){
                    if (Player.IsGagged() && (sender.MemberNumber === Player.MemberNumber) )
                        playSoundCategory("moan_medium");
                }
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

function bcgsSettingsSave() {
    Player.ExtensionSettings.BCGS = Player.BCGS;
    ServerPlayerExtensionSettingsSync("BCGS");
}


CommandCombine([
    {
        Tag: "gagsound",
        Description: "Gagsound help",
        AutoComplete: (words) => {
            var autocomplete_words = subcommands_help.concat(getCategories());
            if (words.length < 1) {
                let help = [];
                for(let sub of subcommands_help)
                    help.push(sub.help_text);
                window.ChatRoomSendLocal(
                    help.join(",<br />"),
                    Player.BCGS.commandsDelay
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

                for( let cat of getCategories())
                    if(cat.startsWith(words[0]))
                        matches.push(cat);

                if (matches.length > 1) {
                    const common_prefix = prefix(matches);
                    if (common_prefix.length > words[0].length)
                        window.ElementValue("InputChat", "/gagsound " + common_prefix);
                    window.ChatRoomSendLocal(
                        "<b>" +
                        matches_help.join("</b>,<b>") +
                        "</b>",
                        Player.BCGS.commandsDelay,
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
            commandHandlerHelp(args.split(" "));
            commandHandlerEnable(args.split(" "));
            commandHandlerDisable(args.split(" "));
            commandHandlerStatus(args.split(" "));
            commandHandlerVolume(args.split(" "));
            commandHandlerCategories(args.split(" "));
            commandHandlerProbabilities(args.split(" "));
            bcgsSettingsSave();
        },
    },
]);

function commandHandlerHelp(args){
    if(args[0] == ""){
        let matches_help = [];
        for (let sub of subcommands_help) {
            matches_help.push(sub.help_text);

            window.ChatRoomSendLocal(
                matches_help.join(",<br />"),
                Player.BCGS.commandsDelay
            );
        }
    } else {
        console.log(args);
    }
}

function commandHandlerEnable(args){
    cmd = args[0];
    if(cmd == "enable"){
        Player.BCGS.enabled = true;
        window.ChatRoomSendLocal("Gag sounds are <b>enabled</b>", Player.BCGS.commandsDelay);
    }
}

function commandHandlerDisable(args){
    cmd = args[0];
    if(cmd == "disable"){
        Player.BCGS.enabled = false;
        window.ChatRoomSendLocal("Gag sounds are <b>disabled</b>", Player.BCGS.commandsDelay);
    }
}

function commandHandlerStatus(args){
    cmd = args[0];
    if(cmd == "status")
        if(Player.BCGS.enabled)
            window.ChatRoomSendLocal("Gag sounds are <b>enabled</b>", Player.BCGS.commandsDelay);
        else
            window.ChatRoomSendLocal("Gag sounds are <b>disabled</b>", Player.BCGS.commandsDelay);

}

function commandHandlerVolume(args){
    cmd = args[0];
    if(cmd == "volume"){
        if(args.length == 1)
            window.ChatRoomSendLocal("Volume: <b>" + parseInt(Player.BCGS.volume*100) + "</b>", Player.BCGS.commandsDelay);
        else {
            var volume = parseInt(args[1]);
            if(volume >= 0 && volume <= 100)
                Player.BCGS.volume = volume/100.0;
            else
                window.ChatRoomSendLocal("Volume needs to be a number between 0 and 100", Player.BCGS.commandsDelay);
        }
    }
    
}

function commandHandlerCategories(args){
    cmd = args[0];
    if(cmd == "categories"){
        let categories = []
        for(key in Player.BCGS.category_probability){
            categories.push("<b>" + key + "</b>: " + parseInt(Player.BCGS.category_probability[key] * 100) + "%");
        }
        window.ChatRoomSendLocal(
            categories.join("<br />"),
            Player.BCGS.commandsDelay,
        );
        
    }
}

function commandHandlerProbabilities(args){
    category = args[0];
    let categories = getCategories();
    if(categories.includes(cmd)){
        if(args.length == 1)
            window.ChatRoomSendLocal("<b>" + category + "</b>: " + parseInt(Player.BCGS.category_probability[category] * 100) + "%");
        else {
            probability = parseInt(args[1]);
            
            if(probability >= 0 && probability <= 100)
                Player.BCGS.category_probability[category] = probability/100.0;
            else
                window.ChatRoomSendLocal("Probability needs to be a number between 0 and 100", Player.BCGS.commandsDelay);
        }
    }
}

function getCategories(){
    let categories = []
    for(key in Player.BCGS.category_probability){
        categories.push(key);
    }
    return categories;
}

async function prepareSettings(){
    await waitFor(() => !!Player?.AccountName)
    Player.BCGS = Player.ExtensionSettings.BCGS || DEFAULT_CONFIG;
    Player.BCGS.sounds = DEFAULT_CONFIG.sounds;
    Player.BCGS.enabled = Player.BCGS.enabled ? Player.BCGS.enabled : DEFAULT_CONFIG.enabled;
    Player.BCGS.volume = Player.BCGS.volume ? Player.BCGS.volume : DEFAULT_CONFIG.volume;
    Player.BCGS.commandsDelay = Player.BCGS.commandsDelay ? Player.BCGS.commandsDelay : DEFAULT_CONFIG.commandsDelay;
    Player.BCGS.category_probability = Player.BCGS.category_probability ? Player.BCGS.category_probability : DEFAULT_CONFIG.category_probability;
    
}

runBCGSM();
