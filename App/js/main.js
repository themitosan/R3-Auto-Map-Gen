/*
	R3 Auto Map Gen.
	main.js
*/

const APP = {

	// Version
	hash: nw.App.manifest.hash,
	version: nw.App.manifest.version,

	// Path prefix
	pathPrefix: '',

	// Modules
	fs: void 0,
	win: void 0,
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

	// Timeout and Interval database
	timeoutDatabase: {},
	intervalDatabase: {},

	/*
		Functions
	*/

	// Start keyboard shortcuts
	startKbShortcuts: function(disableGlobal){

		// Prevent tab
		document.addEventListener('keydown', function(event){
			if (event.keyCode === 9){
				event.preventDefault();
			}
		});

		// Start keypress
		window.onkeyup = function(evt){

			switch (evt.key){

				// Debug: Reload app
				case 'F5':
					if (disableGlobal === !0){
						location.reload(!0);
					}
					break;

				case 'F1':
					APP.about();
					break;

				case 'Alt':
					APP.graphics.toggleDragMapCanvas();
					break;

				case 'F7':
					APP.graphics.updatePlayerPos(!0);
					break;

				case 'F8':
					APP.graphics.resetCanvasZoom();
					break;

				case 'F9':
					APP.options.resetMap();
					break;

				case 'F10':
					APP.options.loadLatestFile();
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
			APP.graphics.updatePlayerPos(!0);
		});
		createGlobalShortcut('Ctrl+F8', function(){
			APP.graphics.resetCanvasZoom();
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
		createGlobalShortcut('Ctrl+Shift+R', function(){
			APP.runGame();
		});
		createGlobalShortcut('Ctrl+Shift+H', function(){
			APP.gameHook.seekGame();
		});
		createGlobalShortcut('Ctrl+Shift+Q', function(){
			APP.options.toggleRightMenu('open');
		});

	},

	// About screen
	about: function(){
		
		// Close color picker
		this.tools.closeColorPicker();

		// Display about screen
		window.alert(`R3 Auto Map Gen. - Version: ${APP.version}\nCreated by TheMitoSan\nTwitter: @themitosan\n\nBuild Hash: ${this.hash}\n\nExternal plugins present on this project:\nmemoryjs by Rob--\nhttps://github.com/rob--/memoryjs\n\nBioRand is an application created by IntelOrca:\nhttps://github.com/intelorca/biorand/\nhttps://biorand.net/`);

	},

	// Run game
	runGame: function(){

		// Get game path
		const
			settingsData = APP.options.settingsData,
			gPath = `${settingsData[settingsData.currentGame].gamePath}/${settingsData[settingsData.currentGame].exeName}`;

		// Check if game path exists
		if (APP.fs.existsSync(gPath) === !0){
			
			// Start game
			const doStartGamePlz = function(){

				try {

					// Update chdir and run game
					process.chdir(settingsData[settingsData.currentGame].gamePath);
					APP.spawnProcess = APP.childProcess.spawn(gPath, [], {
						detached: !0
					});

					// Seek game process
					setTimeout(function(){
						APP.gameHook.seekGame(!0);
					}, 50);

				} catch (err) {
					console.error(err);
					window.alert(`ERROR - Unable to start game process!\n\n${err}`);
					throw new Error(err);
				}

			}

			// Check if game is running
			var exeName = settingsData[settingsData.currentGame].exeName,
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

	// Start app function
	init: function(){

		try {

			// Fix empty hash
			if (APP.hash === ''){
				APP.hash = 'DIRTY';
			}

			// Set vars
			var startKbDevMode = !1,
				appTitle = `R3 Auto Map Gen - Version: ${APP.version} [${APP.hash}]`; 

			// Update log and app title
			console.info(appTitle);
			document.title = appTitle;
			document.getElementById('APP_DRAG_BAR').innerHTML = appTitle;

			// Check if app is on dev mode
			if (nw.App.argv.indexOf('-dev') !== -1){
				document.getElementById('BTN_DEV_KB_SH').disabled = '';
				APP.pathPrefix = 'App/';
				startKbDevMode = !0;
			} else {
				TMS.css('BTN_DEV_KB_SH', {'display': 'none'});
			}

			// Require modules
			APP.fs = require('fs');
			APP.win = nw.Window.get();
			APP.path = require('path');
			APP.childProcess = require('child_process');
			APP.memoryjs = require(`${APP.pathPrefix}node_modules/memoryjs`);

			// Reset chdir and enable start
			process.chdir(APP.tools.fixPath(APP.path.parse(process.execPath).dir));
			document.getElementById('BTN_START').disabled = '';
			document.getElementById('BTN_START').focus();

			// Start keyboard shortcuts, load settings, set windows actions and toggle bg colot
			APP.startKbShortcuts(startKbDevMode);
			APP.options.loadSettings();
			APP.graphics.startWinActions();
			APP.graphics.toggleBgColor();

			// Display menus
			setTimeout(function(){
				TMS.css('MENU_RIGHT', {'width': '196px', 'filter': 'blur(0px)'});
				TMS.css('MENU_TOP', {'width': 'calc(100% - 196px)', 'height': '30px', 'filter': 'blur(0px)'});
			}, 50);

		} catch (err) {
			window.alert(`ERROR - Something happened on boot process!\n${err}`);
			console.error(err);
			throw new Error(err);
		}

	},

	// DEV - Start global shortcuts button
	devStartShortCuts: function(){
		document.getElementById('BTN_DEV_KB_SH').disabled = 'disabled';
		TMS.css('BTN_DEV_KB_SH', {'display': 'none'});
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