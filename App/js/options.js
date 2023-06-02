/*
	R3 Auto Map Gen.
	options.js
*/

temp_OPTIONS = {

	/*
		Variables
	*/
	latestFile: '',
	hideTopMenu: !1,
	isMapLoading: !1,
	adjustFontSizeTimeout: void 0,
	bioRandObjectives: {
		reset: !1,
		current: null,
		parentMap: null
	},

	/*
		BioRand Functions
	*/

	// Update BioRand objective
	updateBioRandObjective: function(mapName, parent){

		var cPrev,
			bRandDb,
			cObjective,
			canContinue = !0,
			canSolveObjective = !1;

		// Set objective
		if (APP.database.bio3.bioRandObjectives[mapName] !== void 0 && APP.options.bioRandObjectives.current !== mapName){
			canContinue = !1;
			APP.options.bioRandObjectives.current = mapName;
			APP.options.bioRandObjectives.parentMap = parent;
			APP.graphics.displayTopMsg('New Objective: ' + APP.database.bio3.rdt[mapName].name + ', ' + APP.database.bio3.rdt[mapName].location, 5200);
		}

		// Reset objective
		if (canContinue === !0 && APP.options.bioRandObjectives.current !== null){

			cPrev = APP.options.bioRandObjectives.parentMap;
			cObjective = APP.options.bioRandObjectives.current;
			bRandDb = APP.database.bio3.bioRandObjectives[cObjective];

			// Solve objective process
			const solveObjective = function(){
				APP.options.bioRandObjectives.reset = !0;
				APP.options.bioRandObjectives.current = null;
				APP.options.bioRandObjectives.parentMap = null;
				APP.graphics.displayTopMsg('Objective complete! - ' + APP.database.bio3.rdt[parent].name + ', ' + APP.database.bio3.rdt[parent].location, 5200);
			}

			// Check if can solve current objective
			if (bRandDb.endsOn === null && parent === cObjective){
				canSolveObjective = !0;
			}
			if (canSolveObjective === !1 && bRandDb.endsOn === mapName && parent === cObjective){
				canSolveObjective = !0;
			}

			// End
			if (canSolveObjective === !0){
				solveObjective();
			}

		}

	},

	/*
		Functions
	*/

	// Toggle hide top menu on quick-save
	togglehideTopMenu: function(){

		// Get data and save it on localstorage
		this.hideTopMenu = JSON.parse(document.getElementById('CHECKBOX_hideTopMenu').checked);
		localStorage.setItem('hideTopMenu', APP.options.hideTopMenu);
		
		// Display menu by default
		TMS.css('MENU_TOP', {'height': '30px'});

		// Check if game is running
		if (APP.gameHook.gameActive === !0){

			switch (this.hideTopMenu){

				case !0:
					TMS.css('MENU_TOP', {'height': '0px'});
					TMS.css('MENU_TOP_BG', {'display': 'inline'});
					break;

				case !1:
					TMS.css('MENU_TOP', {'height': '30px'});
					TMS.css('MENU_TOP_BG', {'display': 'none'});
					break;

			}

		}

	},

	// Adjust room font size
	adjustFontSize: function(mode){

		// Clear timeout
		clearTimeout(this.adjustFontSizeTimeout);

		// Get font size and create update canvas function
		var fSize = this.settingsData.fontSize;

		if (mode === void 0 || typeof mode !== 'string'){
			mode = 'plus';
		}

		// Check operation mode
		switch (mode){

			case 'plus':
				fSize++;
				break;

			case 'minus':
				fSize--;
				break;

			case 'reset':
				fSize = 0;
				break;

		}

		// Check if font are too small
		if (fSize < 0){
			fSize = 0;
		}

		// Update canvas font size
		TMS.css('APP_MAP_CANVAS', {'font-size': (13 + fSize) + 'px'});

		// Center screen
		if (APP.graphics.enableCanvasDrag === !1){
			APP.options.adjustFontSizeTimeout = setTimeout(function(){
				APP.options.updateCanvasCss(fSize);
				clearTimeout(APP.options.adjustFontSizeTimeout);
			}, 1010);
		} else {
			this.updateCanvasCss(fSize);
		}

		// Update settings data
		this.settingsData.fontSize = fSize;

		// Update settings file
		this.saveSettings();

	},

	// Update canvas css
	updateCanvasCss: function(fSize){
		document.getElementById('APP_STYLE').innerHTML = '.DIV_ROOM {padding: ' + (10 + fSize) + 'px;}\n.PLAYER_PRESENT {text-shadow: 0px 0px ' + (4 + fSize) + 'px #002d;}\n.SVG_CURRENT_FLOW {stroke-dasharray: ' +
														 (6 + fSize) + ';}\n@keyframes CONNECTION_FLOW { 100% {stroke-dashoffset: -' + (6 + fSize) + '0;}';
		APP.graphics.updatePlayerPos();
		APP.graphics.updateLines();
	},

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
		APP.graphics.zIndexMap = 10;
		APP.graphics.addedMaps = {};
		APP.graphics.addedLines = {};
		APP.graphics.xFarestMap = '';
		APP.gameHook.mapHistory = [];
		APP.graphics.addedMapHistory = [];
		APP.graphics.enabledDragList = [];
		this.bioRandObjectives = { current: null, parentMap: null, reset: !1 },

		// Reset drag
		APP.graphics.enableCanvasDrag = !0;
		APP.graphics.toggleDragMapCanvas();
		document.getElementById('APP_MAP_CANVAS').onmousedown = null;

		// Reset HTML
		document.getElementById('APP_MAP_CANVAS').innerHTML = '';
		TMS.css('APP_MAP_CANVAS', {'top': '-50000px', 'left': '-50000px'});

	},

	// Save map
	saveMap: function(quickSave){

		// Set file name var
		var fileName = 'GAME_MAP';

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

		// Check if "is BioRand" option is active
		var checkBioRand = document.getElementById('CHECKBOX_isBioRand').checked;
		if (checkBioRand === !0){

			const randDataPath = APP.options.settingsData.gamePath + '/mod_biorand/description.txt';
			if (APP.fs.existsSync(randDataPath) === !0){
				const randDesc = APP.fs.readFileSync(randDataPath, 'utf8');
				fileName = randDesc.slice(randDesc.indexOf('Seed: ') + 6).replace('\r\n', '');
			}

		}

		// Check if file exists, is BioRand and if seed is the same
		if (quickSave === !0 && APP.fs.existsSync(APP.options.latestFile) === !0 && APP.path.parse(APP.options.latestFile).name === fileName){

			try {

				// Write file
				APP.fs.writeFileSync(APP.options.latestFile, newData, 'utf8');
				console.info('Map updated successfully!\n' + APP.options.latestFile);

				// Center map
				APP.graphics.updatePlayerPos();

				// Display message
				APP.graphics.displayTopMsg('Map file was updated successfully! [' + fileName + ']', 1800);

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
				fileName: fileName + '.json',
				callback: function(path){
					window.alert('INFO: Save successfull!\n\nPath: ' + path);
					fileName = APP.path.parse(path).name;
					APP.options.latestFile = path;
				}
			});

		}

	},

	// Load map
	loadMapProcess: function(fPath){

		// Check if current path exists
		if (APP.fs.existsSync(fPath) === !0){

			// Set map loading process as true
			APP.options.isMapLoading = !0;

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

			// Process maps
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

			// Seek game process again
			if (startHookAfter === !0){
				APP.gameHook.seekGame();
			}

			// Set map loading process as false
			APP.options.isMapLoading = !1;

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
		fontSize: 13,
		gamePath: '',
		exeName: 'BIOHAZARD(R) 3 PC.exe'
	},

	// Load app settings
	loadSettings: function(){

		// Get file path
		const fPath = APP.tools.fixPath(APP.path.parse(process.execPath).dir) + '/Settings.json';

		// Check if save file exists
		if (APP.fs.existsSync(fPath) === !1){
			APP.options.saveSettings();
		}

		// Load file
		this.settingsData = JSON.parse(APP.fs.readFileSync(fPath, 'utf8'));

		// Check if game executable exists
		if (APP.fs.existsSync(this.settingsData.gamePath + '/' + this.settingsData.exeName) === !0){
			document.getElementById('BTN_RUN_GAME').disabled = '';
		}

		// Check if has BioRand mod installed
		if (APP.fs.existsSync(this.settingsData.gamePath + '/mod_biorand') === !0){
			document.getElementById('CHECKBOX_isBioRand').checked = !0;
		}

		// Check if savedata folder exists
		if (APP.fs.existsSync(this.settingsData.gamePath + '/savedata') === !0){
			document.getElementById('BTN_DEL_GAME_SAVES').disabled = '';
		}

		// Update hide top menu checkbox
		if (localStorage.getItem('hideTopMenu') === null){
			localStorage.setItem('hideTopMenu', APP.options.hideTopMenu);
		}
		this.hideTopMenu = JSON.parse(localStorage.getItem('hideTopMenu'));
		document.getElementById('CHECKBOX_hideTopMenu').checked = this.hideTopMenu;
		this.togglehideTopMenu();

		// Update canvas
		TMS.css('APP_MAP_CANVAS', {'font-size': (this.settingsData.fontSize + 13) + 'px'});
		document.getElementById('APP_STYLE').innerHTML = '.DIV_ROOM {padding: ' + (10 + this.settingsData.fontSize) + 'px;}';

	},

	// Save app settings
	saveSettings: function(){

		try {
			localStorage.setItem('hideTopMenu', APP.options.hideTopMenu);
			APP.fs.writeFileSync(APP.tools.fixPath(APP.path.parse(process.execPath).dir) + '/Settings.json', JSON.stringify(this.settingsData), 'utf8');
		} catch (err) {
			window.alert('ERROR - Unable to save settings!\n' + err);
			throw new Error(err);
		}

	},

	// Delete all save files
	delGameSaveFiles: function(){

		// Get save data folder
		const saveDataPath = APP.options.settingsData.gamePath + '/savedata';

		// Check if game save folder exists 
		if (APP.fs.existsSync(saveDataPath) === !0){

			// Confirm action
			const conf = window.confirm('WARN: Are you sure about this action?\nIt\'s kinda obvious, but this will delete all your save files!');
			if (conf === !0){

				try {

					// Save extension list
					const extList = ['.bio3', '.sav'];

					// Read directory and try to unlink all files with recognized save extensions
					APP.fs.readdirSync(saveDataPath).filter(function(cFile){
						if (extList.indexOf(APP.path.parse(saveDataPath + '/' + cFile).ext.toLowerCase()) !== -1){
							APP.fs.unlinkSync(saveDataPath + '/' + cFile);
						}
					});

					window.alert('INFO: Process complete!');

				} catch (err) {
					window.alert('ERROR: Unable to delete save files!\n' + err);
					throw new Error(err);
				}
				
			}

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
				var s = window.prompt('Please insert ram pos. for "Stage":\nExample: 0x00A673C6 for Classic REbirth 1.1.0 SourceNext patch.\nYou can leave this box empty to use this value above.'),
					r = window.prompt('Please insert ram pos. for "Room":\nExample: 0x00A673C8 for Classic REbirth 1.1.0 SourceNext patch.\nYou can leave this box empty to use this value above.');

				// Check if is for default values
				if (s === null){
					s = '0x00A673C6';
				}
				if (r === null){
					r = '0x00A673C8';
				}

				if (s === '' || s.length !== 10){
					canSave = !1;
				}
				if (r === '' || r.length !== 10){
					canSave = !1;
				}

				// Check if can save settings
				if (canSave === !0){

					// Set values
					APP.options.settingsData.memoryData.stage = s;
					APP.options.settingsData.memoryData.room = r;

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