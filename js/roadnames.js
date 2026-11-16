/* CORDON — road names + dispatcher (js/roadnames.js)
   Each road gets a made-up name that stays the same for the whole game and is reshuffled on restart.
   Names are only spoken/shown in radio calls, never drawn on the map.
   Radio calls are built from pre-recorded clips (assets/audio/radio/): a lead-in clip + a road-name clip,
   so every phone sounds the same. If the clips cannot load, the phone's own voice is used instead. */
(function () {
    'use strict';
    const POOL = ['Mill Street','Church Road','Station Road','Albert Street','Victoria Road','King Street','Castle Lane','Chapel Street','Bridge Street','Market Way','Park Avenue','Orchard Lane','Mount Pleasant','Quarry Road','Abbey Road','Harbour Street','Vicarage Lane','Water Street','Bank Street','Hill Terrace','Union Street','Dock Road','Gladstone Road','Wellington Street','Penrhyn Road','Canal Street','Chester Road','Holywell Road','Queens Avenue','Wesley Street','Oak Lane','Rose Terrace','School Lane','Mill Lane','High Street','Church Lane','Cross Street','Marsh Road','Foundry Row','Pier Road'];
    // [lead-in, ending]  — the road name is spoken between the two
    const LINES = {
        crowd: [['All units, crowd approaching from', '.'], ['Control to all serials, large group heading in from', '.'], ['Be advised, crowd gathering on', ', moving towards you.'], ['Callsigns, we have people coming down', '.']],
        damage: [['Control, reports of protesters damaging buildings on', '.'], ['All units, windows going in on', ', we need someone down there.'], ["We've got criminal damage in progress on", '.'], ['Call in from', ', shop fronts being smashed.']],
        horde: [['All units, horde coming in from', '.'], ['Control to all serials, a lot of them heading down', '.'], ['Be advised, infected on', ', moving towards the base.'], ["Callsigns, they're pouring in off", '.']],
        breach: [["Control, they're breaking through on", '.'], ['All units,', ' is overrun, I say again, overrun.'], ["We've lost the barricade on", '.']]
    };
    const REPLY = ['Received, moving along', 'Copy, heading up', 'On our way, along'];
    let seed = (Date.now() % 99991) + 1, def = null, names = {}, lastReply = 0;
    function lcg() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    function build() {
        names = {}; if (!def || !def.roads) return;
        const pool = POOL.slice(), s0 = seed;
        for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(lcg() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
        def.roads.forEach((r, i) => { names[i] = pool[i % pool.length]; });
        seed = s0;
    }
    function atPx(x, y, tile) {
        if (!def || !def.roads) return null;
        const tx = x / tile, ty = y / tile; let best = null, bd = 1e9;
        def.roads.forEach((r, i) => {
            const along = r.dir === 'h' ? tx : ty, across = r.dir === 'h' ? ty : tx;
            const d = Math.abs(across - r.c) + (along < r.a ? r.a - along : along > r.b ? along - r.b : 0) * 2;
            if (d < bd) { bd = d; best = i; }
        });
        return best === null ? null : names[best];
    }
    const pick = n => Math.floor(Math.random() * n);
    const slug = s => s.toLowerCase().replace(/[^a-z]+/g, '_');
    const BASE = 'assets/audio/radio/';
    function say(text, clips, o) {
        if (!(window.CordonAudio && o && o.sound)) return;
        CordonAudio.radioSay(text, !!o.voices, false, clips && clips.map(c => (window.RADIO_CLIPS && RADIO_CLIPS[c]) || BASE + c + '.mp3'));
    }
    window.CordonRoads = {
        setMap(d) { def = d; build(); },
        reroll() { seed = (Date.now() % 99991) + 1; build(); },
        atPx,
        any() { const k = Object.keys(names); return k.length ? names[k[pick(k.length)]] : POOL[0]; },
        dispatch(kind, road, o) {                       // control-room call: returns the text and speaks it if sound is on
            road = road || this.any(); const i = pick(LINES[kind].length), L = LINES[kind][i];
            const text = L[0] + ' ' + road + L[1];
            const known = POOL.indexOf(road) >= 0;
            say(text, known ? ['d_' + kind + i + '_a', 'r_' + slug(road)].concat(L[1].replace(/^[,.\s]+/, '').length ? ['d_' + kind + i + '_b'] : []) : null, o);
            return text;
        },
        reply(road, o) {                                // an officer answers a move order (at most every 7 seconds)
            const now = Date.now(); if (!road || now - lastReply < 7000 || POOL.indexOf(road) < 0) return; lastReply = now;
            const i = pick(REPLY.length); say(REPLY[i] + ' ' + road + '.', ['q_' + i + '_a', 'm_' + slug(road)], o);
        },
        _data: { LINES, POOL, REPLY }
    };
})();
