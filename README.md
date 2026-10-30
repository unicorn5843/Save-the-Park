# Save-the-Park
Save the Park game

## Update notes
- Main menu (Play / Skills / Settings / Zombie Mode) with a 2000s blue theme; pause button in the tactics panel.
- Parked vehicles from the vehicle pack are placed along the kerbs with a new random layout every game
  (atlas: assets/map/vehicles/parked_atlas.png, data is inlined in index.html as PARKED_ATLAS).
- Commander per syndicate (units_sheet.png row 4): boosts damage/speed/defence, heals nearby officers, shouts orders.
- K9 handler = arrest-team look with a round shield (units_sheet.png row 2). German Shepherd sheet: assets/units/k9_gsd_sheet.png
- Realistic spray art: assets/fx/gas_plume_sheet.png and assets/fx/water_jet_sheet.png
- Menu art: assets/ui/ (pixel pieces from the Pixel UI pack, CC BY 4.0 credit shown on the menu)

## Update 2 notes
- Station redesigned (assets/map/station/police_station.png): UK brick wing + Battenburg entrance with blue lamp + glass annex. It now sits
  SOUTH of the bottom road (tiles STATION_TX0/STATION_TY0 in index.html) so units and vehicles can drive past. Blue lamp + POLICE plaque on the pavement.
- Map is bigger: 108x77 tiles. The original layout is unchanged; the station row is the vertical middle. New southern district: a new
  east-west street (ROAD_Y_SOUTH), the x=30/78 roads continue south, and a new raider gate S54 below the station.
- Gas officers: units_sheet.png row 5 + a raised canister drawn in code (gasPose / gasMuzzle). The spray starts at the canister nozzle.
- Ambulance (Station panel > Send Ambulance): assets/map/vehicles/ambulance_sheet.png. Drives to the most injured syndicate and heals nearby units. 90s restock.
- Camera no longer follows by itself. It only glides to a syndicate when you tap its S1/S2/S3 button.

## Update 3 notes: maps, protesters and rioters, tactics
- **Maps live in `js/maps/`.** `base.js` is the original street layout (the safe fallback), `promenade.js` is a seaside town
  (sea and beach along the top, promenade, high street, back road). `mapkit.js` is the shared reader and never needs editing.
  To add a map: copy `promenade.js`, change the road numbers, add one `<script src="js/maps/yourmap.js">` line to `index.html`
  and `zombie.html` (next to the other map lines), then either give a campaign chapter `mapId: 'yourmap'` in `js/campaign.js`
  or pick it under Settings > Map. No street names are ever shown.
- **Map picker:** Settings > Map (main game), the MAP button on the Zombie Mode menu, and the :map: button in the in-game TEST panel.
- **A night is a protest.** Peaceful protesters march in with a plan (hold a rally at the station, or march past it and on). Rioters are
  hidden in the crowd, arrive later from an edge, or are made when the crowd turns. Every new bout of trouble sounds the emergency siren.
  When the street settles the march carries on. Only rioters can be arrested or sent a dog.
- **Blocking a march:** protesters take another street if there is one. If they are stopped with no way round they get angry, and
  repeated blocked marches over several nights make the crowd riot sooner (`game.grievance`).
- **Rioters read your line:** they look for an easier target (an undefended building, a repair crew) or another road round a strong line.
- **Arrest:** three taps per syndicate, one arrest officer per tap. They carry the rioter all the way to the station and the tap comes
  back when the officer is back on the line. **Gas:** after spraying, the gas officers return to the station to refill. **K9:** unchanged.
- **Syndicates turn to face** the nearest threat on their own. Stack Left/Right are now **File Left/File Right**, and left really is left.
- **Adaptive difficulty** (`js/difficulty.js`, used by both games): after each night the game judges how hard it was and nudges the next
  one so it stays a close fight. Level is remembered between games (not in Test Mode).
- Ambulance drives on the road only. Messages stack in one column so nothing overlaps; the stats/strengths box is gone.
