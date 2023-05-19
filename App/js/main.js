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

		// Create global shortcuts 
		const createGlobalShortcut = function(keys, action){
			var newKey = new nw.Shortcut({
				key: keys,
				active: function(){
					action();
				}
			});
			nw.App.registerGlobalHotKey(newKey);
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

	},

	// About screen
	about: function(){
		window.alert('R3 Auto Map Gen. - Version: ' + APP.version + '\nCreated by TemmieHeartz\nTwitter: @TemmieHeartz\n\nBuild Hash: ' + this.hash +
					 '\n\nExternal plugins present on this project:\n\nmemoryjs by Rob--\nhttps://github.com/rob--/memoryjs');
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

			// Update log and app title
			console.info(appTitle);
			document.title = appTitle;

			// Require modules
			APP.fs = require('fs');
			APP.path = require('path');
			APP.childProcess = require('child_process');

			// Require memoryjs
			if (nw.App.argv.indexOf('-dev') !== -1){
				APP.memoryjs = require('App/node_modules/memoryjs');
			} else {
				APP.memoryjs = require('node_modules/memoryjs');
			}

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

// Init
window.onload = APP.init;