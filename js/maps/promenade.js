/* =====================================================================
   CORDON — MAP: "Promenade Quarter"  (js/maps/promenade.js)
   ---------------------------------------------------------------------
   A seaside town. The sea and beach run along the top of the map; below
   them:
     - the PROMENADE, a road along the seafront
     - the HIGH STREET, the main road through the middle (the police
       station sits just south of it)
     - the BACK ROAD, a quieter road behind the station
   Short side streets join them, and the east side has a long street that
   runs from the promenade all the way down. Crowds walk on from the west,
   east and south edges, never from the sea.

   (Street names are never shown in the game.)
   ===================================================================== */
(function () {
    'use strict';
    CordonMaps.register({
        id: 'promenade',
        name: 'Promenade Quarter',
        w: 112, h: 80,
        roadW: 6,

        roads: [
            // three long east-west roads (the promenade stops where the long east street joins it)
            { dir: 'h', c: 14, a: 0, b: 101, sa: 0, sb: 102.5 },        // promenade
            { dir: 'h', c: 38, a: 0, b: 'end', sa: 0, sb: 'end' },      // high street
            { dir: 'h', c: 62, a: 0, b: 'end', sa: 0, sb: 'end' },      // back road
            // side streets between the promenade and the high street
            { dir: 'v', c: 20, a: 11, b: 41, sa: 11, sb: 41 },
            { dir: 'v', c: 46, a: 11, b: 41, sa: 11, sb: 41 },
            { dir: 'v', c: 72, a: 11, b: 41, sa: 11, sb: 41 },
            // the long east street: promenade to back road
            { dir: 'v', c: 98, a: 11, b: 65, sa: 11, sb: 66.5 },
            // west link between the high street and the back road
            { dir: 'v', c: 8, a: 35, b: 65, sa: 35, sb: 66.5 },
            // two streets running south off the map
            { dir: 'v', c: 33, a: 35, b: 'end', sa: 35, sb: 'end', exit: 'S' },
            { dir: 'v', c: 84, a: 35, b: 'end', sa: 35, sb: 'end', exit: 'S' },
        ],

        // Sea above row 5, beach down to row 10.
        sea: { y1: 5, sandY1: 10 },

        station: { x0: 52, y0: 43, w: 12, h: 9 },
        base: { x: 58, y: 38 },
        baseNode: 'M58',

        nodes: function (env) {
            const n = [];
            const push = (id, x, y) => n.push({ id: id, x: x, y: y });
            [20, 46, 72, 98].forEach(x => push('P' + x, x, 14));
            [8, 20, 33, 46, 58, 72, 84, 98].forEach(x => push('M' + x, x, 38));
            [8, 33, 84, 98].forEach(x => push('K' + x, x, 62));
            push('PW', 1.5, 14);
            push('MW', 1.5, 38);
            push('KW', 1.5, 62);
            push('ME', env.W - 1.5, 38);
            push('KE', env.W - 1.5, 62);
            push('S33', 33, env.H - 1.5);
            push('S84', 84, env.H - 1.5);
            return n;
        },
        exits: ['PW', 'MW', 'KW', 'ME', 'KE', 'S33', 'S84'],

        signals: { row: 38, xs: [20, 46, 72] },
        start: { syndicates: [[-8, 0], [0, 0], [8, 0]], waterCannon: [-10, 0], rubberVan: [-14, 0] },

        decorate: function (api) {
            const L = api.L, half = api.half, TILE = api.TILE, px2t = api.px2t, add = api.addFurniture, H = api.drawH;
            const promenadeWalkY = px2t(L.H[0].c + half + 8);      // pavement on the town side of the promenade
            const highSouthY = px2t(L.H[1].c + half + 8);          // south pavement of the high street
            const vx = tx => (tx + 0.5) * TILE;
            add(px2t(vx(46) - half - 8), promenadeWalkY, 'sign_pedestrian', H.sign_pedestrian);
            add(px2t(vx(20) + half + 8), promenadeWalkY, 'sign_20', H.sign_20);
            add(px2t(vx(72) - half - 8), promenadeWalkY, 'sign_parking', H.sign_parking);
            add(px2t(vx(33) + half + 8), highSouthY, 'sign_noentry', H.sign_noentry);
            add(px2t(vx(84) - half - 8), highSouthY, 'sign_50', H.sign_50);
            add(58 - 4.2, highSouthY, 'sign_busstop', H.sign_busstop);
            add(58 - 2.2, highSouthY, 'sign_20', H.sign_20);
            add(58 + 2.2, highSouthY, 'sign_stop', H.sign_stop);
            add(58 + 4.2, highSouthY, 'sign_parking', H.sign_parking);
            api.addDecal(58, 38 - 3 + 0.9, 'tex_stopmark');
            api.addDecal(46 - 2, 38 + 1.5, 'tex_manhole1');
            api.addDecal(72 + 2, 14 + 1.5, 'tex_manhole2');
        },
    });
})();
