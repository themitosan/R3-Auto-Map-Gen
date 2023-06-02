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
			var exeName = APP.options.settingsData.exeName,
				pList = Array.from(APP.memoryjs.getProcesses()),
				gProcess = pList.filter(function(cProcess){
					if (cProcess.szExeFile === exeName){
						return cProcess;
					}
				});
	
			if (gProcess.length !== 0 || skipCheck === !0){
	
				try {

					// Open process
					APP.gameHook.gameObject = APP.memoryjs.openProcess(exeName);

					// Update GUI
					TMS.addClass('RE3_CAPTURE_ICON', 'RE3_CAPTURE_ICON_ON');
					document.getElementById('BTN_SELECT_EXE').disabled = 'disabled';
					document.getElementById('BTN_RUN_GAME').disabled = 'disabled';
					document.getElementById('BTN_START').disabled = 'disabled';
					document.getElementById('BTN_STOP').disabled = '';
					APP.gameHook.gameActive = !0;

					// Check if needs to hide menu
					if (APP.options.hideTopMenu === !0){
						TMS.css('MENU_TOP', {'height': '0px'});
					}

					// Update labels
					APP.graphics.updateGuiLabel();
					
					// Set interval
					APP.gameHook.updateObject = setInterval(function(){
						APP.gameHook.updateProcess();
					}, 200);

				} catch (err) {
					window.alert('ERROR: Unable to load game process!' + err + '\nCheck internal log to know more.');
					window.alert('IMPORTANT: If you are running the game process from BioRand, Don\'t use \"Start RE3\" button!\n\nInstead, run the game using \"Start Game\" at top-left corner or from explorer.');
					console.error(err);
				}
	
			} else {
				window.alert('ERROR: Unable to find game process!\n(' + exeName + ')');
			}
		
		}

	},

	// Stop reading game
	stop: function(){

		// Clear game interval
		clearInterval(this.updateObject);

		// Update buttons
		document.getElementById('BTN_START').disabled = '';
		document.getElementById('BTN_SELECT_EXE').disabled = '';
		document.getElementById('BTN_STOP').disabled = 'disabled';

		// Reset top menu manually
		TMS.css('MENU_TOP', {'height': '30px'});

		// Remove on icon
		TMS.removeClass('RE3_CAPTURE_ICON', 'RE3_CAPTURE_ICON_ON');

		// Check if game executable exists
		if (APP.fs.existsSync(APP.options.settingsData.gamePath + '/' + APP.options.settingsData.exeName) === !0){
			document.getElementById('BTN_RUN_GAME').disabled = '';
		}

		// Reset spawn variable
		APP.spawnProcess = void 0;

		// Set running flag as false
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
		const pList = Array.from(APP.memoryjs.getProcesses()),
			gProcess = pList.filter(function(cProcess){
				if (cProcess.szExeFile === APP.options.settingsData.exeName){
					return cProcess;
				}
			});

		if (gProcess.length !== 0){

			try {

				// Get memory positions and read
				var memoryData = APP.options.settingsData.memoryData,
					cStage = (parseInt(APP.gameHook.read(memoryData.stage, 2, 'hex')) + 1).toString(),
					cMap = 'R' + cStage + APP.gameHook.read(memoryData.room, 2, 'hex');

				// Switch game start / end
				switch (cMap){

					// Game start
					case 'R10D':
						if (APP.gameHook.mapHistory.length > 1){
							APP.options.resetMap();
						}
						break;

					// Game end
					case 'R50E':
						if (APP.gameHook.mapHistory.length > 1){
							APP.options.resetMap();
						}
						break;

				}

				// Check if latest map is the current one
				if (this.mapHistory[(this.mapHistory.length - 1)] !== cMap){

					APP.gameHook.mapHistory.push(cMap);
					const mHistory = APP.gameHook.mapHistory;

					// Push room to map
					APP.graphics.pushMap(mHistory[(mHistory.length - 1)], mHistory[(mHistory.length - 2)]);

					// Update player pos.
					APP.graphics.updatePlayerPos();

				}

			} catch (err) {

				APP.gameHook.stop();
				window.alert('ERROR - Unable to read game data!\n' + err + '\n\nThis may happen due game process not being available anymore.');
				console.error(err);

			}

		} else {

			APP.gameHook.stop();
			window.alert('ERROR - Unable to read game data!\nReason: The game process was closed / not found!');

		}

	}

}