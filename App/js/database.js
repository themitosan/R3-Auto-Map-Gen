/*
	R3 Auto Map Gen.
	database.js
	
	Original database was imported from R3V2 / R3V3
*/

temp_DATABASE = {

	bio3: {

		// BioRand Objectives
		bioRandObjectives: {
			'R20C': {endsOn: 'R215'},
			'R30C': {endsOn: 'R30D'},
			'R30D': {endsOn: null},
			'R415': {endsOn: null},
			'R50C': {endsOn: 'R50C'},
			'R50D': {endsOn: null}
		},

		// Map list
		rdt: {
			'0000': {name: 'Unknown Map', location: 'Unknown', saveRoom: !1},
			'R100': {name: 'Warehouse Save Room', location: 'Uptown', saveRoom: !0},
			'R101': {name: 'Warehouse', location: 'Uptown', saveRoom: !1},
			'R102': {name: 'Warehouse Alley', location: 'Uptown', saveRoom: !1},
			'R103': {name: 'Warehouse Street', location: 'Uptown', saveRoom: !1},
			'R104': {name: 'Basement Alley', location: 'Uptown', saveRoom: !1},
			'R105': {name: 'Bar Jack Alley', location: 'Uptown', saveRoom: !1},
			'R106': {name: 'Boutique Street', location: 'Uptown', saveRoom: !1},
			'R107': {name: 'Bar Jack', location: 'Uptown', saveRoom: !1},
			'R108': {name: 'Barricade Alley', location: 'Uptown', saveRoom: !1},
			'R109': {name: 'Hydrant Alley', location: 'Uptown', saveRoom: !1},
			'R10A': {name: 'Main Street', location: 'Uptown', saveRoom: !1},
			'R10B': {name: 'Sales Office Alley', location: 'Uptown', saveRoom: !1},
			'R10C': {name: 'Hydrant Alley (Save)', location: 'Uptown', saveRoom: !0},
			'R10D': {name: 'Jill\'s Apartment', location: 'Uptown', saveRoom: !1},
			'R10E': {name: 'Back Alley', location: 'Uptown', saveRoom: !1},
			'R10F': {name: 'Boutique', location: 'Uptown', saveRoom: !1},
			'R110': {name: 'R.P.D. Gate', location: 'Police Station', saveRoom: !1},
			'R111': {name: 'R.P.D. Main Hall', location: 'Police Station', saveRoom: !0},
			'R112': {name: 'R.P.D. Office', location: 'Police Station', saveRoom: !1},
			'R113': {name: 'Files Room', location: 'Police Station', saveRoom: !1},
			'R114': {name: 'Corridor with ladder', location: 'Police Station', saveRoom: !1},
			'R115': {name: 'Corridor', location: 'Police Station', saveRoom: !1},
			'R116': {name: 'Press conference Room', location: 'Police Station', saveRoom: !1},
			'R117': {name: 'Dark Room', location: 'Police Station', saveRoom: !0},
			'R118': {name: '2F Corridor', location: 'Police Station', saveRoom: !1},
			'R119': {name: 'Corridor to S.T.A.R.S. Room', location: 'Police Station', saveRoom: !1},
			'R11A': {name: 'S.T.A.R.S. Room', location: 'Police Station', saveRoom: !1},
			'R11B': {name: 'Sales Office', location: 'Uptown', saveRoom: !1},
			'R11C': {name: 'Sales Office Storeroom', location: 'Uptown', saveRoom: !1},
			'R11D': {name: 'Warehouse Alley (Night)', location: 'Uptown', saveRoom: !1},
			'R11E': {name: 'Warehouse Street (Night)', location: 'Uptown', saveRoom: !1},
			'R11F': {name: 'Basement Alley (Night)', location: 'Uptown', saveRoom: !1},
			'R120': {name: 'Bar Jack Alley (Night)', location: 'Uptown', saveRoom: !1},
			'R121': {name: 'Boutique Street (Night)', location: 'Uptown', saveRoom: !1},
			'R122': {name: 'Barricade Alley (Night)', location: 'Uptown', saveRoom: !1},
			'R123': {name: 'Hydrant Alley (Night)', location: 'Uptown', saveRoom: !1},
			'R124': {name: 'Main Street (Night)', location: 'Uptown', saveRoom: !1},
			'R125': {name: 'R.P.D. Gates (Night)', location: 'Police Station', saveRoom: !1},
			'R200': {name: 'Bus Street', location: 'Uptown', saveRoom: !1},
			'R201': {name: 'Mechanic Parking Lot', location: 'Downtown', saveRoom: !1},
			'R202': {name: 'Parking Lot Back', location: 'Downtown', saveRoom: !1},
			'R203': {name: 'Construction Site', location: 'Downtown', saveRoom: !1},
			'R204': {name: 'Energy Station Street', location: 'Downtown', saveRoom: !1},
			'R205': {name: 'Grill 13 Street', location: 'Downtown', saveRoom: !1},
			'R206': {name: 'Shopping Dist.', location: 'Downtown', saveRoom: !1},
			'R207': {name: 'Raccon City Hall Street', location: 'Downtown', saveRoom: !1},
			'R208': {name: 'Raccon City Hall', location: 'Downtown', saveRoom: !1},
			'R209': {name: 'Party Party Alley', location: 'Downtown', saveRoom: !1},
			'R20A': {name: 'Giant Worm Alley', location: 'Downtown', saveRoom: !1},
			'R20B': {name: 'Trolley Street', location: 'Downtown', saveRoom: !1},
			'R20C': {name: 'Trolley', location: 'Downtown', saveRoom: !1},
			'R20D': {name: 'Stagla Gas Station', location: 'Downtown', saveRoom: !1},
			'R20E': {name: 'Stagla Street', location: 'Downtown', saveRoom: !1},
			'R20F': {name: 'Press (2F)', location: 'Downtown', saveRoom: !1},
			'R210': {name: 'Press (1F)', location: 'Downtown', saveRoom: !1},
			'R211': {name: 'Grill 13 (1F)', location: 'Downtown', saveRoom: !1},
			'R212': {name: 'Grill 13 (B1)', location: 'Downtown', saveRoom: !1},
			'R213': {name: 'Energy Station Entrance', location: 'Downtown', saveRoom: !1},
			'R214': {name: 'Energy Station', location: 'Downtown', saveRoom: !1},
			'R215': {name: 'Trolley (Running)', location: 'Downtown', saveRoom: !1},
			'R216': {name: 'Shopping Dist. Save Room', location: 'Downtown', saveRoom: !0},
			'R217': {name: 'Stagla Street (After)', location: 'Downtown', saveRoom: !1},
			'R218': {name: 'Fire Hose Alley', location: 'Uptown', saveRoom: !1},
			'R219': {name: 'Press (1F)', location: 'Downtown', saveRoom: !1},
			'R21A': {name: 'Parasite Alley', location: 'Uptown', saveRoom: !1},
			'R21B': {name: 'Mechanic\'s Office', location: 'Downtown', saveRoom: !0},
			'R300': {name: 'Chapel', location: 'Clock Tower', saveRoom: !0},
			'R301': {name: 'Piano Hall', location: 'Clock Tower', saveRoom: !1},
			'R302': {name: 'Dinner Room', location: 'Clock Tower', saveRoom: !1},
			'R303': {name: 'Clock Tower Garden', location: 'Clock Tower', saveRoom: !1},
			'R304': {name: 'Main Hall (1F)', location: 'Clock Tower', saveRoom: !1},
			'R305': {name: 'Resting Room', location: 'Clock Tower', saveRoom: !1},
			'R306': {name: 'Living Room', location: 'Clock Tower', saveRoom: !0},
			'R307': {name: 'Clock Tower Library', location: 'Clock Tower', saveRoom: !1},
			'R308': {name: 'Corridor to Clock Puzzle', location: 'Clock Tower', saveRoom: !1},
			'R309': {name: 'Clock Puzzle', location: 'Clock Tower', saveRoom: !1},
			'R30A': {name: 'Main Hall (2F)', location: 'Clock Tower', saveRoom: !1},
			'R30B': {name: 'Tower Balcony', location: 'Clock Tower', saveRoom: !1},
			'R30C': {name: 'Machinery Room', location: 'Clock Tower', saveRoom: !0},
			'R30D': {name: 'Clock Tower Garden (Nemesis)', location: 'Clock Tower', saveRoom: !1},
			'R30E': {name: 'Main Hall Destroyed', location: 'Clock Tower', saveRoom: !1},
			'R30F': {name: 'Piano Hall & Dinner Room', location: 'Clock Tower', saveRoom: !1},
			'R310': {name: 'Chapel (Carlos)', location: 'Clock Tower', saveRoom: !0},
			'R311': {name: 'Resting Room', location: 'Clock Tower', saveRoom: !1},
			'R312': {name: 'Living Room', location: 'Clock Tower', saveRoom: !0},
			'R313': {name: 'Clock Tower Library (Carlos)', location: 'Clock Tower', saveRoom: !1},
			'R314': {name: 'Corridor to Clock Puzzle (Carlos)', location: 'Clock Tower', saveRoom: !1},
			'R315': {name: 'Clock Puzzle (Carlos)', location: 'Clock Tower', saveRoom: !1},
			'R316': {name: 'Main Hall Destroyed (Carlos)', location: 'Clock Tower', saveRoom: !1},
			'R317': {name: 'Piano Hall & Dinner Room (Carlos)', location: 'Clock Tower', saveRoom: !1},
			'R400': {name: 'Hospital Street Destroyed', location: 'Park', saveRoom: !1},
			'R401': {name: 'Park Office', location: 'Park', saveRoom: !0},
			'R402': {name: 'Hospital Entrance', location: 'Hospital', saveRoom: !1},
			'R403': {name: 'Hospital Office', location: 'Hospital', saveRoom: !0},
			'R404': {name: 'Waiting Room', location: 'Hospital', saveRoom: !1},
			'R405': {name: 'Corridor (4F)', location: 'Hospital', saveRoom: !1},
			'R406': {name: 'Room 402', location: 'Hospital', saveRoom: !1},
			'R407': {name: 'Room 401', location: 'Hospital', saveRoom: !1},
			'R408': {name: 'Data Room', location: 'Hospital', saveRoom: !1},
			'R409': {name: 'Corridor (B3)', location: 'Hospital', saveRoom: !1},
			'R40A': {name: 'Laboratory 1', location: 'Hospital', saveRoom: !1},
			'R40B': {name: 'Laboratory 2', location: 'Hospital', saveRoom: !1},
			'R40C': {name: 'Park Entrance', location: 'Park', saveRoom: !1},
			'R40D': {name: 'Water Pump Puzzle', location: 'Park', saveRoom: !1},
			'R40E': {name: 'Park \"L\" Bridge', location: 'Park', saveRoom: !1},
			'R40F': {name: 'Park Exit', location: 'Park', saveRoom: !1},
			'R410': {name: 'Sewer Passage', location: 'Park', saveRoom: !1},
			'R411': {name: 'Graveyard', location: 'Park', saveRoom: !1},
			'R412': {name: 'Park Warehouse', location: 'Park', saveRoom: !1},
			'R413': {name: 'Park Warehouse Save Room', location: 'Park', saveRoom: !0},
			'R414': {name: 'Park Secret Room', location: 'Park', saveRoom: !1},
			'R415': {name: 'Park Graveyard (Worm)', location: 'Park', saveRoom: !1},
			'R416': {name: '[UNUSED] Copy of R510 (Bridge)', location: 'Park', saveRoom: !1},
			'R417': {name: 'Park Street', location: 'Park', saveRoom: !1},
			'R500': {name: 'Factory Entrance', location: 'Dead Factory', saveRoom: !1},
			'R501': {name: 'Resting Room', location: 'Dead Factory', saveRoom: !0},
			'R502': {name: 'Steam Room', location: 'Dead Factory', saveRoom: !1},
			'R503': {name: 'Control Room (1F)', location: 'Dead Factory', saveRoom: !1},
			'R504': {name: 'Corridor to Monitor Room', location: 'Dead Factory', saveRoom: !1},
			'R505': {name: 'Monitor Room', location: 'Dead Factory', saveRoom: !0},
			'R506': {name: 'Water Sample Room', location: 'Dead Factory', saveRoom: !1},
			'R507': {name: 'Control Room (B1)', location: 'Dead Factory', saveRoom: !1},
			'R508': {name: 'Corridor to Disposal Room', location: 'Dead Factory', saveRoom: !1},
			'R509': {name: 'Disposal Room', location: 'Dead Factory', saveRoom: !1},
			'R50A': {name: 'Communication Room', location: 'Dead Factory', saveRoom: !1},
			'R50B': {name: 'Corridor to Car Cemetery', location: 'Dead Factory', saveRoom: !1},
			'R50C': {name: 'Car Cemetery', location: 'Dead Factory', saveRoom: !1},
			'R50D': {name: 'Incinerator Room', location: 'Dead Factory', saveRoom: !1},
			'R50E': {name: 'Extraction Point', location: 'Dead Factory', saveRoom: !1},
			'R50F': {name: 'Elevator to Extraction Point', location: 'Dead Factory', saveRoom: !1},
			'R510': {name: 'Bridge to Dead Factory', location: 'Park', saveRoom: !1},
			'R600': {name: '(Merc) Warehouse Save Room', location: 'Uptown', saveRoom: !0},
			'R601': {name: '(Merc) Warehouse', location: 'Uptown', saveRoom: !1},
			'R607': {name: '(Merc) Bar Jack', location: 'Uptown', saveRoom: !1},
			'R60B': {name: '(Merc) Pharmacy Street', location: 'Uptown', saveRoom: !1},
			'R60E': {name: '(Merc) Back Alley', location: 'Uptown', saveRoom: !1},
			'R60F': {name: '(Merc) Unknown Location', location: 'Unknown', saveRoom: !1},
			'R61B': {name: '(Merc) Pharmacy', location: 'Uptown', saveRoom: !1},
			'R61C': {name: '(Merc) Pharmacy Product Stock', location: 'Uptown', saveRoom: !1},
			'R61D': {name: '(Merc) Alley 1', location: 'Uptown', saveRoom: !1},
			'R61E': {name: '(Merc) Street 1', location: 'Uptown', saveRoom: !1},
			'R61F': {name: '(Merc) Alley 2', location: 'Uptown', saveRoom: !1},
			'R620': {name: '(Merc) Alley 3', location: 'Uptown', saveRoom: !1},
			'R621': {name: '(Merc) Boutique Street', location: 'Uptown', saveRoom: !1},
			'R622': {name: '(Merc) Alley 5', location: 'Uptown', saveRoom: !1},
			'R623': {name: '(Merc) Passage to Pharmacy', location: 'Uptown', saveRoom: !1},
			'R624': {name: '(Merc) Main Street', location: 'Uptown', saveRoom: !1},
			'R700': {name: '(Merc) Street 2 ', location: 'Downtown', saveRoom: !1},
			'R701': {name: '(Merc) Mechanic Parking Lot', location: 'Downtown', saveRoom: !1},
			'R702': {name: '(Merc) Street to Alley 1', location: 'Downtown', saveRoom: !1},
			'R703': {name: '(Merc) Alley 1', location: 'Downtown', saveRoom: !1},
			'R704': {name: '(Merc) Energy Station Street', location: 'Downtown', saveRoom: !1},
			'R705': {name: '(Merc) Grill 13 Street', location: 'Downtown', saveRoom: !1},
			'R706': {name: '(Merc) Shopping Dist.', location: 'Downtown', saveRoom: !1},
			'R707': {name: '(Merc) Raccon City Hall Street', location: 'Downtown', saveRoom: !1},
			'R708': {name: '(Merc) Raccon City Hall', location: 'Downtown', saveRoom: !1},
			'R709': {name: '(Merc) Shopping Dist. 2', location: 'Downtown', saveRoom: !1},
			'R70A': {name: '(Merc) Shopping Dist. 3', location: 'Downtown', saveRoom: !1},
			'R70B': {name: '(Merc) Trolley Street', location: 'Downtown', saveRoom: !1},
			'R70C': {name: '(Merc) Trolley', location: 'Downtown', saveRoom: !1},
			'R70D': {name: '(Merc) Stagla Gas Station', location: 'Downtown', saveRoom: !1},
			'R70E': {name: '(Merc) Stagla Street', location: 'Downtown', saveRoom: !1},
			'R70F': {name: '(Merc) Press (2F)', location: 'Downtown', saveRoom: !1},
			'R710': {name: '(Merc) Press (1F)', location: 'Downtown', saveRoom: !1},
			'R711': {name: '(Merc) Grill 13', location: 'Downtown', saveRoom: !1},
			'R712': {name: '(Merc) Grill 13 (B1)', location: 'Downtown', saveRoom: !1},
			'R713': {name: '(Merc) Energy Station Entrance', location: 'Downtown', saveRoom: !1},
			'R714': {name: '(Merc) Energy Station', location: 'Downtown', saveRoom: !1},
			'R718': {name: '(Merc) Alley to Street 2', location: 'Uptown', saveRoom: !1},
			'R71A': {name: '(Merc) Alley 6', location: 'Uptown', saveRoom: !1},
			'R71B': {name: '(Merc) Mechanic\'s Office', location: 'Downtown', saveRoom: !1}
		}

	}

}