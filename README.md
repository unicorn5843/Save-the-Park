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
