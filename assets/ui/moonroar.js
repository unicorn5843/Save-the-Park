/* =====================================================================
   MoonRoar skin  -  shared by index.html (riot game) and zombie.html
   ---------------------------------------------------------------------
   What this file does (you never need to edit it to play):
   1. Turns tokens like :coin: or :lock: into pixel icons anywhere in the page.
   2. Cuts the MoonRoar UI sheet (moonroar_general.png) into panels / buttons and
      recolours them (purple, gold, green, red, blue, olive, brown).
   3. Gives the games drawIcon(ctx, name, x, y, size) for icons drawn on the map.
   UI art: MoonRoar Free UI pack by Studios SoulAres. Icons: hand-drawn in the same style.
   ===================================================================== */
(function () {
    'use strict';
    var ME = document.currentScript;
    var BASE = ME && ME.src ? ME.src.replace(/[^\/]*$/, '') : 'assets/ui/';
    var ICON_SIZE = 16, SHEET_W = 160, SHEET_H = 128;
    var IDX = {"coin":[0,0],"lock":[16,0],"unlock":[32,0],"helmet":[48,0],"cop":[64,0],"worker":[80,0],"car":[96,0],"van":[112,0],"ambulance":[128,0],"station":[144,0],"burst":[0,16],"merge":[16,16],"gas":[32,16],"siren":[48,16],"wall":[64,16],"drop":[80,16],"dog":[96,16],"play":[112,16],"pause":[128,16],"check":[144,16],"cross":[0,32],"pin":[16,32],"arrow_u":[32,32],"arrow_d":[48,32],"arrow_l":[64,32],"arrow_r":[80,32],"wrench":[96,32],"target":[112,32],"repeat":[128,32],"star":[144,32],"star_off":[0,48],"dumbbell":[16,48],"moon":[32,48],"wedge":[48,48],"box":[64,48],"bolt":[80,48],"return":[96,48],"save":[112,48],"dove":[128,48],"baton":[144,48],"dot":[0,64],"dot_off":[16,64],"phone":[32,64],"wave":[48,64],"no":[64,64],"megaphone":[80,64],"scales":[96,64],"home":[112,64],"gear":[128,64],"hazard":[144,64],"compass":[0,80],"hand":[16,80],"walk":[32,80],"run":[48,80],"dizzy":[64,80],"eye":[80,80],"ruins":[96,80],"warning":[112,80],"bulb":[128,80],"plus":[144,80],"gun":[0,96],"shield":[16,96],"fuel":[32,96],"zombie":[48,96],"flask":[64,96],"hospital":[80,96],"skull":[96,96],"heart":[112,96],"book":[128,96],"bandage":[144,96],"trophy":[0,112],"link":[16,112],"cuffs":[32,112],"crowd":[48,112],"placard":[64,112],"clock":[80,112],"brick":[96,112],"menu":[112,112],"map":[128,112]};
    var NAMES = {}; Object.keys(IDX).forEach(function (n) { NAMES[n] = true; });

    // ---------- 1. icon CSS (one rule per icon) ----------
    var css = '.ico{display:inline-block;flex:0 0 auto;width:calc(16px*var(--z,1));height:calc(16px*var(--z,1));' +
        'background:url(' + BASE + 'ui_icons.png) 0 0/calc(160px*var(--z,1)) calc(128px*var(--z,1)) no-repeat;' +
        'image-rendering:pixelated;vertical-align:-0.22em;margin:0 .12em}' +
        '.ico.z125{--z:1.25}.ico.z15{--z:1.5}.ico.z2{--z:2}.ico.z25{--z:2.5}.ico.z3{--z:3}';
    Object.keys(IDX).forEach(function (n) {
        css += '.ico-' + n + '{background-position:calc(-' + IDX[n][0] + 'px*var(--z,1)) calc(-' + IDX[n][1] + 'px*var(--z,1))}';
    });
    var st = document.createElement('style'); st.id = 'mr-icon-css'; st.textContent = css; document.head.appendChild(st);

    // ---------- 2. :token: -> icon, for every bit of text the games put on screen ----------
    var RX = /:([a-z0-9_]+):/g;
    function convert(node) {
        var t = node.nodeValue;
        if (!t || t.indexOf(':') < 0 || !node.parentNode) return;
        var p = node.parentNode.nodeName;
        if (p === 'SCRIPT' || p === 'STYLE' || p === 'TEXTAREA') return;
        RX.lastIndex = 0;
        var m, last = 0, frag = null;
        while ((m = RX.exec(t))) {
            if (!NAMES[m[1]]) { RX.lastIndex = m.index + 1; continue; }
            if (!frag) frag = document.createDocumentFragment();
            if (m.index > last) frag.appendChild(document.createTextNode(t.slice(last, m.index)));
            var i = document.createElement('i'); i.className = 'ico ico-' + m[1]; i.setAttribute('aria-hidden', 'true');
            frag.appendChild(i); last = m.index + m[0].length;
        }
        if (!frag) return;
        if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last)));
        node.parentNode.replaceChild(frag, node);
    }
    function walk(n) {
        if (n.nodeType === 3) { convert(n); return; }
        if (n.nodeType !== 1) return;
        var tn = n.nodeName; if (tn === 'SCRIPT' || tn === 'STYLE' || tn === 'CANVAS') return;
        for (var c = n.firstChild; c;) { var nx = c.nextSibling; walk(c); c = nx; }
    }
    new MutationObserver(function (muts) {
        for (var k = 0; k < muts.length; k++) {
            var m = muts[k];
            if (m.type === 'characterData') convert(m.target);
            else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
        }
    }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    function first() { if (document.body) walk(document.body); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', first); else first();

    // ---------- 3. icons drawn on the game canvas ----------
    var iconImg = new Image(), iconReady = false;
    iconImg.onload = function () { iconReady = true; };
    iconImg.src = BASE + 'ui_icons.png';
    window.drawIcon = function (ctx, name, cx, cy, size) {
        var p = IDX[name]; if (!iconReady || !p) return false;
        size = size || 12;
        var was = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = false;
        ctx.drawImage(iconImg, p[0], p[1], ICON_SIZE, ICON_SIZE, Math.round(cx - size / 2), Math.round(cy - size / 2), size, size);
        ctx.imageSmoothingEnabled = was;
        return true;
    };
    window.MoonRoar = { icons: IDX, base: BASE };

    // ---------- 4. slice + recolour the UI sheet into CSS variables ----------
    var C = { ink: [34, 32, 52], dark: [54, 51, 76], base: [76, 72, 105], light: [108, 103, 144], lighter: [154, 149, 193] };
    var RAMPS = {
        purple: null,
        gold:  { ink: [58, 42, 18],  dark: [138, 100, 32], base: [201, 150, 46],  light: [232, 184, 74],  lighter: [251, 224, 138] },
        green: { ink: [20, 48, 26],  dark: [47, 106, 53],  base: [74, 154, 74],   light: [116, 195, 106], lighter: [179, 232, 160] },
        red:   { ink: [46, 22, 32],  dark: [126, 42, 53],  base: [185, 67, 78],   light: [224, 112, 122], lighter: [246, 166, 170] },
        blue:  { ink: [20, 34, 58],  dark: [40, 74, 126],  base: [61, 111, 176],  light: [106, 160, 224], lighter: [168, 208, 255] },
        olive: { ink: [38, 38, 14],  dark: [92, 92, 30],   base: [138, 138, 46],  light: [184, 184, 78],  lighter: [228, 228, 140] },
        brown: { ink: [44, 26, 14],  dark: [108, 66, 34],  base: [158, 100, 52],  light: [204, 148, 84],  lighter: [240, 200, 140] }
    };
    // name: [x, y, w, h, ramps...]  (rectangles inside moonroar_general.png)
    var PIECES = {
        panel:  [52, 117, 40, 38, 'purple', 'gold', 'green', 'red', 'blue', 'olive', 'brown'],
        pill:   [1, 64, 46, 16, 'purple', 'gold', 'green', 'red', 'blue', 'olive', 'brown'],
        pillDn: [1, 96, 46, 16, 'purple', 'gold', 'green', 'red', 'blue', 'olive', 'brown'],
        square: [80, 64, 16, 16, 'purple', 'gold', 'red', 'blue'],
        squareDn: [80, 96, 16, 16, 'purple', 'gold', 'red', 'blue'],
        round:  [64, 64, 16, 16, 'purple', 'gold', 'green', 'red'],
        roundDn: [64, 96, 16, 16, 'purple', 'gold', 'green', 'red'],
        parch:  [9, 121, 30, 30, 'purple'],
        bubble: [99, 121, 36, 30, 'purple'],
        badge:  [0, 0, 32, 32, 'purple', 'gold']
    };
    function same(a, r, g, b) { return a[0] === r && a[1] === g && a[2] === b; }
    function build(sheet) {
        var root = document.documentElement;
        Object.keys(PIECES).forEach(function (key) {
            var d = PIECES[key], x = d[0], y = d[1], w = d[2], h = d[3];
            for (var r = 4; r < d.length; r++) {
                var ramp = d[r];
                var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
                var cx = cv.getContext('2d'); cx.imageSmoothingEnabled = false;
                cx.drawImage(sheet, x, y, w, h, 0, 0, w, h);
                if (RAMPS[ramp] && key !== 'parch' && key !== 'bubble') {
                    var img = cx.getImageData(0, 0, w, h), a = img.data, R = RAMPS[ramp];
                    for (var i = 0; i < a.length; i += 4) {
                        if (!a[i + 3]) continue;
                        var px = [a[i], a[i + 1], a[i + 2]], to = null;
                        for (var nm in C) if (same(px, C[nm][0], C[nm][1], C[nm][2])) { to = R[nm]; break; }
                        if (to) { a[i] = to[0]; a[i + 1] = to[1]; a[i + 2] = to[2]; }
                    }
                    cx.putImageData(img, 0, 0);
                }
                root.style.setProperty('--mr-' + key + (ramp === 'purple' ? '' : '-' + ramp), 'url("' + cv.toDataURL('image/png') + '")');
            }
        });
        root.classList.add('mr-skin');
    }
    var sheet = new Image();
    sheet.onload = function () { build(sheet); };
    sheet.src = BASE + 'moonroar_general.png';
})();
