/*
	R3 Auto Map Gen.
	options.js
*/

temp_OPTIONS = {

	/*
		Variables
	*/
	latestFile: '',
	fileName: 'RE3_MAP',

	/*
		Functions
	*/

	// Update canvas zoom
	updateCanvasZoom: function(){
		const cZoom = document.getElementById('OPTION_mapCanvasZoom').value;
		document.getElementById('LABEL_mapCanvasZoom').innerHTML = cZoom;
		TMS.css('APP_MAP_CANVAS', {'zoom': cZoom});
	},

	// Reset canvas zoom
	resetCanvasZoom: function(){
		document.getElementById('OPTION_mapCanvasZoom').value = 1;
		this.updateCanvasZoom();
	},

	// Reset map
	resetMap: function(){

		// Reset vars
		APP.graphics.addedMaps = {};
		APP.graphics.addedLines = {};
		APP.gameHook.mapHistory = [];
		APP.graphics.addedMapHistory = [];

		// Reset drag
		APP.graphics.enableCanvasDrag = !0;
		APP.graphics.toggleDragMapCanvas();

		// Reset HTML
		document.getElementById('APP_MAP_CANVAS').innerHTML = '';
		TMS.css('APP_MAP_CANVAS', {'top': '-50000px', 'left': '-50000px'});

	},

	// Save map
	saveMap: function(quickSave){

		// Update map locations
		Object.keys(APP.graphics.addedMaps).forEach(function(cMap){

			var top = parseFloat(TMS.getCssData('ROOM_' + cMap, 'top').replace('px', '')),
				left = parseFloat(TMS.getCssData('ROOM_' + cMap, 'left').replace('px', ''));

			APP.graphics.addedMaps[cMap].y = top;
			APP.graphics.addedMaps[cMap].x = left;

		});

		const mPos = {
				y: parseFloat(TMS.getCssData('APP_MAP_CANVAS', 'top').replace('px', '')),
				x: parseFloat(TMS.getCssData('APP_MAP_CANVAS', 'left').replace('px', ''))
			},
			newData = JSON.stringify({
				canvasPos: mPos,
				addedList: APP.graphics.addedMaps,
				history: APP.graphics.addedMapHistory,
			});

		// Check if "is BioRand" is active
		var checkBioRand = document.getElementById('CHECKBOX_isBioRand').checked;
		if (checkBioRand === !0){
		
			const randDataPath = APP.options.settingsData.gamePath + '/mod_biorand/description.txt';
			if (APP.fs.existsSync(randDataPath) === !0){
				const randDesc = APP.fs.readFileSync(randDataPath, 'utf8');
				APP.options.fileName = randDesc.slice(randDesc.indexOf('Seed: ') + 6).replace('\r\n', '');
			}
		
		}

		// Check if file exists
		if (quickSave === !0 && APP.fs.existsSync(APP.options.latestFile) === !0){

			try {

				// Write file
				APP.fs.writeFileSync(APP.options.latestFile, newData, 'utf8');
				console.info('Map updated successfully!\n' + APP.options.latestFile);

				// Center map
				APP.graphics.updatePlayerPos();

				// Set message
				var msg = document.getElementById('LABEL_mapDragStatus').innerHTML;
				document.getElementById('LABEL_mapDragStatus').innerHTML = ' - Map file was updated successfully! (' + APP.options.fileName + ')';
				setTimeout(function(){
					document.getElementById('LABEL_mapDragStatus').innerHTML = msg;
				}, 1500);

			} catch (err) {
				window.alert('ERROR - Unable to save map!\nPath: ' + APP.options.latestFile + '\n\n' + err);
				throw new Error(err);
			}

		} else {

			// Open save dialog
			APP.filemanager.saveFile({
				ext: '.json',
				mode: 'utf8',
				content: newData,
				fileName: APP.options.fileName + '.json',
				callback: function(path){
					window.alert('Save successfull!\nPath: ' + path);
					APP.options.fileName = APP.path.parse(path).name;
					APP.options.latestFile = path;
				}
			});

		}

	},

	// Load map
	loadMapProcess: function(fPath){

		if (APP.fs.existsSync(fPath) === !0){

			// Start load process
			var startHookAfter = !1,
				saveData = JSON.parse(APP.fs.readFileSync(fPath, 'utf8'));

			// Set latest file
			APP.options.latestFile = fPath;

			if (APP.gameHook.gameActive === !0){
				startHookAfter = !0;
				APP.gameHook.stop();
			}

			// Reset map
			APP.options.resetMap();

			saveData.history.forEach(function(cAction){
				APP.graphics.pushMap(cAction.mapName, cAction.parent);
			});

			Object.keys(APP.graphics.addedMaps).forEach(function(cMap){

				// Update data
				APP.graphics.addedMaps[cMap].x = saveData.addedList[cMap].x;
				APP.graphics.addedMaps[cMap].y = saveData.addedList[cMap].y;

				// Update map positions
				TMS.css('ROOM_' + cMap, {
					'top': saveData.addedList[cMap].y + 'px',
					'left': saveData.addedList[cMap].x + 'px'
				});

			});

			// Update lines
			APP.graphics.updateLines();

			// Update canvas pos.
			TMS.css('APP_MAP_CANVAS', {
				'top': saveData.canvasPos.y + 'px',
				'left': saveData.canvasPos.x + 'px'
			});

			// Release reload button
			document.getElementById('BTN_MAP_RELOAD').disabled = '';

			if (startHookAfter === !0){
				APP.gameHook.seekGame();
			}

		}

	},

	// Load map
	loadMapFile: function(){
		APP.filemanager.selectFile('.json', function(path){
			APP.options.loadMapProcess(path);
		});
	},

	// Load latest file saved / loaded
	loadLatestFile: function(){
		APP.options.loadMapProcess(APP.options.latestFile);
	},

	/*
		Settings
	*/

	// Settings data
	settingsData: {
		memoryData: {
			stage: '0x00A673C6',
			room: '0x00A673C8'
		},
		gamePath: '',
		exeName: 'BIOHAZARD(R) 3 PC.exe'
	},

	// Load app settings
	loadSettings: function(){

		// Get file path
		const fPath = nw.__dirname + '/Settings.json';

		if (APP.fs.existsSync(fPath) === !1){
			APP.options.saveSettings();
		}

		// Load file
		this.settingsData = JSON.parse(APP.fs.readFileSync(fPath, 'utf8'));

		// Check if has BioRand mod installed
		if (APP.fs.existsSync(this.settingsData.gamePath + '/mod_biorand') === !0){
			document.getElementById('CHECKBOX_isBioRand').checked = !0
		}

	},

	// Save app settings
	saveSettings: function(){

		try {
			APP.fs.writeFileSync(nw.__dirname + '/Settings.json', JSON.stringify(this.settingsData), 'utf8');
		} catch (err) {
			window.alert('ERROR - Unable to save settings!\n' + err);
			throw new Error(err);
		}

	},

	// Get game path / data
	getGamePath: function(){

		// Check if game is running
		if (APP.gameHook.gameActive === !1){

			// Main popup
			window.alert('INFO: After closing this message, select your main game executable.');

			// Select game executable
			APP.filemanager.selectFile('.exe', function(path){

				// Get path data
				var canSave = !0,
					pData = APP.path.parse(path);

				// Set game data
				APP.options.settingsData.exeName = pData.base;
				APP.options.settingsData.gamePath = pData.dir;

				// Set ram pos.
				APP.options.settingsData.memoryData.stage = window.prompt('Please insert ram pos. for "Stage":\n\n[Example: "0x00A673C6" (without quotes) for Classic REbirth 1.1.0 SourceNext patch]');
				APP.options.settingsData.memoryData.room = window.prompt('Please insert ram pos. for "Room":\n\n[Example: "0x00A673C8" (without quotes) for Classic REbirth 1.1.0 SourceNext patch]');

				// Check input
				var s = APP.options.settingsData.memoryData.stage,
					r = APP.options.settingsData.memoryData.room;

				if (s === '' || s  === null || s.length !== 10){
					canSave = !1;
				}
				if (r === '' || r  === null || r.length !== 10){
					canSave = !1;
				}

				// Check if can save settings
				if (canSave === !0){

					// Update settings file
					APP.options.saveSettings();

					// Display success message
					window.alert('INFO: Process complete!');

					// Load new settings
					APP.options.loadSettings();

				}

			});

		}

	}

}