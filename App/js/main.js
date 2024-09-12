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
	os: void 0,
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

	// Keyboard input
	kbInput: [],

	/*
		Functions
	*/

	// Start keyboard shortcuts
	startKbShortcuts: function(disableGlobal){

		// Prevent tab
		document.addEventListener('keydown', function(evt){
			if (evt.keyCode === 9){
				evt.preventDefault();
			}
			if (APP.kbInput.indexOf(evt.code) === -1){
				APP.kbInput.push(evt.code);
			}
		});

		// Start keypress
		window.onkeyup = function(evt){

			// Remove key from keyboard input
			if (APP.kbInput.indexOf(evt.code) !== -1){
				APP.kbInput.splice(APP.kbInput.indexOf(evt.code), 1);
			}

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

		// Close color picker and display about screen
		this.tools.closeColorPicker();
		window.alert(`R3 Auto Map Gen - Version: ${APP.version}\nCreated by TheMitoSan\nTwitter: @themitosan\n\nBuild Hash: ${this.hash}\nNW.js version: ${process.versions.nw}\n\nExternal plugins present on this project:\nmemoryjs by Rob--\nhttps://github.com/rob--/memoryjs\n\nBioRand is an application created by IntelOrca:\nhttps://github.com/intelorca/biorand/\nhttps://biorand.net/\n\nLoading gif was generated on loading.io:\nhttps://loading.io\n\nFont \"Space Mono\" was created by Colophon Foundry:\nhttps://fonts.google.com/specimen/Space+Mono`);

	},

	// Run game
	runGame: function(){

		// Get game path
		const
			settingsData = APP.options.settingsData,
			cGame = APP.options.settingsData.currentGame,
			gPath = `${settingsData[cGame].gamePath}/${settingsData[cGame].exeName}`;

		// Check if game path exists
		if (APP.fs.existsSync(gPath) === !0){

			// Start game
			const doStartGamePlz = function(){

				try {

					// Create vars
					var execArgs = [],
						hookTimeout = 50;

					// Check if current game is biocv
					if (cGame === 'biocv'){
						TMS.css('DIV_LOADING_PLEASE_WAIT', { 'display': 'flex' });
						execArgs.push(`${settingsData[cGame].dumpPath}`);
						TMS.css('APP_GAME_DATA', { 'display': 'none' });
						hookTimeout = 3000;
					}

					// Update chdir and run game
					process.chdir(settingsData[settingsData.currentGame].gamePath);
					APP.spawnProcess = APP.childProcess.spawn(gPath, execArgs, {
						detached: !0
					});

					// Seek game process
					setTimeout(function(){
						APP.gameHook.seekGame(!0);
						APP.graphics.updateGuiLabel();
						if (JSON.parse(localStorage.getItem('showGameData')) === !0){
							TMS.css('APP_GAME_DATA', { 'display': 'block' });
						}
						TMS.css('DIV_LOADING_PLEASE_WAIT', { 'display': 'none' });
					}, hookTimeout);

				} catch (err) {
					console.error(err);
					window.alert(`ERROR - Unable to start game process!\n\n${err}`);
					throw err;
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

			// Update log, app title and check if wine fix is active
			console.info(appTitle);
			document.title = appTitle;
			document.getElementById('APP_DRAG_BAR').innerHTML = appTitle;
			if (nw.App.manifest.extra.wineFix === !0){

				// Create consts
				const
					hideCss = { 'display': 'none' },
					fixMargin = { 'margin-bottom': '8px' };

				// Update CSS
				TMS.css('APP_DRAG_BAR', hideCss);
				TMS.css('BTN_RESET_ZOOM', fixMargin);
				TMS.css('MENU_TOP', { 'top': '0px' });
				TMS.css('APP_DRAG_BAR_ACTIONS', hideCss);
				TMS.css('BTN_PICK_BG_COLOR_BOTTOM', fixMargin);
				TMS.css('body', { 'background-color': '#002' });
				TMS.css('APP_CANVAS', { 'border-radius': '0px' });
				TMS.css('APP_GAME_HINTS', { 'transition-duration': '0s' });
				TMS.css('MENU_RIGHT', { 'top': '40px', 'height': 'calc(100% - 68px)', 'transition-duration': '0s' });
				TMS.css('APP_GAME_DATA', { 'top': '40px', 'transition-duration': '0s' });

			}

			// Check if app is on dev mode
			if (nw.App.argv.indexOf('-dev') !== -1){
				document.getElementById('BTN_DEV_KB_SH').disabled = '';
				APP.pathPrefix = 'App/';
				startKbDevMode = !0;
			} else {
				TMS.css('BTN_DEV_KB_SH', {'display': 'none'});
			}

			// Require os module and check if current user are running windows
			APP.os = require('os');
			if (APP.os.platform() === 'win32'){

				// Require remaining modules
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
					TMS.css('MENU_TOP', {'height': '30px', 'filter': 'blur(0px)'});
					TMS.css('MENU_RIGHT', {'width': '196px', 'filter': 'blur(0px)', 'right': '14px'});
				}, 50);

			} else {
				window.alert(`INFO - It seems that you are running this app on a non-windows operating system.\n\nSince this app requires memoryjs (a node module that only run on windows), you can\'t run this application natively on ${APP.os.platform()}.\n\nBut you can run this app using windows version under wine!\nTo run, make sure that wine is installed on yout system and run the following command:\nwine64 \"R3 Auto Map Gen.exe\" -wineFix\n\nR3 Auto Map Gen will quit after closing this message.`);
				nw.App.quit();
			}

		} catch (err) {
			window.alert(`ERROR - Something happened on boot process!\n${err}`);
			throw err;
		}

	},

	// DEV - Start global shortcuts button
	devStartShortcuts: function(){
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