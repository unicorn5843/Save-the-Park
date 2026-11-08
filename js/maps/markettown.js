/* =====================================================================
   CORDON — MAP: "Market Town Centre"  (js/maps/markettown.js)
   ---------------------------------------------------------------------
   A busy county-town centre, laid out like a real one rather than a grid.

     - the RING ROAD: a long octagon round the middle of town. Its four
       corners are DIAGONAL roads, so the streets are no longer all
       straight lines
     - the HIGH STREET runs east-west straight through the ring, with the
       police station on its south side
     - GAOLGATE-style centre road (x 68) runs north-south through the whole
       town, with two more diagonal streets cutting across the quarters
       that sit either side of it
     - the TOWN HALL (council building) sits on the High Street. Most
       protests here are aimed at it, not at the station. There is also a
       library, a school, a hospital and a factory on the edge of town.

   Only the road layout is borrowed from a real town centre. No street or
   town names are ever shown anywhere in the game.

   Every junction is mapped by hand below (the nodes, the diagonal links,
   and the diagonal junction arms), because the diagonal streets are not
   found automatically the way straight roads are.
   ===================================================================== */
(function () {
    'use strict';
    CordonMaps.register({
        id: 'markettown',
        name: 'Market Town Centre',
        w: 142, h: 106,
        roadW: 6,

        // ---- straight roads (7 tiles wide, like every road) ----
        roads: [
            { dir: 'h', c: 14, a: 0, b: 'end', sa: 0, sb: 'end' },          // northern road (top of the ring)
            { dir: 'h', c: 52, a: 0, b: 'end', sa: 0, sb: 'end' },          // HIGH STREET
            { dir: 'h', c: 90, a: 0, b: 'end', sa: 0, sb: 'end' },          // southern road (bottom of the ring)
            { dir: 'v', c: 68, a: 0, b: 105, sa: 0, sb: 105, exit: 'S' },   // the centre road, edge to edge
            { dir: 'v', c: 22, a: 36, b: 68, sa: 36, sb: 68 },              // west side of the ring
            { dir: 'v', c: 114, a: 36, b: 68, sa: 36, sb: 68 },             // east side of the ring
        ],

        // ---- diagonal roads (tile coordinates of the two end points) ----
        diagonals: [
            { x1: 22, y1: 36, x2: 44, y2: 14 },      // ring corner, north-west
            { x1: 92, y1: 14, x2: 114, y2: 36 },     // ring corner, north-east
            { x1: 114, y1: 68, x2: 92, y2: 90 },     // ring corner, south-east
            { x1: 44, y1: 90, x2: 22, y2: 68 },      // ring corner, south-west
            { x1: 68, y1: 38, x2: 92, y2: 14 },      // cut-through, north half
            { x1: 68, y1: 66, x2: 44, y2: 90 },      // cut-through, south half
        ],

        // The nodes at each end of a diagonal road, so crowds and vehicles can use it.
        links: [
            ['R22a', 'A44'], ['A92', 'R114a'], ['R114b', 'C92'], ['C44', 'R22b'],
            ['G38', 'A92'], ['G66', 'C44'],
        ],

        // Junctions that have a diagonal arm (these give the player junction posts on the diagonal streets).
        diagJunctions: [
            { x: 44, y: 14, arms: ['w', 'e', 'sw'] },
            { x: 92, y: 14, arms: ['w', 'e', 'se', 'sw'] },
            { x: 68, y: 38, arms: ['n', 's', 'ne'] },
            { x: 68, y: 66, arms: ['n', 's', 'sw'] },
            { x: 44, y: 90, arms: ['w', 'e', 'nw', 'ne'] },
            { x: 92, y: 90, arms: ['w', 'e', 'ne'] },
        ],

        // Big buildings on fixed plots (x = left tile, y = bottom row; the door faces the street below).
        // weight: how likely a protest is to be about that building (the town hall is the favourite).
        landmarks: [
            { type: 'townhall', x: 46,  y: 47, node: 'LT', weight: 4 },
            { type: 'library',  x: 30,  y: 47, node: 'LL', weight: 1.5 },
            { type: 'school',   x: 96,  y: 47, node: 'LS', weight: 1 },
            { type: 'factory',  x: 120, y: 47, node: 'LF', weight: 1 },
            { type: 'hospital', x: 74,  y: 85, node: 'LH', weight: 1.5 },
        ],

        station: { x0: 82, y0: 57, w: 12, h: 9 },
        base: { x: 88, y: 52 },
        baseNode: 'B88',

        nodes: function (env) {
            const n = [];
            const push = (id, x, y) => n.push({ id: id, x: x, y: y });
            // northern road
            push('AW', 1.5, 14); push('A44', 44, 14); push('A68', 68, 14); push('A92', 92, 14); push('AE', env.W - 1.5, 14);
            // centre road, north to south
            push('GN', 68, 1.5); push('G38', 68, 38); push('G52', 68, 52); push('G66', 68, 66); push('GS', 68, env.H - 1.5);
            // High Street
            push('HW', 1.5, 52); push('H22', 22, 52); push('LL', 35, 52); push('LT', 52, 52);
            push('B88', 88, 52); push('LS', 101, 52); push('H114', 114, 52); push('LF', 126, 52); push('HE', env.W - 1.5, 52);
            // southern road
            push('CW', 1.5, 90); push('C44', 44, 90); push('C68', 68, 90); push('LH', 80, 90); push('C92', 92, 90); push('CE', env.W - 1.5, 90);
            // the bends where the ring's side roads meet the diagonal corners
            push('R22a', 22, 36); push('R22b', 22, 68); push('R114a', 114, 36); push('R114b', 114, 68);
            return n;
        },
        exits: ['AW', 'AE', 'HW', 'HE', 'CW', 'CE', 'GN', 'GS'],

        signals: { row: 52, xs: [22, 68, 114] },
        start: { syndicates: [[-8, 0], [0, 0], [8, 0]], waterCannon: [-10, 0], rubberVan: [-14, 0] },

        // Which part of town a tile belongs to decides what is built there:
        // shops and offices in the middle, houses on the edges, works to the east.
        zoneAt: function (tx, ty) {
            if (tx >= 118) return 'ind';
            if (tx < 19 || ty < 10 || ty > 96) return 'res';
            return 'biz';
        },

        decorate: function (api) {
            const L = api.L, half = api.half, TILE = api.TILE, px2t = api.px2t, add = api.addFurniture, H = api.drawH;
            const highNorthY = px2t(L.H[1].c - half - 8);      // north pavement of the High Street
            const highSouthY = px2t(L.H[1].c + half + 8);      // south pavement, in front of the station
            const vx = tx => (tx + 0.5) * TILE;
            add(88 - 4.2, highSouthY, 'sign_busstop', H.sign_busstop);
            add(88, highSouthY, 'sign_stop', H.sign_stop);
            add(88 + 4.2, highSouthY, 'sign_parking', H.sign_parking);
            add(px2t(vx(22) + half + 8), highNorthY, 'sign_20', H.sign_20);
            add(px2t(vx(114) - half - 8), highNorthY, 'sign_20', H.sign_20);
            add(px2t(vx(68) + half + 8), highNorthY, 'sign_pedestrian', H.sign_pedestrian);
            api.addDecal(88, 52 - 3 + 0.9, 'tex_stopmark');
            api.addDecal(52, 52 + 1.5, 'tex_manhole1');
            api.addDecal(101, 52 - 1.5, 'tex_manhole2');
        },
    });
})();
