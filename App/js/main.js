/*
	R3 Auto Map Gen.
	main.js
*/

const APP = {

	// Version
	version: '1.0.0',
	hash: nw.App.manifest.hash,

	// Modules
	fs: void 0,
	path: void 0,
	memoryjs: void 0,
	childProcess: void 0,

	// Import other files
	tools: temp_TOOLS,
	options: temp_OPTIONS,
	gameHook: temp_GAMEHOOK,
	graphics: temp_GRAPHICS,
	database: temp_DATABASE,
	filemanager: temp_FILEMANAGER,

	/*
		Functions
	*/

	// Start keyboard shortcuts
	startKbShortcuts: function(){

		// Start keypress
		window.onkeyup = function(evt){

			// console.info(evt);

			switch (evt.key){

				case 'F1':
					APP.about();
					break;

				case 'Control':
					APP.graphics.toggleDragMapCanvas();
					break;

				case 'F7':
					APP.graphics.updatePlayerPos();
					break;

				case 'F8':
					APP.options.resetCanvasZoom();
					break;

				case 'F9':
					APP.options.resetMap();
					break;

				case 'F10':
					APP.options.loadLatestFile();
					break;

			}

		}

		// Create quick save shortcut
		var sMap = new nw.Shortcut({
				key: 'Ctrl+Shift+S',
				active: function(){
					APP.options.saveMap(!0);
				}
			}),
			lMap = new nw.Shortcut({
				key: 'Ctrl+F10',
				active: function(){
					APP.options.loadLatestFile();
				}
			}),
			rMap = new nw.Shortcut({
				key: 'Ctrl+F9',
				active: function(){
					APP.options.resetMap();
				}
			});

		// Register shortcuts
		nw.App.registerGlobalHotKey(sMap);
		nw.App.registerGlobalHotKey(lMap);
		nw.App.registerGlobalHotKey(rMap);

	},

	// About screen
	about: function(){
		window.alert('R3 Auto Map Gen. - Version: ' + APP.version + '\nCreated by TemmieHeartz\nTwitter: @TemmieHeartz\n\nBuild Hash: ' + this.hash);
	},

	// Run game
	runGame: function(){

		// Get game executable path and check if the same exists
		const gPath = APP.options.settingsData.gamePath + '/' + APP.options.settingsData.exeName;

		if (APP.fs.existsSync(gPath) === !0){

			// Spawn process and read selected game folder
			var gProcess,
				gFolder = APP.fs.readdirSync(APP.options.settingsData.gamePath),
				pList = Array.from(APP.memoryjs.getProcesses()),
				pFilter = pList.filter(function(cProcess){
					if (cProcess.szExeFile === APP.options.settingsData.exeName){
						return cProcess;
					}
				});

			// Check if can spawn process
			if (pFilter.length === 0){
				gProcess = APP.childProcess.spawn(gPath, [], {detached: !0});
			}

			// Check if Gemini REBirth exists on selected folder
			if (gFolder.indexOf('ddraw.dll') !== -1){
				window.alert('INFO: Gemini REBirth mod was detected.\n\nWhen \"This game contains scenes of explicit violence and gore\" message shows up, close this alert.');
			}

			// Delay starting hook process
			setTimeout(function(){
				APP.gameHook.seekGame();
			}, 50);

		}

	},

	// Init
	init: function(){

		try {

			// Fix empty hash
			if (APP.hash === ''){
				APP.hash = 'DIRTY';
			}

			// Get app title string
			const appTitle = 'R3 Auto Map Gen. - Version: ' + APP.version + ' [' + APP.hash + ']'; 

			console.info(appTitle);
			document.title = appTitle;

			// Require modules
			APP.fs = require('fs');
			APP.path = require('path');
			APP.memoryjs = require('App/memoryjs');
			APP.childProcess = require('child_process');

			// Enable start
			document.getElementById('BTN_START').disabled = '';
			document.getElementById('BTN_START').focus();

			// Start keyboard shortcuts
			APP.startKbShortcuts();

			// Load settings
			APP.options.loadSettings();

		} catch (err) {
			window.alert('ERROR - Something happened on boot process!\n' + err);
			throw new Error(err);
		}

	}

}

// Remove modules
delete temp_TOOLS;
delete temp_OPTIONS;
delete temp_GAMEHOOK;
delete temp_GRAPHICS;
delete temp_DATABASE;
delete temp_FILEMANAGER;

window.onload = APP.init;