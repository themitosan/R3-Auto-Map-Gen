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
	gameActive: !1,
	gameObject: void 0,
	updateObject: void 0,

	/*
		Functions
	*/

	// Seek game
	seekGame: function(skipCheck){
		
		if (this.gameActive === !1){

			// Check if game process exists
			var cGame = APP.options.settingsData.currentGame,
				exeName = APP.options.settingsData[cGame].exeName,
				pList = Array.from(APP.memoryjs.getProcesses()),
				gProcess = pList.filter(function(cProcess){
					if (cProcess.szExeFile === exeName){
						return cProcess;
					}
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
					TMS.addClass('RE3_CAPTURE_ICON', 'RE3_CAPTURE_ICON_ON');
					APP.graphics.processDisableList(disableList);
					APP.graphics.processEnableList(enableList);
					APP.gameHook.gameActive = !0;

					// Check if needs to hide menu
					if (APP.options.hideTopMenu === !0){
						TMS.css('MENU_TOP', {'height': '0px'});
					}

					// Update labels, top menu and set interval
					APP.graphics.updateGuiLabel();
					APP.graphics.togglehideTopMenu();
					APP.gameHook.updateObject = setInterval(function(){
						APP.gameHook.updateProcess();
					}, 200);

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
		TMS.css('MENU_TOP', {'height': '30px'});
		APP.graphics.processEnableList(enableList);
		APP.graphics.processDisableList(disableList);
		TMS.removeClass('RE3_CAPTURE_ICON', 'RE3_CAPTURE_ICON_ON');

		// Update selected game / check if current game exists, open right menu, reset spawn variable and set running flag as false
		APP.options.updateSelectedGame();
		if (skipOpenRightMenu !== !0){
			APP.options.toggleRightMenu('open');
		}
		APP.spawnProcess = void 0;
		this.gameActive = !1;

		// Reset labels
		document.getElementById('LABEL_RE3_INFO_mapName').innerHTML = '';
		APP.graphics.updateGuiLabel();

	},

	// Read data
	read: function(ramPos, limit, mode){

		var res = '00';
		if (ramPos !== void 0 && this.gameActive === !0){
			
			if (limit === void 0 || parseInt(limit) === NaN){
				limit = 2;
			}

			if (mode === void 0 || mode === ''){
				mode = 'int';
			}

			switch (mode){

				case 'int':
					res = APP.memoryjs.readMemory(APP.gameHook.gameObject.handle, parseInt(ramPos), APP.memoryjs.BYTE);
					break;

				case 'hex':
					res = APP.tools.fixVars(APP.memoryjs.readMemory(APP.gameHook.gameObject.handle, parseInt(ramPos.toString().replace('0x', ''), 16), APP.memoryjs.BYTE).toString(16), limit).toUpperCase();
					break;

			}

		}

		return res;

	},

	// Check game state
	updateProcess: function(){

		// Check if game process is available
		const cGame = APP.options.settingsData.currentGame,
			pList = Array.from(APP.memoryjs.getProcesses()),
			gProcess = pList.filter(function(cProcess){
				if (cProcess.szExeFile === APP.options.settingsData[cGame].exeName){
					return cProcess;
				}
			});

		// Check if process was found
		if (gProcess.length !== 0){

			try {

				// Variables
				var isBioRandActive = document.getElementById('CHECKBOX_isBioRand').checked,
					memoryData = APP.options.settingsData[cGame],
					cStage = (parseInt(APP.gameHook.read(memoryData.stage, 2, 'hex')) + 1).toString(),
					cMap = `R${cStage}${APP.gameHook.read(memoryData.room, 2, 'hex')}`;

				// console.info(`${cStage}\n${APP.gameHook.read(memoryData.room, 2, 'hex')}`);

				// Reset conditions
				const resetConditions = [

					// Bio 1
					cGame === 'bio1' && isBioRandActive === !1 && APP.database[cGame].rdt[cMap].gameStart === !0 && APP.gameHook.mapHistory[APP.gameHook.mapHistory.length - 1] === 'R100',

					// Bio 2
					cGame === 'bio2' && isBioRandActive === !1 && cMap !== 'R104' && APP.database[cGame].rdt[cMap].gameStart === !0 && APP.gameHook.mapHistory.length > 1,

					// Bio 3
					cGame === 'bio3' && APP.database[cGame].rdt[cMap].gameStart === !0 && APP.gameHook.mapHistory.length > 1

				];

				// Check if needs to reset current map
				if (resetConditions.indexOf(!0) !== -1){
					APP.options.resetMap();
				}

				// Check if latest map is the current one
				if (this.mapHistory[(this.mapHistory.length - 1)] !== cMap){

					// Push room to map and update player pos.
					APP.gameHook.mapHistory.push(cMap);
					const mHistory = APP.gameHook.mapHistory;
					APP.graphics.pushMap(mHistory[(mHistory.length - 1)], mHistory[(mHistory.length - 2)]);
					APP.graphics.updatePlayerPos();

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