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
	spawnProcess: void 0,
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
	startKbShortcuts: function(disableGlobal){

		// Start keypress
		window.onkeyup = function(evt){

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

				case 'Delete':
					APP.options.delGameSaveFiles();
					break;

				case '=':
					APP.options.adjustFontSize('plus');
					break;

				case '-':
					APP.options.adjustFontSize('minus');
					break;

			}

		}

		// Create global shortcuts 
		const createGlobalShortcut = function(keys, action){
			if (disableGlobal !== !0){
				var newKey = new nw.Shortcut({
					key: keys,
					active: function(){
						action();
					},
					failed: function(err){
						console.error(err);
					}
				});
				nw.App.registerGlobalHotKey(newKey);
			}
		}

		// Init global shortcuts
		createGlobalShortcut('Ctrl+Shift+S', function(){
			APP.options.saveMap(!0);
		});
		createGlobalShortcut('Ctrl+F7', function(){
			APP.graphics.enableCanvasDrag = !0;
			APP.graphics.toggleDragMapCanvas();
			APP.graphics.updatePlayerPos();
		});
		createGlobalShortcut('Ctrl+F8', function(){
			APP.options.resetCanvasZoom();
		});
		createGlobalShortcut('Ctrl+F9', function(){
			APP.options.resetMap();
		});
		createGlobalShortcut('Ctrl+F10', function(){
			APP.options.loadLatestFile();
		});
		createGlobalShortcut('Ctrl+Delete', function(){
			APP.options.delGameSaveFiles();
		});
		createGlobalShortcut('Ctrl+Equal', function(){
			APP.options.adjustFontSize('plus');
		});
		createGlobalShortcut('Ctrl+-', function(){
			APP.options.adjustFontSize('minus');
		});
		createGlobalShortcut('Ctrl+Shift+R', function(){
			APP.runGame();
		});
		createGlobalShortcut('Ctrl+Shift+H', function(){
			APP.gameHook.seekGame();
		});

	},

	// About screen
	about: function(){
		window.alert('R3 Auto Map Gen. - Version: ' + APP.version + '\nCreated by TemmieHeartz\nTwitter: @TemmieHeartz\n\nBuild Hash: ' + this.hash +
					 '\n\nExternal plugins present on this project:\n\nmemoryjs by Rob--\nhttps://github.com/rob--/memoryjs');
	},

	// Run game
	runGame: function(){

		// Get game path
		const gPath = APP.options.settingsData.gamePath + '/' + APP.options.settingsData.exeName;

		// Check if game path exists
		if (APP.fs.existsSync(gPath) === !0){

			
			// Start game
			const doStartGamePlz = function(){

				try {

					// Update chdir
					process.chdir(APP.options.settingsData.gamePath);

					// Run game
					APP.spawnProcess = APP.childProcess.spawn(gPath, [], {
						detached: !0
					});

					// Seek game process
					setTimeout(function(){
						APP.gameHook.seekGame(!0);
					}, 50);

				} catch (err) {
					window.alert('ERROR: Unable to start game process!\n\n' + err);
					throw new Error(err);
				}

			}

			// Check if game is running
			var exeName = APP.options.settingsData.exeName,
				pList = Array.from(APP.memoryjs.getProcesses()),
				gProcess = pList.filter(function(cProcess){
					if (cProcess.szExeFile === exeName){
						return cProcess;
					}
				});
			if (gProcess.length === 0){
				doStartGamePlz();
			} else {
				APP.gameHook.seekGame(!0);
			}

		}

	},

	// Init
	init: function(){

		try {

			// Fix empty hash
			if (APP.hash === ''){
				APP.hash = 'DIRTY';
			}

			// Set vars
			var startKbDevMode = !1,
				appTitle = 'R3 Auto Map Gen. - Version: ' + APP.version + ' [' + APP.hash + ']'; 

			// Update log and app title
			console.info(appTitle);
			document.title = appTitle;

			// Require modules
			APP.fs = require('fs');
			APP.path = require('path');
			APP.childProcess = require('child_process');

			// Check if app is on dev mode
			if (nw.App.argv.indexOf('-dev') !== -1){
				document.getElementById('BTN_DEV_KB_SH').disabled = '';
				APP.memoryjs = require('App/node_modules/memoryjs');
				startKbDevMode = !0;
			} else {
				APP.memoryjs = require('node_modules/memoryjs');
			}

			// Reset chdir
			process.chdir(APP.tools.fixPath(APP.path.parse(process.execPath).dir));

			// Enable start
			document.getElementById('BTN_START').disabled = '';
			document.getElementById('BTN_START').focus();

			// Start keyboard shortcuts
			APP.startKbShortcuts(startKbDevMode);

			// Load settings
			APP.options.loadSettings();

		} catch (err) {
			window.alert('ERROR - Something happened on boot process!\n' + err);
			throw new Error(err);
		}

	},

	// DEV - Start global shortcuts button
	devStartShortCuts: function(){
		document.getElementById('BTN_DEV_KB_SH').disabled = 'disabled';
		APP.startKbShortcuts(!1);
	}

}

// Remove modules
delete temp_TOOLS;
delete temp_OPTIONS;
delete temp_GAMEHOOK;
delete temp_GRAPHICS;
delete temp_DATABASE;
delete temp_FILEMANAGER;

// Init
window.onload = APP.init;