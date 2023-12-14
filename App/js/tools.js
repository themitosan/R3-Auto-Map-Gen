/*
	R3 Auto Map Gen.
	tools.js
*/

temp_TOOLS = {

	// Solve Hex
	solveHex: function(hex){
		var res = '';
		if (hex !== void 0){
			res = hex.toLowerCase().replace(RegExp(' ', 'gi'), '');
		}
		return res;
	},

	// Unsolve Hex
	unsolveHex: function(hex){
		var res = '';
		if (hex !== void 0){
			res = hex.toUpperCase().match(/.{2,2}/g).toString().replace(RegExp(',', 'gi'), ' ')
		}
		return res;
	},

	// Parse endian values
	parseEndian: function(hex){

		if (hex !== void 0){
			return hex.match(/.{2,2}/g).reverse().toString().replace(RegExp(',', 'gi'), '');
		}

	},

	// Convert Hex values to UTF-8 string
	convertHexToUft8: function(hex){

		var textValue = '';
		if (hex !== void 0 && hex !== ''){
			textValue = decodeURIComponent('%' + hex.match(/.{2,2}/g).join('%'));
		}

		return textValue;

	},

	// Parse percentage
	parsePercentage: function(current, maximum){

		var res = 0;
		if (current !== void 0 && maximum !== void 0){
			res = Math.floor((current / maximum) * 100);
		}

		return res;

	},

	// Parse positive
	parsePositive: function(value){

		var res = 0;

		if (value !== void 0 && parseFloat(value) !== NaN){
			const n = parseFloat(value);
			res = ((n - n) - n);
			if (res < 0){
				res = ((res - res) - res);
			}
		}

		return res;

	},

	// Parse negative
	parseNegative: function(value){

		var res = 0;

		if (value !== void 0 && parseFloat(value) !== NaN){
			const n = parseFloat(value);
			res = ((n - n) - n);
			if (res > -1){
				res = ((res - res) - res);
			}
		}

		return res;

	},

	// Fix paths
	fixPath: function(path){
		var res = '';
		if (path !== void 0 && path !== ''){
			res = path.replace(RegExp('\\\\', 'gi'), '/');
		}
		return res;
	},

	/*
		Remove HTML from string
		Original regex: https://css-tricks.com/snippets/javascript/strip-html-tags-in-javascript/
	*/
	removeHTML: function(str){
		if (str !== void 0 && str !== ''){
			return str.replace(/(<([^>]+)>)/gi, '');
		}
	},

	// Get data from main object (APP - main.js)
	getVariable: function(str){
		if (str !== void 0 && str !== ''){

			var res = APP,
				temp = str.split('.').forEach(function(objPath){
					res = res[objPath];
				});

			return res;

		}
	},

	// Set data on main object (APP - main.js)
	setVariable: function(target, data, callback){

		try {

			if (target !== void 0 && target !== ''){

				var i,
					temp = APP,
					path = target.split('.');

				for (i = 0; i < (path.length - 1); i++){
					temp = temp[path[i]];
				}

				temp[path[i]] = data;

			}

		} catch (err) {
			console.error(err);
		}
	},

	// Convert array to string breaking lines
	convertArrayToString: function(str){
		var res = '';
		if (str !== void 0 && str.length !== 0){
			res = str.toString().replace(RegExp(',', 'gi'), '\n');
		}
		return res;
	},

	// Remove values from string
	cleanString: function(str, arr){

		var res = '';

		if (str !== void 0 && arr !== void 0){
			res = str;
			arr.forEach(function(rep){
				res = res.replace(RegExp(rep, 'gi'), '');
			});
		}

		return res;

	},

	/*
		Fix vars
		This function was obtained from R3V2 API

		https://github.com/themitosan/R3ditor-v2
	*/
	fixVars: function(inp, v, filler){

		var c = 0,
			size = Number(v),
			input = inp.toString();

		if (filler === void 0){
			filler = '0';
		}

		if (inp === void 0 || inp === ''){
			input = filler + filler;
		}
		if (v === void 0 || v === ''){
			size = 2;
		}

		if (input.length < size){

			while (input.length !== size){
				input = filler + input;
			}

		} else {

			if (input.length !== size && input.toString().length > size){
				input = input.slice(0, v);
			}

		}

		return input;

	},

	// Fix JSON quotes
	fixJson: function(data){

		var res = '';

		if (data !== void 0){
			res = data.replace(RegExp("'", 'gi'), '"');
		}

		return res;

	},

	// Clean function
	cleanFn: function(fnStr){

		var res = '';

		if (fnStr !== void 0){
			res = fnStr.replace(RegExp('\n', 'gi'), ' ').replace(RegExp('	', 'gi'), '');
		}

		return res;

	},

	// Prompt - a simple way to handle window.prompt call
	prompt: function(msg){

		return new Promise(function(resolve, reject){

			var res,
				canStart = !0,
				errorReason = '';

			if (msg === '' || msg === void 0){
				canStart = !1;
				errorReason = 'Provided message is empty';
			} else {
				res = window.prompt(msg);
			}

			if (res === null){
				canStart = !1;
				errorReason = 'User canceled action';
			}

			if (res === ''){
				canStart = !1;
				errorReason = 'User didn\'t provided any data on textbox';
			}

			if (canStart === !0){
				resolve(res);
			} else {
				reject(errorReason);
			}

		});

	},

	// Confirm - a simple way to handle window.confirm call
	confirm: function(msg){

		return new Promise(function(resolve, reject){

			var res,
				canStart = !0,
				errorReason = '';

			if (msg === '' || msg === void 0){
				canStart = !1;
				errorReason = 'Provided message is empty';
			} else {
				res = window.confirm(msg);
			}

			if (res === !1){
				canStart = !1;
				errorReason = 'User canceled action';
			}

			if (canStart === !0){
				resolve(res);
			} else {
				reject(errorReason);
			}

		});

	},

	// Get all files from dir / subdir (require node.js) 
	getDirFiles: function(dir){

		// Variables
	    var res = [],
	    	fixPath = this.fixPath;

	    // Main process
	    const gFileProcess = function(path){

	    	/*
	    		Require modules individually.
	    		They will not be linked to main object due compat with other softwares
	    	*/
	    	const module_fs = require('fs'),
	    		module_path = require('path');

	    	// Read dir
	    	module_fs.readdirSync(fixPath(path)).forEach(function(cFile){

			    var ret,
			    	abs = module_path.join(path, cFile);

			    if (module_fs.statSync(abs).isDirectory()){
			        ret = gFileProcess(abs);
			    } else {
			        ret = res.push(fixPath(abs));
			    }

				return ret;

			});

	    }

	    // Run process
	    gFileProcess(dir);

	    // End
	    return res;

	},

	// Check online status
	checkOnlineStatus: async function(url){

		try {

			if (url === void 0 || url === ''){
				url = 'https://google.com/';
			}

			var fetchTest = await fetch(url);
			return Number(fetchTest.status) > 199 && Number(fetchTest.status) < 300;

		} catch (err){
			return !1;
		}

	},

	// Parse value polarity
	parsePolarity: function(value){

		var res = 0;

		if (res !== void 0){
			res = value - value - value;
		}

		return res;
	},

	// Process checkbox status
	processCheckbox: function(domName, callback){

		var res = !1,
		    domId = document.getElementById(domName).checked;

		if (domId === !1){
			res = !0;
		}

		document.getElementById(domName).checked = res;

		if (typeof callback === 'function'){
			callback();
		}

	},

	/*
		 Fix DOM number

		 data: Object
		 	domName: 	String - DOM ID name
		 	def: 		Number - Default number if data is invalid
		 	min: 		Number - Default number if data is lower than allowed
		 	max: 		Number - Default number if data is higher than allowed
		 	maxLength 	Number - Max characters allowed on input field
	*/
	fixDomNumber: function(data){

		if (typeof data === 'object' && document.getElementById(data.domName) !== null){

			const cValue = Number(document.getElementById(data.domName).value);
		
			if (data.maxLength === void 0){
				data.maxLength = document.getElementById(data.domName).value.length;
			}

			if (cValue === NaN){
				document.getElementById(data.domName).value = Number(data.def);
			}
			if (cValue < data.min){
				document.getElementById(data.domName).value = Number(data.min);
			}
			if (cValue > data.max){
				document.getElementById(data.domName).value = Number(data.max);
			}
			if (document.getElementById(data.domName).value.length > data.maxLength){
				document.getElementById(data.domName).value = document.getElementById(data.domName).value.slice(0, data.maxLength);
			}

		}

	},

	/*
		TMS Color Picker

		data: Object

			location: 			Object - Define where it should spawn
				spawnLocation: 	String - DOM ID of where it should spawn
				x: 				Number - X Coords of where it should spawn
				y: 				Number - Y Coords of where it should spawn

			title 				String 	 - Text to be displayed at top
			outputMode: 		String 	 - Select how it will output data ['rgb' or 'hex']
			color: 				String 	 - Display current color on preview [hex: 00FF00 rgb: rgb(0 255 0)]
			onOpen: 			Function - Action after Color picker is spawned
			onCancel: 			Function - Action if user cancel
			onApply: 			Function - Action if user apply
	*/
	callColorPicker: function(data){

		if (typeof data === 'object'){

			// Process error reason
			var errorReason = [];
			const addError = function(msg){
				errorReason.push(msg);
			}

			if (data.title === void 0){
				data.title = '';
			}

			// Check if user added location
			if (typeof data.location !== 'object'){
				addError('User didn\'t specified spawn location data');
			}

			// Check if apply action was provided
			if (typeof data.onApply !== 'function'){
				addError('User didn\'t specified onApply action');
			}

			// Check if color picker is already active
			if (document.getElementById('TMS_COLOR_PICKER') !== null){
				addError('Color picker is already opened!');
			}

			// Check if spawn location exists
			if (document.getElementById(data.location.spawnLocation) === null){
				addError('Unable to locate spawn location!');
			}

			// Check if can continue
			if (errorReason.length === 0){

				// Set variables
				var updateMode = 'number',
					xPos = data.location.x,
					yPos = data.location.y,
					htmlData = APP.fs.readFileSync(`${nw.__dirname}/${APP.pathPrefix}/tools/color-picker.htm`, 'utf8');

				if (typeof data.location.x !== 'string'){
					xPos = '10px';
				}
				if (typeof data.location.y !== 'string'){
					yPos = '10px';
				}
				if (typeof data.outputMode === void 0){
					data.outputMode = 'hex';
				}

				// Append form
				TMS.append(data.location.spawnLocation, htmlData);
				TMS.css('TMS_COLOR_PICKER', {'top': `${yPos}`, 'left': `${xPos}`});

				// Update title
				if (data.title !== ''){
					document.getElementById('DIV_TMS_COLOR_PICKER_TOP_LABEL').innerHTML = data.title;
					TMS.css('DIV_TMS_COLOR_PICKER_TOP_LABEL', {'display': 'block'});
				}

				// Set input data
				switch (data.outputMode.toLowerCase()){

					// TODO: Fix alpha
					case 'rgb':
						const colors = data.color.replace('rgb(', '').replace(')').split(' ');
						document.getElementById('TMS_COLOR_PICKER_NUMBER_R').value = Number(colors[0]);
						document.getElementById('TMS_COLOR_PICKER_NUMBER_G').value = Number(colors[1]);
						document.getElementById('TMS_COLOR_PICKER_NUMBER_B').value = Number(colors[2]);
						break;

					case 'hex':
						var dataColor = data.color.replace(RegExp('#', 'gi'), '');
						if (dataColor.length === 6){
							dataColor = dataColor + 'ff';
						}
						document.getElementById('TMS_COLOR_PICKER_HEX').value = dataColor;
						updateMode = 'hex';
						break;

				}

				// Set cancel action
				document.getElementById('BTN_TMS_COLOR_PICKER_CANCEL').onclick = function(){
					
					// Remove color picker
					TMS.removeDOM('TMS_COLOR_PICKER');

					// Execute onCancel action
					if (typeof data.onCancel === 'function'){
						data.onCancel();
					}

				}

				// Set onApply action
				document.getElementById('BTN_TMS_COLOR_PICKER_APPLY').onclick = function(){

					// Get variables
					var colorR = Number(document.getElementById('TMS_COLOR_PICKER_NUMBER_R').value),
						colorG = Number(document.getElementById('TMS_COLOR_PICKER_NUMBER_G').value),
						colorB = Number(document.getElementById('TMS_COLOR_PICKER_NUMBER_B').value),
						colorA = Number(document.getElementById('TMS_COLOR_PICKER_NUMBER_A').value),
						colorHex = document.getElementById('TMS_COLOR_PICKER_HEX').value,
						colorData = '';

					// Check input
					if (colorHex.length !== 8 || colorHex === ''){
						colorHex = `#${APP.tools.fixVars(parseInt(colorR, 16))}${APP.tools.fixVars(parseInt(colorG, 16))}${APP.tools.fixVars(parseInt(colorB, 16))}${APP.tools.fixVars(parseInt(colorA, 16))}`;
					}

					switch(data.outputMode.toLowerCase()){

						case 'rgb':
							colorData = `rgb(${colorR} ${colorG} ${colorB} / ${APP.tools.parsePercentage(colorA, 255)})`;
							break;

						case 'hex':
							colorData = colorHex.toUpperCase();
							break;
					
					}

					// Output value
					data.onApply(colorData);

					// Remove color picker
					TMS.removeDOM('TMS_COLOR_PICKER');

				}

				// Update color
				APP.tools.updateColorPicker(updateMode);

				// Execute onOpen action
				if (typeof data.onOpen === 'function'){
					data.onOpen();
				}

			} else {
				const errMsg = `ERROR - Unable to open color picker!\nReason: ${errorReason.toString().replace(RegExp(',', 'gi'), '\n')}`;
				console.error(errMsg);
				window.alert(errMsg);
			}

		}

	},

	// Update selected color
	updateColorPicker: function(inputSource){

		if (document.getElementById('TMS_COLOR_PICKER') !== null){

			if (typeof inputSource !== 'string'){
				inputSource = 'hex';
			}

			var colorR,	colorG,	colorB, colorA,
				bgColor = '000';

			switch (inputSource){

				case 'number':
					
					// Fix input field
					APP.tools.fixDomNumber({ def: 0, min: 0, max: 255, maxLength: 3, domName: 'TMS_COLOR_PICKER_NUMBER_R' });
					APP.tools.fixDomNumber({ def: 0, min: 0, max: 255, maxLength: 3, domName: 'TMS_COLOR_PICKER_NUMBER_G' });
					APP.tools.fixDomNumber({ def: 0, min: 0, max: 255, maxLength: 3, domName: 'TMS_COLOR_PICKER_NUMBER_B' });
					APP.tools.fixDomNumber({ def: 0, min: 0, max: 255, maxLength: 3, domName: 'TMS_COLOR_PICKER_NUMBER_A' });

					colorR = Number(document.getElementById('TMS_COLOR_PICKER_NUMBER_R').value);
					colorG = Number(document.getElementById('TMS_COLOR_PICKER_NUMBER_G').value);
					colorB = Number(document.getElementById('TMS_COLOR_PICKER_NUMBER_B').value);
					colorA = Number(document.getElementById('TMS_COLOR_PICKER_NUMBER_A').value);
					document.getElementById('TMS_COLOR_PICKER_RANGE_R').value = colorR;
					document.getElementById('TMS_COLOR_PICKER_RANGE_G').value = colorG;
					document.getElementById('TMS_COLOR_PICKER_RANGE_B').value = colorB;
					document.getElementById('TMS_COLOR_PICKER_RANGE_A').value = colorA;
					bgColor = APP.tools.fixVars(colorR.toString(16)) + APP.tools.fixVars(colorG.toString(16)) + APP.tools.fixVars(colorB.toString(16)) + APP.tools.fixVars(colorA.toString(16));
					document.getElementById('TMS_COLOR_PICKER_HEX').value = bgColor;
					break;

				case 'range':
					colorR = Number(document.getElementById('TMS_COLOR_PICKER_RANGE_R').value);
					colorG = Number(document.getElementById('TMS_COLOR_PICKER_RANGE_G').value);
					colorB = Number(document.getElementById('TMS_COLOR_PICKER_RANGE_B').value);
					colorA = Number(document.getElementById('TMS_COLOR_PICKER_RANGE_A').value);
					document.getElementById('TMS_COLOR_PICKER_NUMBER_R').value = colorR;
					document.getElementById('TMS_COLOR_PICKER_NUMBER_G').value = colorG;
					document.getElementById('TMS_COLOR_PICKER_NUMBER_B').value = colorB;
					document.getElementById('TMS_COLOR_PICKER_NUMBER_A').value = colorA;
					bgColor = APP.tools.fixVars(colorR.toString(16)) + APP.tools.fixVars(colorG.toString(16)) + APP.tools.fixVars(colorB.toString(16)) + APP.tools.fixVars(colorA.toString(16));
					document.getElementById('TMS_COLOR_PICKER_HEX').value = bgColor;
					break;

				case 'hex':

					// Convert colors from hex to int
					var hexColors,
						rawData = document.getElementById('TMS_COLOR_PICKER_HEX').value.replace(RegExp('#', 'gi'), '');

					if (rawData.length === 8){

						hexColors = rawData.match(/.{2,2}/g);
						colorR = hexColors[0];
						colorG = hexColors[1];
						colorB = hexColors[2];
						colorA = hexColors[3];
						bgColor = rawData;

						document.getElementById('TMS_COLOR_PICKER_RANGE_R').value = parseInt(hexColors[0], 16);
						document.getElementById('TMS_COLOR_PICKER_RANGE_G').value = parseInt(hexColors[1], 16);
						document.getElementById('TMS_COLOR_PICKER_RANGE_B').value = parseInt(hexColors[2], 16);
						document.getElementById('TMS_COLOR_PICKER_RANGE_A').value = parseInt(hexColors[3], 16);
						document.getElementById('TMS_COLOR_PICKER_NUMBER_R').value = parseInt(hexColors[0], 16);
						document.getElementById('TMS_COLOR_PICKER_NUMBER_G').value = parseInt(hexColors[1], 16);
						document.getElementById('TMS_COLOR_PICKER_NUMBER_B').value = parseInt(hexColors[2], 16);
						document.getElementById('TMS_COLOR_PICKER_NUMBER_A').value = parseInt(hexColors[3], 16);

					}
					break;

			}

			// Update BG
			TMS.css('DIV_TMS_COLOR_PICKER_PREVIEW', {'background-color': `#${bgColor}`});

		}

	},

	// Cancel Color Picker
	closeColorPicker: function(){
		if (document.getElementById('TMS_COLOR_PICKER') !== null){
			TMS.triggerClick('BTN_TMS_COLOR_PICKER_CANCEL');
		}
	},

	// Create setTimeout function with more control
	createTimeout: function(name, action, timeout){

		// Check if timeout was provided
		if (timeout === void 0){
			timeout = 0;
		}

		// Check if current timeout exists on database
		if (APP.timeoutDatabase[name] !== void 0){
			clearTimeout(APP.timeoutDatabase[name]);
			delete APP.timeoutDatabase[name];
		}

		// Set timeout
		APP.timeoutDatabase[name] = setTimeout(function(){
			
			// Execute action
			if (typeof action === 'function'){
				action();
			}

			// Remove timeout from database
			delete APP.timeoutDatabase[name];

		}, Number(timeout));

	},

	/*
		Clear timeout
			timeoutList: 	String | Boolean 	Timeout name or list to be cleared
	*/
	clearTimeoutList: function(timeoutList){

		switch (typeof timeoutList){

			case 'string':
				if (APP.timeoutDatabase[timeoutList] !== void 0){
					clearTimeout(APP.timeoutDatabase[timeoutList]);
				}
				break;

			case 'object':
				timeoutList.forEach(function(cTimeout){
					if (APP.timeoutDatabase[cTimeout] !== void 0){
						clearTimeout(APP.timeoutDatabase[cTimeout]);
					}
				});
				break;

		}

	},

	// Create setInterval function with more control
	createInterval: function(name, action, interval){

		// Check if timeout was provided
		if (interval === void 0){
			interval = 1000;
		}

		// Check if current interval exists on database
		if (APP.intervalDatabase[name] !== void 0){
			clearInterval(APP.intervalDatabase[name]);
			delete APP.intervalDatabase[name];
		}

		// Set timeout
		APP.intervalDatabase[name] = setInterval(action, Number(interval));

	}

}