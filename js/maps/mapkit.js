/* =====================================================================
   CORDON — map kit (js/maps/mapkit.js)
   ---------------------------------------------------------------------
   Every street layout lives in its own file inside  js/maps/  (see
   base.js for the original map and promenade.js for the seaside one).
   This file is the shared "reader": it turns a map file into the road
   tiles, sidewalks, junctions and road nodes the game needs.

   You never edit this file to add a map. To add a map:
     1. copy  js/maps/promenade.js  to a new name, change the numbers
     2. add one  <script src="js/maps/yourmap.js"></script>  line to
        index.html (and zombie.html) next to the others
     3. give a campaign chapter  mapId: 'yourmap'  in js/campaign.js
        (or pick it in Settings > Map to test it straight away)

   Map file cheat-sheet (all numbers are TILES, one tile = 16 pixels):
     id, name          short id and the name shown in Settings
     w, h              smallest map size (the game may grow it on big screens)
     roadW             road width: 6 means 7 tiles wide (3 each side of the centre)
     roads[]           every straight road:
        dir 'h' / 'v'  horizontal or vertical
        c              centre line (the y of a horizontal road, x of a vertical one)
        a, b           first / last tile along the road ('end' = the map edge)
        sa, sb         where the pavement along it starts / stops
     station {x0,y0,w,h}   where the police station building sits (door faces up)
     base {x,y}            the spot on the road in front of the station door
     nodes(env)            the road junction points (see the files for examples)
     exits[]               node names where crowds walk on and off the map
     signals {row, xs}     junctions that get traffic lights + a yellow box
     sea {y1, sandY1}      optional: tiles above y1 are sea, up to sandY1 are beach
     decorate(api)         optional: place signs and road paint
   ===================================================================== */
(function () {
    'use strict';
    const registry = {};
    const order = [];

    function register(def) {
        if (!def || !def.id) return;
        if (!registry[def.id]) order.push(def.id);
        registry[def.id] = def;
    }
    function get(id) { return registry[id] || registry.base || registry[order[0]]; }
    function list() { return order.map(id => ({ id: id, name: registry[id].name || id })); }
    function has(id) { return !!registry[id]; }

    // Build the geometry helpers for one map at the current map size.
    // env = { W: map width in tiles, H: map height in tiles }
    function build(def, env) {
        const hw = (def.roadW === undefined ? 6 : def.roadW) / 2;
        const pad = 1.5;
        const swHw = hw + pad;
        const end = v => (v === 'end' ? env.H : v);
        const segs = def.roads.map(r => ({
            dir: r.dir, c: r.c, a: end(r.a), b: end(r.b),
            sa: end(r.sa === undefined ? r.a - pad : r.sa),
            sb: end(r.sb === undefined ? (r.b === 'end' ? 'end' : r.b + pad) : r.sb),
            rawB: r.b, rawA: r.a, exit: r.exit || null, id: r.id || null,
        }));
        // 'end' for a horizontal road means the map width.
        segs.forEach((s, i) => {
            const r = def.roads[i];
            if (s.dir === 'h') {
                if (r.b === 'end') s.b = env.W;
                if (r.sb === 'end' || (r.sb === undefined && r.b === 'end')) s.sb = env.W;
            }
        });
        const hSegs = segs.filter(s => s.dir === 'h'), vSegs = segs.filter(s => s.dir === 'v');

        function isRoad(tx, ty) {
            for (const s of segs) {
                if (s.dir === 'h') { if (ty >= s.c - hw && ty <= s.c + hw && tx >= s.a && tx <= s.b) return true; }
                else if (tx >= s.c - hw && tx <= s.c + hw && ty >= s.a && ty <= s.b) return true;
            }
            return false;
        }
        function isSidewalk(tx, ty) {
            if (isRoad(tx, ty)) return false;
            for (const s of segs) {
                if (s.dir === 'h') { if (ty >= s.c - swHw && ty <= s.c + swHw && tx >= s.sa && tx <= s.sb) return true; }
                else if (tx >= s.c - swHw && tx <= s.c + swHw && ty >= s.sa && ty <= s.sb) return true;
            }
            return false;
        }
        // sea / beach rows (optional)
        function isSea(tx, ty) { return !!def.sea && ty < def.sea.y1; }
        function isSand(tx, ty) { return !!def.sea && ty >= def.sea.y1 && ty < def.sea.sandY1; }

        // Pixel-space road list used for junction detection, lane paint and parked cars.
        function layoutRoads(TILE) {
            const H = hSegs.map(s => ({ c: (s.c + 0.5) * TILE, a: s.a * TILE, b: (s.rawB === 'end' ? env.W : s.b + 1) * TILE, row: s.c }));
            const V = vSegs.map(s => {
                const tx = s.c;
                return { c: (tx + 0.5) * TILE, a: s.a * TILE, b: (s.rawB === 'end' ? env.H : s.b + 1) * TILE, tx: tx, bottomEntry: s.rawB === 'end' };
            });
            return { H: H, V: V };
        }

        // Blockade spots (where a vehicle can park across a road).
        function blockadeSpots(TILE) {
            const spots = [];
            const margin = hw + 1.5;
            for (const s of hSegs) {
                for (let tx = Math.ceil(s.a); tx <= Math.floor(s.b); tx++) {
                    if (!isRoad(tx, s.c)) continue;
                    let near = false;
                    for (const v of vSegs) {
                        if (s.c < v.a - 0.5 || s.c > v.b + 0.5) continue;
                        if (Math.abs(tx - v.c) < margin) { near = true; break; }
                    }
                    if (near) continue;
                    spots.push({ key: 'H' + s.c + '_' + tx, dir: 'h', x: tx * TILE + TILE / 2, y: s.c * TILE + TILE / 2 });
                }
            }
            for (const s of vSegs) {
                for (let ty = Math.max(1, Math.ceil(s.a)); ty < env.H && ty <= s.b; ty++) {
                    if (!isRoad(s.c, ty)) continue;
                    let near = false;
                    for (const h of hSegs) {
                        if (s.c < h.a - 0.5 || s.c > h.b + 0.5) continue;
                        if (Math.abs(ty - h.c) < margin) { near = true; break; }
                    }
                    if (near) continue;
                    spots.push({ key: 'V' + s.c + '_' + ty, dir: 'v', x: s.c * TILE + TILE / 2, y: ty * TILE + TILE / 2 });
                }
            }
            return spots;
        }

        return { def: def, hw: hw, segs: segs, hSegs: hSegs, vSegs: vSegs,
                 isRoad: isRoad, isSidewalk: isSidewalk, isSea: isSea, isSand: isSand,
                 layoutRoads: layoutRoads, blockadeSpots: blockadeSpots,
                 nodes: () => (typeof def.nodes === 'function' ? def.nodes(env) : (def.nodes || [])) };
    }

    window.CordonMaps = { register: register, get: get, list: list, has: has, build: build, DEFAULT: 'base' };
})();
