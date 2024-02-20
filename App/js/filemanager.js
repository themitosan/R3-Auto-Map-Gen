/*
	R3 Auto Map Gen.
	filemanager.js
*/

temp_FILEMANAGER = {

	// Select path
	selectPath: function(postAction){

		// Check if postAction was provided
		if (typeof postAction === 'function'){

			// Set onchange event
			document.getElementById('APP_FOLDER_LOADER').onchange = function(){

				// Get current path and execute checks
				const cFile = document.getElementById('APP_FOLDER_LOADER').files[0];
				if (cFile.path !== null && cFile.path !== void 0 && cFile.path !== ''){

					// Reset path loader and execute post action
					document.getElementById('APP_FOLDER_LOADER').value = '';
					document.getElementById('APP_FOLDER_LOADER').accept = '';
					postAction(APP.tools.fixPath(cFile.path));

				}

			}

			// Call popup window
			TMS.triggerClick('APP_FOLDER_LOADER');

		}

	},

	// Select file
	selectFile: function(ext, postAction){

		// Reset file loader
		document.getElementById('APP_FILE_LOADER').value = '';
		document.getElementById('APP_FILE_LOADER').files = null;
		document.getElementById('APP_FILE_LOADER').accept = ext;
		document.getElementById('APP_FILE_LOADER').onchange = null;

		// Check if data was provided
		if (ext !== void 0 && typeof postAction === 'function'){

			// Check for extension
			if (ext === ''){
				ext = '*.*';
			}

			// Call load file popup and start reading
			document.getElementById('APP_FILE_LOADER').onchange = function(){
				postAction(APP.tools.fixPath(document.getElementById('APP_FILE_LOADER').files[0].path));
			}
			TMS.triggerClick('APP_FILE_LOADER');

		}

	},

	// Save file
	saveFile: function(data){

		// Variables
		var location,
			ext = data.ext,
			mode = data.mode,
			content = data.content,
			fileName = data.fileName,
			postAction = data.callback;

		// Fix extension
		if (ext === '' || typeof ext !== 'string'){
			ext = '*.*';
		}

		// Set file info and onchange event
		document.getElementById('APP_FILE_SAVE').accept = ext;
		document.getElementById('APP_FILE_SAVE').nwsaveas = fileName;
		document.getElementById('APP_FILE_SAVE').onchange = function(){

			// Get file location and check path
			location = document.getElementById('APP_FILE_SAVE').value;
			if (location.replace(fileName, '') !== ''){

				// Try writing file
				try {

					// Write file and execute postAction
					APP.fs.writeFileSync(location, content, mode);
					if (typeof postAction === 'function'){
						postAction(APP.tools.fixPath(location));
					}

				} catch (err) {
					throw new Error(err);
				}

			}

			// Reset DOM
			document.getElementById('APP_FILE_SAVE').value = '';
			document.getElementById('APP_FILE_SAVE').accept = '';

		}

		// Call save popup
		TMS.triggerClick('APP_FILE_SAVE');

	}

}