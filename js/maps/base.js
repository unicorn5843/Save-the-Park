/* =====================================================================
   CORDON — BASE MAP: "Original Streets"  (js/maps/base.js)
   ---------------------------------------------------------------------
   This is the original street layout the game launched with, moved out
   of index.html so it sits alongside every other map. Three long east-
   west streets, five north-south streets, the station on the middle one.
   Do not delete it: new maps are copied from this shape, and it is the
   safe fallback if a map name is ever mistyped.
   ===================================================================== */
(function () {
    'use strict';
    CordonMaps.register({
        id: 'base',
        name: 'Original Streets',
        w: 108, h: 77,
        roadW: 6,

        // Every straight road. Order matters only for the junction paint.
        roads: [
            // three east-west streets
            { dir: 'h', c: 14, a: 8, b: 98, sa: 6.5, sb: 99.5 },      // top street
            { dir: 'h', c: 38, a: 8, b: 98, sa: 6.5, sb: 99.5 },      // station street
            { dir: 'h', c: 62, a: 8, b: 98, sa: 6.5, sb: 99.5 },      // southern street
            // north-south streets running off the top of the map
            { dir: 'v', c: 18, a: 0, b: 41, sa: 0, sb: 42.5, exit: 'N' },
            { dir: 'v', c: 30, a: 0, b: 65, sa: -1.5, sb: 66.5, exit: 'N' },
            { dir: 'v', c: 54, a: 0, b: 41, sa: -1.5, sb: 44, exit: 'N' },
            { dir: 'v', c: 78, a: 0, b: 65, sa: -1.5, sb: 66.5, exit: 'N' },
            { dir: 'v', c: 90, a: 0, b: 41, sa: 0, sb: 42.5, exit: 'N' },
            // streets running off the bottom of the map
            { dir: 'v', c: 12, a: 35, b: 'end', sa: 33.5, sb: 'end', exit: 'S' },
            { dir: 'v', c: 96, a: 35, b: 'end', sa: 33.5, sb: 'end', exit: 'S' },
            { dir: 'v', c: 54, a: 59, b: 'end', sa: 57.5, sb: 'end', exit: 'S' },
        ],

        // Police station building (its door faces the street above it).
        station: { x0: 48, y0: 43, w: 12, h: 9 },
        // The spot on the road in front of the door. The node below it is the crowds' target.
        base: { x: 54, y: 38 },
        baseNode: 'B54',

        // Road junction points. Straight roads between neighbours are found automatically.
        nodes: function (env) {
            const n = [];
            const push = (id, x, y) => n.push({ id: id, x: x, y: y });
            [18, 30, 54, 78, 90].forEach(x => push('T' + x, x, 14));
            [12, 18, 30, 54, 78, 90, 96].forEach(x => push('B' + x, x, 38));
            [18, 30, 54, 78, 90].forEach(x => push('N' + x, x, 1.5));
            push('S12', 12, env.H - 1.5);
            push('S96', 96, env.H - 1.5);
            [12, 30, 54, 78, 96].forEach(x => push('C' + x, x, 62));
            push('S54', 54, env.H - 1.5);
            return n;
        },
        // Where crowds walk on to the map (and leave it).
        exits: ['N18', 'N30', 'N54', 'N78', 'N90', 'S12', 'S54', 'S96'],

        // Junctions on this street row get traffic lights and a yellow box.
        signals: { row: 14, xs: [30, 54, 78] },

        // Starting spots, as offsets from the base spot.
        start: { syndicates: [[-8, 0], [0, 0], [8, 0]], waterCannon: [-10, 0], rubberVan: [-14, 0] },

        // Signs and road paint that belong to this map.
        decorate: function (api) {
            const L = api.L, half = api.half, TILE = api.TILE, px2t = api.px2t, add = api.addFurniture, H = api.drawH;
            const northWalkY = px2t(L.H[0].c - half - 8), southWalkY = px2t(L.H[1].c + half + 8);
            const vx = tx => (tx + 0.5) * TILE;
            add(px2t(vx(30) - half - 8), northWalkY, 'sign_pedestrian', H.sign_pedestrian);
            add(px2t(vx(18) + half + 8), northWalkY, 'sign_50', H.sign_50);
            add(px2t(vx(90) - half - 8), northWalkY, 'sign_50', H.sign_50);
            add(px2t(vx(12) + half + 8), southWalkY, 'sign_noentry', H.sign_noentry);
            add(54 - 4.2, southWalkY, 'sign_busstop', H.sign_busstop);
            add(54 - 2.2, southWalkY, 'sign_20', H.sign_20);
            add(54 + 2.2, southWalkY, 'sign_stop', H.sign_stop);
            add(54 + 4.2, southWalkY, 'sign_parking', H.sign_parking);
            api.addDecal(54, 38 - 3 + 0.9, 'tex_stopmark');
            api.addDecal(54 - 2, 14 + 1.5, 'tex_manhole1');
            api.addDecal(78 + 2, 38 + 1.5, 'tex_manhole2');
        },
    });
})();
