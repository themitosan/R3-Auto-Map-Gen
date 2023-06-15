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
	alwaysOnTop: !1,
	isMapLoading: !1,
	bioRandObjectives: {
		reset: !1,
		current: null,
		parentMap: null,
		applyDistance: null,
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
			canSolveObjective = !1,
			cGame = this.settingsData.currentGame;

		// Set objective
		if (APP.database[cGame].bioRandObjectives[mapName] !== void 0 && APP.options.bioRandObjectives.current !== mapName){

			canContinue = !1;
			APP.options.bioRandObjectives.current = mapName;
			APP.options.bioRandObjectives.parentMap = parent;
			APP.options.bioRandObjectives.applyDistance = APP.database[cGame].bioRandObjectives[mapName].applyDistance;
			
			if (APP.options.isMapLoading === !1){
				APP.graphics.displayTopMsg(`New Objective: ${APP.database[cGame].rdt[mapName].name}, ${APP.database[cGame].rdt[mapName].location}`, 5200);
			}

		}

		// Reset objective
		if (canContinue === !0 && APP.options.bioRandObjectives.current !== null){

			cPrev = APP.options.bioRandObjectives.parentMap;
			cObjective = APP.options.bioRandObjectives.current;
			bRandDb = APP.database[cGame].bioRandObjectives[cObjective];

			// Solve objective process
			const solveObjective = function(){
				
				APP.options.bioRandObjectives.reset = !0;
				APP.options.bioRandObjectives.current = null;
				APP.options.bioRandObjectives.parentMap = null;

				if (APP.options.isMapLoading === !1){
					APP.graphics.displayTopMsg(`Objective complete! - ${APP.database[cGame].rdt[parent].name}, ${APP.database[cGame].rdt[parent].location}`, 5200);
				}

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

	// Toggle always on top function
	toggleAlwaysOnTop: function(){
		APP.options.alwaysOnTop = document.getElementById('CHECKBOX_alwaysOnTop').checked;
		localStorage.setItem('alwaysOnTop', APP.options.alwaysOnTop);
		APP.win.setAlwaysOnTop(APP.options.alwaysOnTop);
	},

	// Toggle right menu
	toggleRightMenu: function(mode){

		switch (mode){

			case 'open':

				// Clear timeouts
				APP.tools.clearTimeoutList([
					'hideRightMenu',
					'showBackButton',
					'hideOpenButton'
				]);

				// Update display mode
				TMS.css('MENU_RIGHT', {'display': 'block'});

				// Update app drag bar and canvas
				TMS.css('APP_DRAG_BAR', {'display': 'flex'});
				TMS.css('APP_DRAG_BAR_ACTIONS', {'display': 'flex'});
				TMS.css('APP_CANVAS', {
					'top': '20px',
					'height': 'calc(100% - 20px)',
					'border-top-left-radius': '0px',
					'border-top-right-radius': '0px'
				});

				// Return right menu
				APP.tools.createTimeout('returnRightMenu', function(){
					TMS.css('MENU_RIGHT', {'width': '196px', 'filter': 'blur(0px)', 'opacity': '1'});
					TMS.css('MENU_TOP', {'width': 'calc(100% - 196px)', 'border-bottom-right-radius': '0px'});
					TMS.css('BTN_SHOW_RIGHT_MENU', {'display': 'none', 'opacity': '0', 'filter': 'blur(20px) opacity(0)', 'right': '2px'});
				}, 100);

				// Center map
				APP.tools.createTimeout('updatePlayerPos', function(){
					APP.graphics.updatePlayerPos(!0);
				}, 1100);
				break;

			case 'close':

				// Clear timeouts
				APP.tools.clearTimeoutList([
					'returnRightMenu',
					'updatePlayerPos'					
				]);

				// Display message
				APP.graphics.displayTopMsg('INFO - Use [ Ctrl+Shift+Q ] shorcut to open right menu again.', 5500);

				// Update app drag bar and canvas
				TMS.css('APP_DRAG_BAR', {'display': 'none'});
				TMS.css('APP_DRAG_BAR_ACTIONS', {'display': 'none'});
				TMS.css('APP_CANVAS', {
					'top': '0px',
					'height': '100%',
					'border-top-left-radius': '6px',
					'border-top-right-radius': '6px'
				});

				// Hide right menu
				TMS.css('BTN_SHOW_RIGHT_MENU', {'display': 'block'});
				TMS.css('MENU_TOP', {'width': '100%', 'border-bottom-right-radius': '6px'});
				TMS.css('MENU_RIGHT', {'width': '0px', 'filter': 'blur(20px)', 'opacity': '0'});

				// Show back button
				APP.tools.createTimeout('showBackButton', function(){
					TMS.css('BTN_SHOW_RIGHT_MENU', {'opacity': '1', 'filter': 'blur(0px) opacity(0.5)', 'right': '10px'});
				}, 560);

				// Update right menu display mode and center map
				APP.tools.createTimeout('hideRightMenu', function(){
					TMS.css('MENU_RIGHT', {'display': 'none'});
					APP.graphics.updatePlayerPos(!0);
				}, 1150);

				// Hide button
				APP.tools.createTimeout('hideOpenButton', function(){
					TMS.css('BTN_SHOW_RIGHT_MENU', {'opacity': '1', 'filter': 'blur(2px) opacity(0)', 'right': '10px'});
				}, 5200);
				break;

		}

	},

	// Update current game
	updateSelectedGame: function(){
		APP.options.settingsData.currentGame = document.getElementById('SELECT_GAME').value;
	},

	// Reset map
	resetMap: function(){

		// Close color picker menu
		APP.tools.closeColorPicker();

		// Reset vars
		APP.graphics.zIndexMap = 10;
		APP.graphics.addedMaps = {};
		APP.graphics.addedLines = {};
		APP.graphics.xFarestMap = '';
		APP.gameHook.mapHistory = [];
		APP.graphics.addedMapHistory = [];
		APP.graphics.enabledDragList = [];
		APP.options.bioRandObjectives = { current: null, parentMap: null, reset: !1, applyDistance: null },

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

		// Check if there's maps to save
		if (Object.keys(APP.graphics.addedMaps).length !== 0){

			// Close color picker menu
			APP.tools.closeColorPicker();

			// Update map locations
			Object.keys(APP.graphics.addedMaps).forEach(function(cMap){

				var top = parseFloat(TMS.getCssData(`ROOM_${cMap}`, 'top').replace('px', '')),
					left = parseFloat(TMS.getCssData(`ROOM_${cMap}`, 'left').replace('px', ''));

				APP.graphics.addedMaps[cMap].y = top;
				APP.graphics.addedMaps[cMap].x = left;

			});

			// Check if farest map was added
			if (APP.graphics.xFarestMap === ''){
				APP.graphics.checkForMapDistances();
			}

			// Set variables
			var fileName = 'GAME_MAP',
				cGame = APP.options.settingsData.currentGame,
				checkBioRand = document.getElementById('CHECKBOX_isBioRand').checked,
				randDataPath = `${APP.options.settingsData[cGame].gamePath}/mod_biorand/description.txt`,
				mPos = {
					y: parseFloat(TMS.getCssData('APP_MAP_CANVAS', 'top').replace('px', '')),
					x: parseFloat(TMS.getCssData('APP_MAP_CANVAS', 'left').replace('px', ''))
				},
				newData = JSON.stringify({
					canvasPos: mPos,
					addedList: APP.graphics.addedMaps,
					xFarestMap: APP.graphics.xFarestMap,
					history: APP.graphics.addedMapHistory,
				});

			// Check if "is BioRand" option is active and if description file exists
			if (checkBioRand === !0 && APP.fs.existsSync(randDataPath) === !0){
				const randDesc = APP.fs.readFileSync(randDataPath, 'utf8');
				fileName = randDesc.slice(randDesc.indexOf('Seed: ') + 6).replace('\r\n', '');
			}

			// Check if file exists, if is BioRand and if it's seed is the same
			if (quickSave === !0 && APP.fs.existsSync(APP.options.latestFile) === !0 && APP.path.parse(APP.options.latestFile).name === fileName){

				try {

					// Write file
					APP.fs.writeFileSync(APP.options.latestFile, newData, 'utf8');
					console.info(`Map updated successfully!\n${APP.options.latestFile}`);

					// Center map
					APP.graphics.updatePlayerPos();

					// Display message
					APP.graphics.displayTopMsg(`Map file was updated successfully! [ ${fileName} ]`, 1850);

				} catch (err) {
					window.alert(`ERROR - Unable to save map!\nPath: ${APP.options.latestFile}\n\n${err}`);
					console.error(err);
					throw new Error(err);
				}

			} else {

				// Open save dialog
				APP.filemanager.saveFile({
					ext: '.json',
					mode: 'utf8',
					content: newData,
					fileName: `${fileName}.json`,
					callback: function(path){
						window.alert(`INFO - Save successfull!\n\nPath: ${path}`);
						fileName = APP.path.parse(path).name;
						APP.options.latestFile = path;
					}
				});

			}

		} else {
			window.alert('INFO - Unable to save file since there\'s no map added yet.');
		}

	},

	// Load map
	loadMapProcess: function(fPath){

		// Check if current path exists
		if (APP.fs.existsSync(fPath) === !0){

			// Set map loading process as true
			APP.options.isMapLoading = !0;

			// Close color picker menu
			APP.tools.closeColorPicker();

			// Start load process
			var startHookAfter = !1,
				saveData = JSON.parse(APP.fs.readFileSync(fPath, 'utf8'));

			// Set latest file
			APP.options.latestFile = fPath;

			// Check if game is active
			if (APP.gameHook.gameActive === !0){
				startHookAfter = !0;
				APP.gameHook.stop();
			}

			// Reset map
			APP.options.resetMap();

			// Push all maps again and update it's previous location
			saveData.history.forEach(function(cAction){
				APP.graphics.pushMap(cAction.mapName, cAction.parent);
			});
			Object.keys(APP.graphics.addedMaps).forEach(function(cMap){

				// Update data
				APP.graphics.addedMaps[cMap].x = saveData.addedList[cMap].x;
				APP.graphics.addedMaps[cMap].y = saveData.addedList[cMap].y;

				// Update map positions
				TMS.css(`ROOM_${cMap}`, {
					'top': `${saveData.addedList[cMap].y}px`,
					'left': `${saveData.addedList[cMap].x}px`
				});

			});

			// Set farest map
			APP.graphics.xFarestMap = saveData.xFarestMap;

			// Check if farest data exists
			if (saveData.xFarestMap === void 0 || saveData.xFarestMap === ''){
				APP.graphics.checkForMapDistances();
			}

			// Update lines
			APP.graphics.updateLines();

			// Update canvas pos.
			TMS.css('APP_MAP_CANVAS', {
				'top': `${saveData.canvasPos.y}px`,
				'left': `${saveData.canvasPos.x}px`
			});

			// Update top menu
			APP.graphics.togglehideTopMenu();

			// Release reload button
			document.getElementById('BTN_MAP_RELOAD').disabled = '';

			// Seek game process again
			if (startHookAfter === !0){
				APP.gameHook.seekGame(!0);
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
		bio1: {
			room: '',
			stage: '',
			exeName: '',
			gamePath: '',
			default_room: '',
			default_stage: ''
		},
		bio2: {
			room: '',
			stage: '',
			exeName: '',
			gamePath: '',
			default_room: '',
			default_stage: ''
		},
		bio3: {
			gamePath: '',
			room: '0x00A673C8',
			stage: '0x00A673C6',
			default_room: '0x00A673C8',
			default_stage: '0x00A673C6',
			exeName: 'BIOHAZARD(R) 3 PC.exe'
		},
		currentGame: 'bio3',
		bgGradientColor: ['#26008728', '#000048C4']
	},

	// Load app settings
	loadSettings: function(){

		// Close color picker menu
		APP.tools.closeColorPicker();

		// Get file path
		const fPath = `${APP.tools.fixPath(APP.path.parse(process.execPath).dir)}/Settings.json`;

		// Check if save file exists
		if (APP.fs.existsSync(fPath) === !1){
			APP.options.saveSettings();
		}

		// Check if all data maches from settings model
		var requestSave = !1;
			tempData = JSON.parse(APP.fs.readFileSync(fPath, 'utf8'));

		// Process settings data
		Object.keys(this.settingsData).forEach(function(cData){
			if (tempData[cData] === void 0){
				tempData[cData] = APP.options.settingsData[cData];
				requestSave = !0;
			}
		});

		// Check if needs to update settings file
		if (requestSave === !0){
			this.settingsData = tempData;
			APP.options.saveSettings();
		}

		/*
			Set variables
		*/

		// Load file
		this.settingsData = tempData;
		
		// Set current game
		document.getElementById('SELECT_GAME').value = this.settingsData.currentGame;

		// Check if game executable exists
		if (APP.fs.existsSync(`${this.settingsData[this.settingsData.currentGame].gamePath}/${this.settingsData[this.settingsData.currentGame].exeName}`) === !0){
			document.getElementById('BTN_RUN_GAME').disabled = '';
		}

		// Check if has BioRand mod installed
		if (APP.fs.existsSync(`${this.settingsData[this.settingsData.currentGame].gamePath}/mod_biorand`) === !0){
			document.getElementById('CHECKBOX_isBioRand').checked = !0;
		}

		// Check if savedata folder exists
		if (APP.fs.existsSync(`${this.settingsData[this.settingsData.currentGame].gamePath}/savedata`) === !0){
			document.getElementById('BTN_DEL_GAME_SAVES').disabled = '';
		}

		/*
			Get localStorage settings
		*/
		const lStorageSettingsList = [
			'hideTopMenu',
			'alwaysOnTop'
		].forEach(function(cSettings){

			// Check if settings exists
			if (localStorage.getItem(cSettings) === null){
				localStorage.setItem(cSettings, APP.options[cSettings]);
			}

			// Load settings
			APP.options[cSettings] = JSON.parse(localStorage.getItem(cSettings));

			// Check data type
			switch (typeof APP.options[cSettings]){

				case 'boolean':
					document.getElementById(`CHECKBOX_${cSettings}`).checked = APP.options[cSettings];
					break;

			}

		});

		// Process post loading settings
		APP.graphics.togglehideTopMenu();
		APP.options.toggleAlwaysOnTop();
		APP.graphics.updateBgColor();

	},

	// Save app settings
	saveSettings: function(){

		try {
			localStorage.setItem('hideTopMenu', APP.options.hideTopMenu);
			APP.fs.writeFileSync(`${APP.tools.fixPath(APP.path.parse(process.execPath).dir)}/Settings.json`, JSON.stringify(this.settingsData), 'utf8');
		} catch (err) {
			window.alert(`ERROR - Unable to save settings!\n${err}`);
			console.error(err);
		}

	},

	// Delete all save files
	delGameSaveFiles: function(){

		// Close color picker menu
		APP.tools.closeColorPicker();

		// Get save data folder
		const cGame = APP.options.settingsData.currentGame,
			saveDataPath = `${APP.options.settingsData[cGame].gamePath}/savedata`;

		// Check if game save folder exists 
		if (APP.fs.existsSync(saveDataPath) === !0){

			// Confirm action
			const conf = window.confirm('WARN: Are you sure about this action?\nIt\'s kinda obvious, but this will delete all your save files!');
			if (conf === !0){

				try {

					// Save extension list
					const extList = [
						'.sav', 
						'.dat',
						'.bio3',
						'.biohazard2'
					];

					// Read directory and try to unlink all files with recognized save extensions
					APP.fs.readdirSync(saveDataPath).filter(function(cFile){
						if (extList.indexOf(APP.path.parse(`${saveDataPath}/${cFile}`).ext.toLowerCase()) !== -1){
							APP.fs.unlinkSync(`${saveDataPath}/${cFile}`);
						}
					});

					window.alert('INFO - Process complete!');

				} catch (err) {
					window.alert(`ERROR - Unable to delete save files!\n${err}`);
					console.error(err);
				}
				
			}

		}

	},

	// Get game path / data
	getGamePath: function(){

		// Check if game is running
		if (APP.gameHook.gameActive === !1){

			// Close color picker menu
			APP.tools.closeColorPicker();

			// Main popup
			window.alert('INFO: After closing this message, select your main game executable.');

			// Select game executable
			APP.filemanager.selectFile('.exe', function(path){

				// Get path data
				var canSave = !0,
					pData = APP.path.parse(path),
					cGame = APP.options.settingsData.currentGame;

				// Set game data
				APP.options.settingsData[cGame].exeName = pData.base;
				APP.options.settingsData[cGame].gamePath = pData.dir;

				// Set ram pos.
				var s = window.prompt('Please insert ram pos. for "Stage":\nExample: 0x00A673C6 for RE3 Classic REbirth 1.1.0 SourceNext patch.\nYou can leave this box empty to use this value above.'),
					r = window.prompt('Please insert ram pos. for "Room":\nExample: 0x00A673C8 for RE3 Classic REbirth 1.1.0 SourceNext patch.\nYou can leave this box empty to use this value above.');

				// Check if is for default values
				if (s === null){
					s = APP.options.settingsData[cGame].default_stage;
				}
				if (r === null){
					r = APP.options.settingsData[cGame].default_room;
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
					APP.options.settingsData[cGame].stage = s;
					APP.options.settingsData[cGame].room = r;

					// Update settings file
					APP.options.saveSettings();

					// Display success message
					window.alert('INFO - Process complete!');

					// Load new settings
					APP.options.loadSettings();

				}

			});

		}

	}

}