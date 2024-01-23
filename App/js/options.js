/*
	R3 Auto Map Gen.
	options.js
*/

temp_OPTIONS = {

	/*
		Variables
	*/
	latestFile: '',
	enableGrid: !0,
	doorTrigger: 0,
	hideTopMenu: !1,
	alwaysOnTop: !1,
	isMapLoading: !1,
	showGameData: !1,
	enableCamHint: !0,
	enableTabletMode: !1,
	isMenuRightClosed: !1,
	enableBgObjectiveAnimation: !0,
	bioRandObjectives: {
		reset: !1,
		current: null,
		parentMap: null,
		applyDistance: null,
		clearedObjectives: 0
	},

	/*
		BioRand Functions
	*/

	// Update BioRand objective
	updateBioRandObjective: function(mapName, parent){

		// Variables
		var cPrev,
			bRandDb,
			cObjective,
			canContinue = !0,
			canSetObjective = !0,
			canSolveObjective = !1,
			cGame = this.settingsData.currentGame,
			cScenario = document.getElementById('SELECT_SCENARIO').value,
			cObjectiveData = APP.database[cGame].bioRandObjectives[mapName];

		// Check main variables to see if can set objective
		if (cObjectiveData !== void 0 && APP.options.bioRandObjectives.current !== mapName){

			// Check if current game is BioHazard 2 and if current objecte belongs to current scenario
			if (cGame === 'bio2' && cObjectiveData.requiredScenario !== null && cObjectiveData.requiredScenario !== cScenario){
				canSetObjective = !1;
			}

			// Check if can set objective
			if (canSetObjective === !0){

				// Set variables
				canContinue = !1;
				APP.options.bioRandObjectives.current = mapName;
				APP.options.bioRandObjectives.parentMap = parent;
				APP.options.bioRandObjectives.applyDistance = cObjectiveData.applyDistance;

				// Check if can display background animation
				if (APP.options.isMapLoading === !1 && APP.options.enableBgObjectiveAnimation === !0){
					APP.graphics.playBgObjetiveAnimation('findObjective');
				}

				// Check if can display message
				if (APP.options.isMapLoading === !1){
					APP.graphics.displayTopMsg(`New Objective: ${APP.database[cGame].rdt[mapName].name}, ${APP.database[cGame].rdt[mapName].location}`, 5200);
				}
			}

		}

		// Reset objective
		if (canContinue === !0 && APP.options.bioRandObjectives.current !== null){

			cPrev = APP.options.bioRandObjectives.parentMap;
			cObjective = APP.options.bioRandObjectives.current;
			bRandDb = APP.database[cGame].bioRandObjectives[cObjective];

			// Solve objective process
			const solveObjective = function(){

				// Reset BioRand objective and bump cleared objectives
				APP.options.bioRandObjectives.reset = !0;
				APP.options.bioRandObjectives.current = null;
				APP.options.bioRandObjectives.parentMap = null;
				APP.options.bioRandObjectives.clearedObjectives++;

				// Check if can display background animation
				if (APP.options.isMapLoading === !1 && APP.options.enableBgObjectiveAnimation === !0){
					APP.graphics.playBgObjetiveAnimation('clearObjective');
				}

				// Check if can display message
				if (APP.options.isMapLoading === !1){
					APP.graphics.displayTopMsg(`Objective complete! - ${APP.database[cGame].rdt[parent].name}, ${APP.database[cGame].rdt[parent].location}`, 5200);
				}

			}

			/*
				Check if can resolve BioRand Objective
			*/

			// Check if current objective can be resolved in any other map
			if (bRandDb.endsOn === null && parent === cObjective){

				// Check if current objective requires a player being in a specific camera
				if (bRandDb.requiredCam.length === 0 || bRandDb.requiredCam.indexOf(APP.gameHook.currentCamera) !== -1){
					canSolveObjective = !0;
				}

			}

			// Check if current map is the resoluction from current objective (on BioRand log files, it is labelled as "always")
			if (canSolveObjective === !1 && bRandDb.endsOn === mapName && parent === cObjective){
				canSolveObjective = !0;
			}

			// Check if can resolve
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

		// Declare variables and switch mode
		var dragBarCss;

		switch (mode){

			case 'open':

				// Clear timeouts
				APP.tools.clearTimeoutList([
					'hideRightMenu',
					'showBackButton',
					'hideOpenButton'
				]);

				// Disable isMenuRightClosed flag, disable span tag as app drag and update top label message
				APP.options.isMenuRightClosed = !1;
				document.getElementById('APP_STYLE').innerHTML = 'span {app-region: none;}';
				APP.graphics.updateGuiLabel();

				// Update display mode, app drag bar and canvas
				TMS.css('MENU_RIGHT', {'display': 'block'});
				dragBarCss = {
					'opacity': '1',
					'height': '20px',
					'filter': 'blur(0px)',
					'transition-duration': '0.1s'
				};
				TMS.css('APP_DRAG_BAR', dragBarCss);
				TMS.css('APP_DRAG_BAR_ACTIONS', dragBarCss);
				TMS.css('APP_GAME_DATA', {'top': `${APP.graphics.maxHeight + 30}px`});
				TMS.css('MENU_TOP_BG', {
					'top': '20px',
					'app-region': 'none',
					'width': 'calc(100% - 196px)'
				});

				// Return right menu
				APP.tools.createTimeout('returnRightMenu', function(){
					TMS.css('MENU_TOP', {
						'top': '20px',
						'width': 'calc(100% - 196px)',
						'border-bottom-right-radius': '0px',
						'height': `${APP.graphics.maxHeight}px`
					});
					TMS.css('MENU_RIGHT', {'width': '196px', 'filter': 'blur(0px)', 'opacity': '1'});
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

				// Enable isMenuRightClosed flag, span tah as app drag and update it's message
				APP.options.isMenuRightClosed = !0;
				document.getElementById('APP_STYLE').innerHTML = 'span {app-region: drag;}';
				APP.graphics.displayTopMsg('INFO - Use [ Ctrl+Shift+Q ] shorcut to open right menu again.', 5500);

				// Update app drag bar and canvas
				dragBarCss = {
					'opacity': '0',
					'height': '0px',
					'filter': 'blur(50px)',
					'transition-duration': '1s'
				};
				TMS.css('APP_DRAG_BAR', dragBarCss);
				TMS.css('APP_GAME_DATA', {'top': '74px'});
				TMS.css('APP_DRAG_BAR_ACTIONS', dragBarCss);

				// Hide right menu
				TMS.css('MENU_TOP', {
					'top': '0px',
					'width': '100%',
					'border-bottom-right-radius': '10px'
				});
				TMS.css('MENU_TOP_BG', {
					'top': '0px',
					'width': '100%',
					'app-region': 'drag'
				});
				TMS.css('MENU_RIGHT', {'width': '0px', 'filter': 'blur(20px)', 'opacity': '0'});
				TMS.css('BTN_SHOW_RIGHT_MENU', {'display': 'block', 'top': `${APP.graphics.maxHeight + 10}px`});

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

		// Get current game, update it's variable and scenario and update gui labels
		const cGame = document.getElementById('SELECT_GAME').value;
		APP.options.settingsData.scenario = document.getElementById('SELECT_SCENARIO').value;
		APP.options.settingsData.currentGame = cGame;
		APP.graphics.updateGuiLabel();

		// Get current data and check if current game executable is available
		const cData = APP.options.settingsData;
		document.getElementById('BTN_RUN_GAME').disabled = APP.fs.existsSync(`${cData[cGame].gamePath}/${cData[cGame].exeName}`) !== !0;

	},

	// Reset map
	resetMap: function(){

		// Close color picker menu
		APP.tools.closeColorPicker();

		// Reset vars
		this.doorTrigger = 0;
		APP.graphics.zIndexMap = 10;
		APP.graphics.addedMaps = {};
		APP.graphics.addedLines = {};
		APP.gameHook.mapHistory = [];
		APP.gameHook.camHistory = [];
		APP.graphics.xFarestMap = '';
		APP.graphics.addedMapHistory = [];
		APP.graphics.enabledDragList = [];
		APP.graphics.availableCamHints = 0;
		APP.options.bioRandObjectives = { current: null, parentMap: null, reset: !1, applyDistance: null, clearedObjectives: 0 };

		// Reset drag
		APP.graphics.enableCanvasDrag = !0;
		APP.graphics.toggleDragMapCanvas();
		document.getElementById('APP_MAP_CANVAS').onmousedown = null;

		// Reset HTML
		document.getElementById('APP_MAP_CANVAS').innerHTML = '<div class="APP_MAP_CANVAS_BG" id="APP_MAP_CANVAS_BG"></div>';
		TMS.css('APP_MAP_CANVAS', {'top': '-50000px', 'left': '-50000px'});

		// Check background color status
		APP.tools.createTimeout('checkCanvasGridOpacity', function(){
			if (APP.graphics.disableCanvasBgColor === !1){
				APP.graphics.toggleBgGrid();
			}
		}, 50);

	},

	// Save map
	saveMap: function(quickSave){

		// Check if there's maps to save
		if (Object.keys(APP.graphics.addedMaps).length !== 0){

			// Close color picker menu and update map locations
			APP.tools.closeColorPicker();
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
			var cGame = APP.options.settingsData.currentGame,
				fileName = `${cGame.toUpperCase()}_GAME_MAP`,
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
					history: APP.graphics.addedMapHistory
				});

			// Check if "is BioRand" option is active and if description file exists
			if (checkBioRand === !0 && APP.fs.existsSync(randDataPath) === !0){

				// Create variables and set new file name
				const
					cGame = document.getElementById('SELECT_GAME').value,
					randDesc = APP.fs.readFileSync(randDataPath, 'utf8'),
					cScenario = document.getElementById('SELECT_SCENARIO').value;

				fileName = randDesc.slice(randDesc.indexOf('Seed: ') + 6).replace('\r\n', '');

				// Check if is Bio 2. If so, append scenario at filename
				if (cGame === 'bio2'){
					fileName = `${fileName}-${cScenario.slice(cScenario.length - 1).toUpperCase()}`;
				}

			}

			// Check if file exists, if is BioRand and if it's seed is the same
			if (quickSave === !0 && APP.fs.existsSync(APP.options.latestFile) === !0 && APP.path.parse(APP.options.latestFile).name === fileName){

				try {

					// Write file, center map on screen and display message
					APP.fs.writeFileSync(APP.options.latestFile, newData, 'utf8');
					console.info(`INFO - Map updated successfully!\n${APP.options.latestFile}`);
					APP.graphics.updatePlayerPos();
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

			// Create vars, set map loading process as true and start load process
			var startHookAfter = !1,
				saveData = JSON.parse(APP.fs.readFileSync(fPath, 'utf8'));

			// Set map loading var, set latest file, check if game is active and reset map
			APP.options.isMapLoading = !0;
			APP.options.latestFile = fPath;
			if (APP.gameHook.gameActive === !0){
				startHookAfter = !0;
				APP.gameHook.stop(!0);
			}
			APP.options.resetMap();

			// Push all maps again and update it's previous location
			saveData.history.forEach(function(cAction){
				APP.graphics.pushMap(cAction.mapName, cAction.parent);
			});

			// Update data and map positions
			Object.keys(APP.graphics.addedMaps).forEach(function(cMap){
				APP.graphics.addedMaps[cMap].x = saveData.addedList[cMap].x;
				APP.graphics.addedMaps[cMap].y = saveData.addedList[cMap].y;
				TMS.css(`ROOM_${cMap}`, {
					'top': `${saveData.addedList[cMap].y}px`,
					'left': `${saveData.addedList[cMap].x}px`
				});
			});

			// Set farest map and check if it's data exists
			APP.graphics.xFarestMap = saveData.xFarestMap;
			if (saveData.xFarestMap === void 0 || saveData.xFarestMap === ''){
				APP.graphics.checkForMapDistances();
			}

			// Update lines and canvas position
			APP.graphics.updateLines();
			TMS.css('APP_MAP_CANVAS', {
				'top': `${saveData.canvasPos.y}px`,
				'left': `${saveData.canvasPos.x}px`
			});

			// Update top menu, release reload button and seek game process again
			APP.graphics.togglehideTopMenu();
			document.getElementById('BTN_MAP_RELOAD').disabled = '';
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
			gamePath: '',
			cam: '0x00C386F2',
			room: '0x00AA9014',
			stage: '0x00AA9010',
			exeName: 'Biohazard.exe',
			default_cam: '0x00C386F2',
			default_room: '0x00AA9014',
			default_stage: '0x00AA9010',
		},
		bio2: {
			gamePath: '',
			cam: '0x0098EB18',
			room: '0x0098EB16',
			stage: '0x0098EB14',
			exeName: 'bio2 1.10.exe',
			default_cam: '0x0098EB18',
			default_room: '0x0098EB16',
			default_stage: '0x0098EB14',
		},
		bio3: {
			gamePath: '',
			cam: '0x00A673CA',
			room: '0x00A673C8',
			stage: '0x00A673C6',
			default_cam: '0x00A673CA',
			default_room: '0x00A673C8',
			default_stage: '0x00A673C6',
			exeName: 'BIOHAZARD(R) 3 PC.exe'
		},
		biocv: {
			cam: '',
			room: '',
			stage: '',
			exeName: '',
			gamePath: '',
			default_cam: '',
			default_room: '',
			default_stage: ''
		},
		currentGame: 'bio3',
		scenario: 'scenario_a',
		bgGradientColor: ['#00004650', '#00004650']
	},

	// Load app settings
	loadSettings: function(){

		// Close color picker menu and get file path
		APP.tools.closeColorPicker();
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

		// Load file and set current game
		this.settingsData = tempData;
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
			'enableGrid',
			'hideTopMenu',
			'alwaysOnTop',
			'showGameData',
			'enableCamHint',
			'enableTabletMode',
			'enableBgObjectiveAnimation'
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
		APP.graphics.toggleBgObjectiveAnimation();
		APP.graphics.toggleShowGameData();
		APP.graphics.togglehideTopMenu();
		APP.graphics.toggleTabletMode();
		APP.options.toggleAlwaysOnTop();
		APP.graphics.updateGuiLabel();
		APP.graphics.updateBgColor();
		APP.graphics.toggleBgGrid();

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

		// Close color picker menu and get save data folder
		APP.tools.closeColorPicker();
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

			// Close color picker menu, display popup and call select file dialog
			APP.tools.closeColorPicker();
			window.alert('INFO: After closing this message, select your main game executable.');
			APP.filemanager.selectFile('.exe', function(path){

				// Get path data
				var canSave = !0,
					pData = APP.path.parse(path),
					cGame = APP.options.settingsData.currentGame;

				// Set game data and create game settings var
				APP.options.settingsData[cGame].exeName = pData.base;
				APP.options.settingsData[cGame].gamePath = pData.dir;
				const cGameSettings = APP.options.settingsData[cGame];

				// Set ram pos.
				var s = window.prompt(`Please insert ram pos. for \"Stage\":\nExample: \"${cGameSettings.default_stage}\" (without quotes) for ${cGame.toUpperCase()} Classic REbirth.\nYou can leave this box empty to use this value above.`),
					r = window.prompt(`Please insert ram pos. for \"Room\":\nExample: \"${cGameSettings.default_room}\" (without quotes) for ${cGame.toUpperCase()} Classic REbirth.\nYou can leave this box empty to use this value above.`);
					c = window.prompt(`Please insert ram pos. for current camera:\nExample: \"${cGameSettings.default_cam}\" (without quotes) for ${cGame.toUpperCase()} Classic REbirth.\nYou can leave this box empty to use this value above.`);

				// Check if is for default values
				if (s === null){
					s = APP.options.settingsData[cGame].default_stage;
				}
				if (r === null){
					r = APP.options.settingsData[cGame].default_room;
				}
				if (c === null){
					c = APP.options.settingsData[cGame].default_cam;
				}

				if (s === '' || s.length !== 10){
					canSave = !1;
				}
				if (r === '' || r.length !== 10){
					canSave = !1;
				}
				if (c === '' || c.length !== 10){
					canSave = !1;
				}

				// Check if can save settings
				if (canSave === !0){

					// Set values, update settings file, display message and load new settings
					APP.options.settingsData[cGame].stage = s;
					APP.options.settingsData[cGame].room = r;
					APP.options.settingsData[cGame].cam = c;
					APP.options.saveSettings();
					window.alert('INFO - Process complete!');
					APP.options.loadSettings();

				}

			});

		}

	}

}