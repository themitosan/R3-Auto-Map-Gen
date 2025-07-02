/*
	R3 Auto Map Gen.
	gamehook.js
*/

temp_GAMEHOOK = {

	/*
		Variables
	*/
	gameData: {},
	mapHistory: [],
	camHistory: [],
	currentMap: '',
	gameActive: !1,
	updateCamCvx: !1,
	currentCamera: 0,
	gameObject: void 0,
	updateObject: void 0,

	/*
		Functions
	*/

	// Seek game
	seekGame: function(skipCheck){

		// Check if game is actives
		if (this.gameActive === !1){

			// Check if game process exists
			var cGame = APP.options.settingsData.currentGame,
				exeName = APP.options.settingsData[cGame].exeName,
				pList = Array.from(APP.memoryjs.getProcesses()),
				gProcess = pList.filter(function(cProcess){
					if (cProcess.szExeFile === exeName) return cProcess;
				});

			if (gProcess.length !== 0 || skipCheck === !0){

				try {

					// Disable Enable lists
					const
						enableList = ['BTN_STOP'],
						disableList = [
							'BTN_START',
							'SELECT_GAME',
							'BTN_RUN_GAME',
							'BTN_SELECT_EXE',
							'SELECT_SCENARIO'
						];

					// Open process and update GUI
					APP.gameHook.gameObject = APP.memoryjs.openProcess(exeName);
					TMS.addClass('RE_CAPTURE_ICON', 'RE_CAPTURE_ICON_ON');
					APP.graphics.processDisableList(disableList);
					APP.graphics.processEnableList(enableList);
					APP.gameHook.gameActive = !0;

					// Check if needs to hide menu
					if (APP.options.hideTopMenu === !0) TMS.css('MENU_TOP', {'height': '0px'});

					// Update labels, top menu and set interval
					APP.graphics.updateGuiLabel();
					APP.graphics.togglehideTopMenu();
					APP.gameHook.updateObject = setInterval(function(){
						if (APP.options.enableReadGameData === !0) APP.gameHook.updateProcess();
					}, 100);

				} catch (err) {
					window.alert(`ERROR - Unable to load game process!\n${err}\n\nCheck internal log to know more.`);
					window.alert('IMPORTANT: If you are running the game process from BioRand itself, Don\'t use \"Start RE?\" button!\n\nInstead, run the game using \"Start Game\" [CTRL + Shift + R] at top-left corner - or from file explorer.');
					console.error(err);
				}

			} else {
				window.alert(`ERROR - Unable to find game process!\n(${exeName})`);
			}
		
		}

	},

	// Stop reading game
	stop: function(skipOpenRightMenu){

		// Clear game interval and create var for GUI
		clearInterval(this.updateObject);
		const
			disableList = ['BTN_STOP'],
			enableList = [
				'BTN_START',
				'SELECT_GAME',
				'BTN_SELECT_EXE',
				'SELECT_SCENARIO'
			];

		// Update buttons, reset top menu manually and remove on icon
		APP.graphics.processEnableList(enableList);
		APP.graphics.processDisableList(disableList);
		TMS.removeClass('RE_CAPTURE_ICON', 'RE_CAPTURE_ICON_ON');
		TMS.css('MENU_TOP', {'height': `${APP.graphics.maxHeight}px`});

		// Update selected game / check if current game exists, open right menu, reset spawn variable and set running flag as false
		APP.options.updateSelectedGame();
		if (skipOpenRightMenu !== !0) APP.options.toggleRightMenu('open');
		APP.spawnProcess = void 0;
		this.gameActive = !1;

		// Reset labels
		document.getElementById('LABEL_RE3_INFO_mapName').innerHTML = '';
		APP.graphics.updateGuiLabel();

	},

	// Read data from target process
	read: function(ramPos, limit, mode, length){

		var res = '00';
		if (length === void 0) length = 1;

		if (ramPos !== void 0 && this.gameActive === !0){

			if (limit === void 0 || parseInt(limit) === NaN) limit = 2;
			if (mode === void 0 || mode === '') mode = 'int';

			switch (mode){

				case 'int':
					var temp = '';
					for (var i = 0; i < length; i++){
						temp = `${temp}${res = APP.tools.fixVars(APP.memoryjs.readMemory(APP.gameHook.gameObject.handle, (parseInt(ramPos.replace('0x', ''), 16) + i), APP.memoryjs.BYTE).toString(16), limit).toUpperCase()}`;
					}
					res = parseInt(temp, 16);
					break;

				case 'hex':
					res = '';
					for (var i = 0; i < length; i++){
						res = `${res}${APP.tools.fixVars(APP.memoryjs.readMemory(APP.gameHook.gameObject.handle, (parseInt(ramPos.replace('0x', ''), 16) + i), APP.memoryjs.BYTE).toString(16), limit).toUpperCase()}`;
					}
					break;

			}

		}

		return res;

	},

	// Check game state
	updateProcess: function(){

		// Check if game process is available
		const
			cGame = APP.options.settingsData.currentGame,
			pList = Array.from(APP.memoryjs.getProcesses()),
			gProcess = pList.filter(function(cProcess){
				if (cProcess.szExeFile === APP.options.settingsData[cGame].exeName) return cProcess;
			});

		// Check if process was found
		if (gProcess.length !== 0){

			try {

				// Variables
				var prevCam,
					needUpdateCam = !1,
					memoryData = APP.options.settingsData[cGame],
					cRoom = APP.gameHook.read(memoryData.room, 2, 'hex'),
					cCamera = parseInt(APP.gameHook.read(memoryData.cam, 2, 'hex'), 16),
					isBioRandActive = document.getElementById('CHECKBOX_isBioRand').checked,
					previousMap = APP.gameHook.mapHistory[APP.gameHook.mapHistory.length - 1],
					cStage = (parseInt(APP.gameHook.read(memoryData.stage, 2, 'hex')) + 1).toString(16).toUpperCase(),
					cMap = `R${cStage}${cRoom}`;

				// Fixes for biocv
				if (cGame === 'biocv'){

					// Get camera
					cCamera = parseInt(APP.tools.parseEndian(APP.gameHook.read(memoryData.cam, 2, 'hex', 4)), 16);
					prevCam = Number(APP.tools.parseEndian(APP.gameHook.read((Number(memoryData.cam) + 4).toString(16), 2, 'hex', 4)));

				}

				// Set current map and check if needs to update label GUI depending of which game is selected
				APP.gameHook.currentMap = cMap;
				if (cGame === 'biocv'){

					if (cCamera !== APP.gameHook.currentCamera && APP.gameHook.updateCamCvx === !1 && isNaN(prevCam) === !1){
						needUpdateCam = !0;
						APP.gameHook.camHistory.push(cCamera);
					}	

				} else {

					if (cCamera !== APP.gameHook.currentCamera){
						needUpdateCam = !0;
						APP.gameHook.camHistory.push(cCamera);
					}	

				}

				// Check if needs to update biocv cam
				APP.gameHook.currentCamera = cCamera;
				if (APP.gameHook.updateCamCvx === !0 && isNaN(prevCam) === !1){
					APP.gameHook.camHistory.push(cCamera);
					APP.graphics.processAddCamHint(cMap);
					APP.gameHook.updateCamCvx = !1;
				}

				// Update current camera and check if needs to trim cam history
				if (APP.gameHook.camHistory.length > 9) APP.gameHook.camHistory.splice(0, 7);

				// Create reset conditions var
				const resetConditions = [

					// Bio 1
					cGame === 'bio1' && isBioRandActive === !1 && APP.database[cGame].rdt[cMap].gameStart === !0 && previousMap === 'R100',
					cGame === 'bio1' && APP.database[cGame].rdt[cMap].gameStart === !0 && previousMap === 'R11F',

					// Bio 2
					cGame === 'bio2' && isBioRandActive === !1 && cMap !== 'R104' && APP.database[cGame].rdt[cMap].gameStart === !0 && APP.gameHook.mapHistory.length > 1,

					// Bio 3
					cGame === 'bio3' && APP.database[cGame].rdt[cMap].gameStart === !0 && APP.gameHook.mapHistory.length > 1

				];

				// Check if needs to reset current map
				if (resetConditions.indexOf(!0) !== -1) APP.options.resetMap();

				// Check if latest map is the current one
				if (this.mapHistory[(this.mapHistory.length - 1)] !== cMap){

					// Push current cam to prevent bugs
					if (needUpdateCam === !1 && cGame !== 'biocv') APP.gameHook.camHistory.push(cCamera);
					if (needUpdateCam === !1 && cGame === 'biocv') APP.gameHook.updateCamCvx = !0;

					// Push room to map and update player pos.
					APP.gameHook.mapHistory.push(cMap);
					const mHistory = APP.gameHook.mapHistory;
					APP.graphics.pushMap(mHistory[(mHistory.length - 1)], mHistory[(mHistory.length - 2)]);
					APP.graphics.updatePlayerPos();

					// Add Cam Hint
					if (cGame !== 'biocv') APP.graphics.processAddCamHint(cMap);

				}

				// Update current cam var
				if (needUpdateCam === !0){
					APP.graphics.processCamHint();
					APP.graphics.updateGuiLabel();
				}

			} catch (err) {

				APP.gameHook.stop();
				window.alert(`ERROR - Unable to read game data!\n${err}\n\nThis may happen due game process not being available anymore.`);
				console.error(err);

			}

		} else {

			APP.gameHook.stop();
			window.alert('ERROR - Unable to read game data!\nReason: The game process was closed / not found!');

		}

	}

}