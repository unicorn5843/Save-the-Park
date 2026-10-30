/* =====================================================================
   CORDON — adaptive difficulty (js/difficulty.js)
   ---------------------------------------------------------------------
   Used by index.html and zombie.html. It keeps one number, the
   "level" (1.0 = the standard challenge), and nudges it after every
   wave based on how the player actually did:

     - held the line easily      -> level goes up a little, next wave is harder
     - a close, tense fight      -> level stays put (that is the sweet spot)
     - struggling or overrun     -> level comes down so the next wave is fairer

   Nothing here is shown as a "difficulty setting". The player just
   gets a wave that suits them. The level is remembered between games
   (separately for the riot game and the zombie game) so a good player
   is not made to start from scratch.

   To make the game generally easier or harder, change the two numbers
   in LIMITS (lowest / highest level) or the STEP sizes in waveEnded().
   ===================================================================== */
(function () {
    'use strict';
    const LIMITS = { min: 0.6, max: 1.9 };
    let key = 'cordon.difficulty.v1';
    let persist = true;
    let level = 1.0;
    let lastDelta = 0;
    let history = [];

    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function load() {
        try {
            const d = JSON.parse(localStorage.getItem(key) || 'null');
            if (d && Number.isFinite(d.level)) level = clamp(d.level, LIMITS.min, LIMITS.max);
        } catch (e) { /* private mode etc: just run in memory */ }
    }
    function save() {
        if (!persist) return;
        try { localStorage.setItem(key, JSON.stringify({ level: +level.toFixed(3) })); } catch (e) { /* ignore */ }
    }

    const api = {
        // key: storage name. persistFlag: false in test mode so testing does not change a real save.
        init: function (storageKey, persistFlag) {
            key = storageKey || key;
            persist = persistFlag !== false;
            level = 1.0; history = []; lastDelta = 0;
            if (persist) load();
        },
        setPersist: function (flag) { persist = !!flag; },
        // a fresh run starts a little easier than where the last one ended
        newRun: function () {
            level = clamp(1 + (level - 1) * 0.8, LIMITS.min, LIMITS.max);
            history = []; lastDelta = 0; save();
        },
        level: function () { return level; },
        lastDelta: function () { return lastDelta; },
        label: function () {
            return level < 0.8 ? 'Gentle' : level < 1.05 ? 'Standard' : level < 1.35 ? 'Tough' : level < 1.65 ? 'Fierce' : 'Brutal';
        },
        // Multipliers for the wave that is about to start.
        tune: function () {
            const lv = level;
            return {
                level: lv,
                rioters: clamp(Math.pow(lv, 0.95), 0.6, 1.9),       // how many rioters
                zombies: clamp(Math.pow(lv, 0.9), 0.6, 1.8),        // how many zombies (wave shape stays the same)
                protesters: clamp(1 + (lv - 1) * 0.35, 0.8, 1.4),   // size of the peaceful crowd
                hidden: clamp(Math.pow(lv, 1.3), 0.4, 2.2),         // hidden troublemakers in the crowd
                pace: clamp(1 + (lv - 1) * 0.35, 0.8, 1.45),          // how quickly trouble follows trouble
                hp: clamp(1 + (lv - 1) * 0.22, 0.85, 1.25),         // toughness of each enemy
                mood: clamp((lv - 1) * 7, -5, 8),                   // how worked up the crowd starts
            };
        },
        // stats: { baseLoss 0..1, officerHealth 0..1 (average, alive officers), officersLost 0..1, buildingsLost (count),
        //          seconds }
        waveEnded: function (stats) {
            const s = stats || {};
            const baseLoss = clamp(s.baseLoss || 0, 0, 1);
            const health = clamp(s.officerHealth === undefined ? 1 : s.officerHealth, 0, 1);
            const lost = clamp(s.officersLost || 0, 0, 1);
            const bld = clamp((s.buildingsLost || 0) * 0.06, 0, 0.4);
            // 1 = never in trouble, 0 = nearly overrun
            const score = clamp(1 - baseLoss * 2.6 - (1 - health) * 0.9 - lost * 1.4 - bld, 0, 1);
            let delta;
            if (score > 0.85) delta = 0.10;
            else if (score > 0.7) delta = 0.05;
            else if (score > 0.5) delta = 0.0;           // balanced: leave it
            else if (score > 0.35) delta = -0.05;
            else if (score > 0.2) delta = -0.10;
            else delta = -0.16;
            const before = level;
            level = clamp(level + delta, LIMITS.min, LIMITS.max);
            lastDelta = level - before;
            history.push(+score.toFixed(2)); if (history.length > 12) history.shift();
            save();
            return { score: score, delta: lastDelta, level: level };
        },
        // being overrun: ease off clearly
        gameOver: function () {
            level = clamp(level - 0.15, LIMITS.min, LIMITS.max);
            lastDelta = -0.15; save();
        },
    };
    window.CordonDifficulty = api;
})();
