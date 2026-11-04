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
        w: 132, h: 92,                     // enlarged: 20 more columns to the east, 12 more rows to the south
        roadW: 6,

        roads: [
            // three long east-west roads (the promenade stops where the long east street joins it)
            { dir: 'h', c: 14, a: 0, b: 121, sa: 0, sb: 122.5 },        // promenade
            { dir: 'h', c: 38, a: 0, b: 'end', sa: 0, sb: 'end' },      // high street
            { dir: 'h', c: 62, a: 0, b: 'end', sa: 0, sb: 'end' },      // back road
            { dir: 'h', c: 80, a: 0, b: 'end', sa: 0, sb: 'end' },      // new bottom road
            // side streets between the promenade and the high street
            { dir: 'v', c: 20, a: 11, b: 41, sa: 11, sb: 41 },
            { dir: 'v', c: 46, a: 11, b: 41, sa: 11, sb: 41 },
            { dir: 'v', c: 72, a: 11, b: 41, sa: 11, sb: 41 },
            // the long east street: promenade to back road
            { dir: 'v', c: 98, a: 11, b: 80, sa: 11, sb: 81.5 },
            // west link between the high street and the back road
            { dir: 'v', c: 8, a: 35, b: 80, sa: 35, sb: 81.5 },
            // two streets running south off the map
            { dir: 'v', c: 33, a: 35, b: 'end', sa: 35, sb: 'end', exit: 'S' },
            { dir: 'v', c: 84, a: 35, b: 'end', sa: 35, sb: 'end', exit: 'S' },
            { dir: 'v', c: 120, a: 11, b: 'end', sa: 11, sb: 'end', exit: 'S' },   // new east street, promenade to the bottom edge
        ],

        // Big buildings on fixed plots (x = left tile, y = bottom row; the door faces the street below).
        landmarks: [
            { type: 'hospital', x: 66,  y: 57, node: 'LH' },     // just east of the station, on the back road
            { type: 'school',   x: 40,  y: 57, node: 'LS' },
            { type: 'factory',  x: 103, y: 33, node: 'LF' },     // east end of the high street
        ],

        // Sea above row 5, beach down to row 10.
        sea: { y1: 5, sandY1: 10 },

        station: { x0: 52, y0: 43, w: 12, h: 9 },
        base: { x: 58, y: 38 },
        baseNode: 'M58',

        nodes: function (env) {
            const n = [];
            const push = (id, x, y) => n.push({ id: id, x: x, y: y });
            [20, 46, 72, 98, 120].forEach(x => push('P' + x, x, 14));
            [8, 20, 33, 46, 58, 72, 84, 98, 120].forEach(x => push('M' + x, x, 38));
            [8, 33, 84, 98, 120].forEach(x => push('K' + x, x, 62));
            [8, 33, 84, 98, 120].forEach(x => push('Q' + x, x, 80));
            push('PW', 1.5, 14);
            push('MW', 1.5, 38);
            push('KW', 1.5, 62);
            push('ME', env.W - 1.5, 38);
            push('KE', env.W - 1.5, 62);
            push('QW', 1.5, 80);
            push('QE', env.W - 1.5, 80);
            push('S33', 33, env.H - 1.5);
            push('S84', 84, env.H - 1.5);
            push('S120', 120, env.H - 1.5);
            // the gathering points in front of the hospital, school and factory
            push('LH', 72, 62);
            push('LS', 45, 62);
            push('LF', 109, 38);
            return n;
        },
        exits: ['PW', 'MW', 'KW', 'QW', 'ME', 'KE', 'QE', 'S33', 'S84', 'S120'],

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
            // One consistent 20 mph town. The 20 signs sit beside the SLOW / give-way markings where traffic joins the
            // high street from the south (x 33 and x 84), and the station keeps its bus stop, STOP sign (in line with
            // the STOP marking) and parking sign. No stray 50 or no-entry signs on two-way streets.
            add(px2t(vx(33) + half + 8), highSouthY, 'sign_20', H.sign_20);
            add(px2t(vx(84) - half - 8), highSouthY, 'sign_20', H.sign_20);
            add(58 - 4.2, highSouthY, 'sign_busstop', H.sign_busstop);
            add(58, highSouthY, 'sign_stop', H.sign_stop);
            add(58 + 4.2, highSouthY, 'sign_parking', H.sign_parking);
            api.addDecal(58, 38 - 3 + 0.9, 'tex_stopmark');
            api.addDecal(46 - 2, 38 + 1.5, 'tex_manhole1');
            api.addDecal(72 + 2, 14 + 1.5, 'tex_manhole2');
        },
    });
})();
