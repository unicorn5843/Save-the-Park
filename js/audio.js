/* =====================================================================
   CORDON — sound engine (js/audio.js)
   ---------------------------------------------------------------------
   Every sound here is SYNTHESISED by the browser (Web Audio), so the game
   works with no audio files at all.

   Want real recordings instead? Put your files in  assets/audio/  and list
   them in CLIPS below, e.g.   hit: 'assets/audio/hit.ogg'
   Any sound with a clip listed uses the clip; everything else stays synth.
   ===================================================================== */
(function () {
    'use strict';

    // name -> file path. Leave empty to use the built-in synth sounds.
    const CLIPS = {
        // hit: 'assets/audio/hit.ogg',
        // siren: 'assets/audio/siren.ogg',
        // chant: 'assets/audio/chant.ogg',
    };

    let ctx = null, master = null, noiseBuf = null;
    let enabled = true, volume = 0.7;
    const buffers = {};
    const lastPlayed = {};
    let chantTimer = null, chantMood = 0, chantSize = 0, chantStep = 0, lastSet = 0;
    let sirenNodes = null, sirenStop = 0;

    function ensure() {
        if (ctx) return ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try {
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = volume;
            const comp = ctx.createDynamicsCompressor();
            comp.threshold.value = -18; comp.ratio.value = 6;
            master.connect(comp); comp.connect(ctx.destination);
            const len = ctx.sampleRate * 2;
            noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = noiseBuf.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
            Object.keys(CLIPS).forEach(loadClip);
        } catch (e) { ctx = null; }
        return ctx;
    }
    function loadClip(name) {
        fetch(CLIPS[name]).then(r => r.arrayBuffer()).then(b => ctx.decodeAudioData(b))
            .then(buf => { buffers[name] = buf; }).catch(() => { });
    }
    function unlock() {
        const c = ensure();
        if (c && c.state === 'suspended') c.resume();
    }
    ['touchstart', 'mousedown', 'keydown'].forEach(ev =>
        window.addEventListener(ev, unlock, { passive: true }));

    function ok(name, minGap) {
        if (!enabled) return false;
        const c = ensure();
        if (!c || c.state !== 'running') return false;
        const now = c.currentTime;
        if (lastPlayed[name] && now - lastPlayed[name] < (minGap || 0.05)) return false;
        lastPlayed[name] = now;
        return true;
    }
    function playClip(name, vol) {
        if (!buffers[name]) return false;
        const s = ctx.createBufferSource(); s.buffer = buffers[name];
        const g = ctx.createGain(); g.gain.value = vol;
        s.connect(g); g.connect(master); s.start();
        return true;
    }
    function env(g, t, a, peak, d) {
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
        g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    }
    function noise(t, dur, type, freq, q, peak, atk) {
        const s = ctx.createBufferSource(); s.buffer = noiseBuf;
        s.loopStart = 0; s.loop = true;
        const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 1;
        const g = ctx.createGain(); env(g, t, atk || 0.005, peak, dur);
        s.connect(f); f.connect(g); g.connect(master);
        s.start(t, Math.random()); s.stop(t + dur + (atk || 0.005) + 0.05);
        return f;
    }
    function tone(t, type, f0, f1, dur, peak, atk) {
        const o = ctx.createOscillator(); o.type = type;
        o.frequency.setValueAtTime(f0, t);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        const g = ctx.createGain(); env(g, t, atk || 0.004, peak, dur);
        o.connect(g); g.connect(master);
        o.start(t); o.stop(t + dur + (atk || 0.004) + 0.05);
    }

    const SOUNDS = {
        // baton / shield thump
        hit(v) { const t = ctx.currentTime; tone(t, 'sine', 150, 55, 0.14, 0.5 * v); noise(t, 0.07, 'lowpass', 900, 0.7, 0.35 * v); },
        // big impact (water cannon blast, brick on shield, station hit)
        slam(v) { const t = ctx.currentTime; tone(t, 'sine', 90, 35, 0.35, 0.8 * v); noise(t, 0.25, 'lowpass', 500, 0.7, 0.55 * v); },
        shield(v) { const t = ctx.currentTime; noise(t, 0.09, 'bandpass', 2400, 3, 0.3 * v); tone(t, 'triangle', 520, 380, 0.08, 0.15 * v); },
        brick(v) { const t = ctx.currentTime; noise(t, 0.05, 'highpass', 1800, 1, 0.25 * v); tone(t + 0.02, 'square', 240, 110, 0.1, 0.2 * v); },
        glass(v) { const t = ctx.currentTime; for (let i = 0; i < 5; i++) noise(t + i * 0.025, 0.12, 'highpass', 3500 + i * 700, 2, 0.14 * v); },
        gas(v) { const t = ctx.currentTime; noise(t, 1.1, 'bandpass', 3200, 0.6, 0.35 * v, 0.1); },
        water(v) { const t = ctx.currentTime; noise(t, 0.7, 'lowpass', 1600, 0.5, 0.35 * v, 0.08); },
        arrest(v) { const t = ctx.currentTime; tone(t, 'square', 880, 880, 0.06, 0.12 * v); tone(t + 0.09, 'square', 1175, 1175, 0.1, 0.12 * v); },
        dog(v) { const t = ctx.currentTime; tone(t, 'sawtooth', 420, 260, 0.12, 0.25 * v); tone(t + 0.16, 'sawtooth', 400, 240, 0.12, 0.22 * v); },
        // little "ting" for UI / decisions
        ui(v) { const t = ctx.currentTime; tone(t, 'sine', 880, 880, 0.12, 0.2 * v); tone(t + 0.07, 'sine', 1320, 1320, 0.16, 0.18 * v); },
        coin(v) { const t = ctx.currentTime; tone(t, 'square', 988, 988, 0.07, 0.12 * v); tone(t + 0.07, 'square', 1319, 1319, 0.18, 0.12 * v); },
        bad(v) { const t = ctx.currentTime; tone(t, 'sawtooth', 220, 140, 0.35, 0.22 * v); },
        horn(v) { const t = ctx.currentTime; tone(t, 'sawtooth', 200, 200, 0.5, 0.18 * v, 0.03); tone(t, 'square', 300, 300, 0.5, 0.1 * v, 0.03); },
        // a riot turns: low rumble + shout
        riot(v) { const t = ctx.currentTime; noise(t, 0.8, 'lowpass', 400, 0.8, 0.35 * v, 0.1); tone(t, 'sawtooth', 180, 120, 0.6, 0.12 * v, 0.05); },
    };

    // two-tone UK siren ("nee-naw"), for a few seconds
    function siren(seconds, v) {
        if (!ok('siren', 1)) return;
        if (playClip('siren', 0.4 * (v || 1))) return;
        const t0 = ctx.currentTime, dur = Math.min(8, seconds || 3);
        const o = ctx.createOscillator(); o.type = 'triangle';
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.16 * (v || 1), t0 + 0.2);
        g.gain.setValueAtTime(0.16 * (v || 1), t0 + dur - 0.4);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        const step = 0.42;
        for (let t = t0, hi = true; t < t0 + dur; t += step, hi = !hi) o.frequency.setValueAtTime(hi ? 960 : 770, t);
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
        o.connect(lp); lp.connect(g); g.connect(master);
        o.start(t0); o.stop(t0 + dur + 0.1);
    }

    // ---- crowd chanting: rhythmic murmur whose pace and grit follow the crowd's mood ----
    function chantBeat() {
        if (!enabled || !ctx || ctx.state !== 'running' || chantSize < 0.04) return;
        if (performance.now() - lastSet > 1500) return;      // the game stopped updating (paused / game over): go quiet
        if (playClip('chant', 0.25 * chantSize)) return;
        const t = ctx.currentTime;
        const mood = chantMood, size = Math.min(1, chantSize);
        // "ban-NER, ban-NER" style two-beat accent; angrier crowds chant lower and rougher
        const accent = (chantStep++ % 2 === 0) ? 1 : 0.6;
        const base = 260 - mood * 80;
        const peak = (0.05 + 0.10 * size) * accent;
        const f1 = noise(t, 0.28, 'bandpass', base * 1.6, 2.2, peak, 0.05);
        noise(t, 0.28, 'bandpass', base * 3.4, 2.5, peak * 0.7, 0.05);
        if (mood > 0.55) noise(t, 0.22, 'highpass', 2800, 1, peak * 0.35 * mood, 0.03);
        if (f1) f1.frequency.setValueAtTime(base * 1.6, t);
    }
    function chantSchedule() {
        clearInterval(chantTimer);
        chantTimer = setInterval(chantBeat, 560 - chantMood * 200);
    }

    const API = {
        unlock,
        setEnabled(on) { enabled = !!on; if (!enabled) { clearInterval(chantTimer); chantTimer = null; } },
        isEnabled() { return enabled; },
        setVolume(v) { volume = Math.max(0, Math.min(1, v)); if (master) master.gain.value = volume; },
        // play(name, 0..1 loudness). Safe to call anywhere, any time.
        play(name, v) {
            const gap = (name === 'hit' || name === 'shield') ? 0.07 : 0.12;
            if (!ok(name, gap)) return;
            v = v === undefined ? 1 : v;
            if (playClip(name, 0.5 * v)) return;
            const fn = SOUNDS[name]; if (fn) { try { fn(v); } catch (e) { } }
        },
        siren,
        // mood 0..1, size 0..1 (how big the crowd is). Call every half-second or so.
        setCrowd(mood, size) {
            lastSet = performance.now();
            const wasOn = chantSize >= 0.04;
            const oldMood = chantMood;
            chantMood = Math.max(0, Math.min(1, mood)); chantSize = Math.max(0, Math.min(1, size));
            if (!enabled || !ctx) return;
            if (chantSize >= 0.04 && (!chantTimer || !wasOn || Math.abs(oldMood - chantMood) > 0.12)) chantSchedule();
            if (chantSize < 0.04 && chantTimer) { clearInterval(chantTimer); chantTimer = null; }
        },
        silence() { clearInterval(chantTimer); chantTimer = null; chantSize = 0; },
    };
    window.CordonAudio = API;
})();
