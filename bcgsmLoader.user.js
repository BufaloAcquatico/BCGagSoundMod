// ==UserScript==
// @name         BCGagSoundMod Loader
// @namespace    https://www.bondageprojects.com/
// @version      1
// @description  BC extension adding gag related sounds for a miscellanous of situations.
// @author       BufaloAcquatico
// @downloadURL  https://raw.githubusercontent.com/BufaloAcquatico/BCGagSoundMod/main/bcgsmLoader.user.js
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match http://localhost:*/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var script = document.createElement("script");
    script.src = "https://bufaloacquatico.github.io/BCGagSoundMod/bcgsm.js";
    document.head.appendChild(script);
})();
