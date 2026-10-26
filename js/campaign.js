/* =====================================================================
   CORDON — campaign data (js/campaign.js)
   ---------------------------------------------------------------------
   Pure data. No code to touch: edit the words, numbers and cities freely.

   One chapter = one district = 10 levels ("nights"). After the last
   chapter the list starts again (harder, because the level number keeps
   climbing).

   Per chapter:
     city / district / title / cause   what the player reads
     intro                             briefing card shown when the chapter opens
     introTrusted / introHostile       alternative card text when public opinion is high / low
     nights[0..9]                      one-line story beat for each level
     night                             0 = broad daylight ... 0.6 = pitch dark
     tint                              colour of the darkness (night overlay)
     zones.res / zones.biz             last map column of the Residential / Business area
                                       (everything after it is Industrial) -> changes what is built
     seed                              change it and the buildings are laid out differently
     crowd.protesters / agitators /    multipliers for how many of each turn up
           rioters / bricks
     startMood                         how angry the crowd is when a night begins (0-100)

   MAP IDEAS: today every district re-skins the same street layout (new buildings,
   zones, lighting, crowd). To add a truly different road layout later, give a
   chapter its own  mapId  and a matching entry in the game's MAPS list.
   ===================================================================== */
window.CORDON_CAMPAIGN = {
    chapterLength: 10,
    chapters: [
        {
            id: 'rent', city: 'Manchester', district: 'Moss Terrace', title: 'Rent Night',
            cause: 'Tenants march against a 40% rent rise.',
            intro: 'A landlord has put up rents across the whole terrace. Families, pensioners and students are marching to the station to hand in a petition. Most of them are just angry and tired. Keep it calm and keep it that way.',
            introTrusted: 'The neighbourhood remembers you from last time. Some people have even brought flasks of tea. Do not waste that goodwill.',
            introHostile: 'Word has got around about how the last night went. Windows are shuttered and the marchers are already on edge.',
            nights: ['The first march sets out', 'Placards and flasks of tea', 'A landlord\'s van is spotted', 'Kids on shoulders, drums in hand',
                'Midnight vigil at the lights', 'Someone is stirring things up', 'The petition is torn', 'Bottles on the back streets',
                'The crowd will not go home', 'Last night of the rent strike'],
            night: 0.22, tint: '#1b2350', zones: { res: 66, biz: 82 }, seed: 11,
            crowd: { protesters: 1.8, agitators: 0.4, rioters: 0.55, bricks: 0.5 }, startMood: 14,
        },
        {
            id: 'dock', city: 'Bristol', district: 'Harbour Gate', title: 'Dock Gate',
            cause: 'Dockers occupy the gate as the yard is closed for good.',
            intro: 'The dockyard has announced it is shutting, with 600 jobs lost. The workers are at the gate and there are plenty of hotheads in the crowd. Warehouses and cranes surround you, and a lot of it could burn.',
            introTrusted: 'The union rep has asked his people to keep the gate clear for you. That trust can break fast.',
            introHostile: 'The yard gangs have been told the police cannot be trusted. Expect bricks before words.',
            nights: ['Shift change at the gate', 'The yard is chained shut', 'Forklifts across the road', 'Fires in oil drums',
                'A lorry is turned over', 'Union men step between the lines', 'Outsiders in hoods arrive', 'The warehouse roof goes up',
                'Dawn shift refuses to leave', 'The last ship sails'],
            night: 0.3, tint: '#14203f', zones: { res: 30, biz: 52 }, seed: 23,
            crowd: { protesters: 1.2, agitators: 1.0, rioters: 0.95, bricks: 1.0 }, startMood: 30,
        },
        {
            id: 'bus', city: 'Glasgow', district: 'Tenement Row', title: 'Last Bus',
            cause: 'Night buses are cut. People are stranded after dark.',
            intro: 'The council has scrapped the night buses. Shift workers and students are walking home across the city in the dark and gathering at every junction. It is late, cold, and people are on edge. Hold the junctions and stay calm.',
            introTrusted: 'Locals are walking the crowd home in small groups. Your calm last time is paying off.',
            introHostile: 'Nobody believes the police will help tonight. Shouts carry for streets.',
            nights: ['Dark falls early on Tenement Row', 'Stranded and shouting at the stop', 'Taxi ranks blocked', 'A bus shelter smashed',
                'Cold rain, hot tempers', 'Someone is leading chants from the back', 'Strangers hand out bricks', 'The street lights fail',
                'Half the crowd walks home', 'First bus at dawn'],
            night: 0.5, tint: '#0f1838', zones: { res: 40, biz: 76 }, seed: 37,
            crowd: { protesters: 1.3, agitators: 1.3, rioters: 0.9, bricks: 1.0 }, startMood: 34,
        },
        {
            id: 'cup', city: 'Cardiff', district: 'Stadium Quarter', title: 'Cup Night',
            cause: 'A cup final ends badly. Rival fans meet in the street.',
            intro: 'Not a protest. A cup final has finished in a defeat, thousands of drunk and furious fans are pouring out, and a few have come looking for a fight. There is almost nobody peaceful here. Hit them hard, hit them fast, and hold the station.',
            introTrusted: 'Fans know you kept the last match calm. A few are even telling their mates to back off.',
            introHostile: 'They are singing about you. This will be rough.',
            nights: ['Full time. It all goes quiet, then loud', 'Flares in the car park', 'Fans pour out of every exit', 'Bins used as barricades',
                'Scarves and bottles', 'The away end breaks out', 'Rival firms meet at the lights', 'Pub windows go in',
                'Mounted charge ordered', 'The last drunk goes home'],
            night: 0.42, tint: '#151330', zones: { res: 24, biz: 80 }, seed: 41,
            crowd: { protesters: 0.3, agitators: 0.5, rioters: 1.4, bricks: 1.3 }, startMood: 55,
        },
        {
            id: 'walkout', city: 'Leeds', district: 'University Mile', title: 'The Walk-Out',
            cause: 'Students walk out over library and hall closures.',
            intro: 'Thousands of students have walked out in the afternoon sun. This is a peaceful crowd, but a handful of organised agitators are working through it. If you swing a baton at a student, the whole street will turn. Find the agitators. Arrest them quietly.',
            introTrusted: 'The student union has asked marchers to cooperate. Do not let one agitator spoil that.',
            introHostile: 'Phones are out, filming everything. One bad move and it is on the news.',
            nights: ['Walk-out at noon', 'Sit-in on the main road', 'Drums and megaphones', 'Chalk on the pavement',
                'Hooded figures in the crowd', 'A bottle thrown from nowhere', 'Cameras everywhere', 'Rumours spread online',
                'Teachers join the march', 'The library stays open'],
            night: 0.1, tint: '#2a3050', zones: { res: 49, biz: 76 }, seed: 53,
            crowd: { protesters: 2.0, agitators: 1.8, rioters: 0.5, bricks: 0.6 }, startMood: 18,
        },
        {
            id: 'summer', city: 'London', district: 'The Embankment', title: 'The Long Hot Summer',
            cause: 'Heatwave, blackouts, strikes. The whole city boils over.',
            intro: 'Heatwave, power cuts and a transport strike have all arrived at once. Protesters, agitators and rioters all fill the streets, and everyone is angry for a different reason. Everything you have learned is needed tonight.',
            introTrusted: 'The city has been watching how you handle yourselves. People are willing to listen.',
            introHostile: 'The papers have called you the problem. Few will listen to you tonight.',
            nights: ['Power cuts at sundown', 'Trains stop, crowds build', 'Heat. Heavy, close and angry', 'Fires on three streets',
                'The river bridge is blocked', 'Looters follow the marchers', 'Everyone is shouting different things', 'The crowd splits in two',
                'Dawn. Exhausted on both sides', 'The city holds its breath'],
            night: 0.55, tint: '#120f2e', zones: { res: 20, biz: 85 }, seed: 67,
            crowd: { protesters: 1.5, agitators: 1.5, rioters: 1.2, bricks: 1.1 }, startMood: 42,
        },
    ],
    // How the public sees you, by opinion score (0-100). Used for headlines and next-level modifiers.
    opinionLabels: [
        { min: 75, name: 'Trusted', headline: 'Locals praise a firm but fair police response.' },
        { min: 55, name: 'Respected', headline: 'Police handled the night professionally.' },
        { min: 40, name: 'Divided', headline: 'The city is split over the police response.' },
        { min: 25, name: 'Resented', headline: 'Residents accuse police of heavy-handed tactics.' },
        { min: 0, name: 'Hated', headline: 'Calls for an inquiry as trust in police collapses.' },
    ],
};
