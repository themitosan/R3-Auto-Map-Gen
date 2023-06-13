/*
	R3 Auto Map Gen.
	graphics.js
*/

temp_GRAPHICS = {

	/*
		Variables
	*/
	zIndexMap: 10,
	addedMaps: {},
	addedLines: {},
	xFarestMap: '',
	distanceFactor: 20,
	addedMapHistory: [],
	enabledDragList: [],
	enableCanvasDrag: !1,
	skipUpdateGuiLabel: !1,
	disableCanvasBgColor: !0,

	/*
		Functions
	*/

	// Toggle hide top menu on quick-save
	togglehideTopMenu: function(){

		// Get data and save it on localstorage
		APP.options.hideTopMenu = document.getElementById('CHECKBOX_hideTopMenu').checked;
		localStorage.setItem('hideTopMenu', APP.options.hideTopMenu);
		
		// Display menu by default
		TMS.css('MENU_TOP', {'height': '30px'});

		// Check if game is running
		if (APP.gameHook.gameActive === !0){

			switch (APP.options.hideTopMenu){

				case !0:
					TMS.css('MENU_TOP', {'height': '0px'});
					TMS.css('MENU_TOP_BG', {'display': 'inline'});
					break;

				case !1:
					TMS.css('MENU_TOP', {'height': '30px'});
					TMS.css('MENU_TOP_BG', {'display': 'none'});
					break;

			}

		}

	},

	// Update canvas zoom
	updateCanvasZoom: function(){
		const cZoom = document.getElementById('OPTION_mapCanvasZoom').value;
		document.getElementById('LABEL_mapCanvasZoom').innerHTML = cZoom;
		TMS.css('APP_MAP_CANVAS', {'transform': `scale(${cZoom})`});
	},

	// Reset canvas zoom
	resetCanvasZoom: function(){
		document.getElementById('OPTION_mapCanvasZoom').value = 1;
		APP.graphics.updateCanvasZoom();
	},

	// Update current map label
	updateGuiLabel: function(){

		// Check if can update GUI labels
		if (this.skipUpdateGuiLabel === !1){

			var cMap = '',
				gameRunningStatus = '',
				canvasDragStatus = 'INACTIVE',
				lMapHistory = APP.gameHook.mapHistory[APP.gameHook.mapHistory.length - 1];

			// Reset top menu
			if (APP.options.hideTopMenu === !1){
				TMS.css('MENU_TOP', {'height': '30px'});
			}

			// Check if latest map exists and if game is running
			if (lMapHistory !== void 0 && APP.gameHook.gameActive === !0){
				cMap = `Map: ${lMapHistory}`;
				gameRunningStatus = ' - ';
			}

			// Check canvas drag status
			if (this.enableCanvasDrag === !0){
				canvasDragStatus = 'ACTIVE';
			}

			// Set label strings
			document.getElementById('LABEL_RE3_INFO_mapName').innerHTML = cMap;
			document.getElementById('LABEL_mapDragStatus').innerHTML = `${gameRunningStatus}Canvas drag is ${canvasDragStatus}`;

		}

	},

	// Display top message
	displayTopMsg: function(msg, timeout){

		// Set skip update label flag as true
		this.skipUpdateGuiLabel = !0;

		// Set GUI
		TMS.css('MENU_TOP', {'height': '30px'});

		// Set labels
		document.getElementById('LABEL_mapDragStatus').innerHTML = msg;
		document.getElementById('LABEL_RE3_INFO_mapName').innerHTML = '';

		// Reset skip label flag and update it after timeout
		setTimeout(function(){

			APP.graphics.skipUpdateGuiLabel = !1;
			APP.graphics.updateGuiLabel();

			// Check if need to hide top menu
			if (APP.options.hideTopMenu === !0 && APP.gameHook.gameActive === !0){
				TMS.css('MENU_TOP', {'height': '0px'});
			}

		}, timeout);

	},

	// Add room to map
	pushMap: function(mapName, parent){

		var canAdd = !0,
			mList = this.addedMaps,
			cMap = APP.gameHook.gameData.cMap,
			distanceFactor = this.distanceFactor;

		// Check if current map was added
		if (document.getElementById(`ROOM_${mapName}`) !== null){
			canAdd = !1;
		}

		// Check if current map name was provided
		if (mapName === void 0){
			canAdd = !1;
		}

		// Check if can add map
		if (canAdd === !0){

			// Reset map drag
			APP.graphics.enableCanvasDrag = !0;
			APP.graphics.toggleDragMapCanvas();

			// Default coords
			var posX = 50000,
				posY = 50050,
				mapExtraClass = [],
				isBioRandMod = document.getElementById('CHECKBOX_isBioRand').checked;

			// Get current game
			const cGame = APP.options.settingsData.currentGame;

			if (parent !== void 0){

				// Update parent door counts
				APP.graphics.addedMaps[parent].doors.push(mapName);

				// Get parent data
				var rect = TMS.getCoords(`ROOM_${parent}`);

				// Set default position
				posX = rect.L + (rect.W / 2);
				posY = rect.T;

				// Check if farest map was defined
				if (APP.graphics.xFarestMap === ''){
					APP.graphics.checkForMapDistances();
				}

			}

			// Check if is game start
			if (APP.database[cGame].rdt[mapName].gameStart === !0){
				mapExtraClass.push('GAME_START');
			}

			// Check if is game end
			if (APP.database[cGame].rdt[mapName].gameEnd === !0){
				mapExtraClass.push('GAME_END');
			}

			// Check if player can save on current map
			if (APP.database[cGame].rdt[mapName].canSave === !0){
				mapExtraClass.push('ROOM_CAN_SAVE');
			}

			// Check if current map have item box
			if (APP.database[cGame].rdt[mapName].haveIconBox === !0){
				mapExtraClass.push('ROOM_ITEM_BOX');
			}

			// Check if "is BioRand" mode is active
			if (isBioRandMod === !0){

				// Update BioRand objective
				if (parent !== void 0){
					APP.options.updateBioRandObjective(mapName, parent);
				} 

				// Check if reset objective flag is active
				if (APP.options.bioRandObjectives.reset === !0){

					// Check if map is loading and if needs to apply distance from previous segment
					if (APP.options.isMapLoading === !1 && APP.options.bioRandObjectives.applyDistance === !0){

						// Get farest map coords and update X pos.
						const fMap = TMS.getCoords(`ROOM_${APP.graphics.xFarestMap}`);
						APP.options.bioRandObjectives.applyDistance = null;
						posX = fMap.WL + (window.innerWidth / 2);

					}

					// Reset objective flags
					APP.options.bioRandObjectives.reset = !1;
					APP.options.bioRandObjectives.applyDistance = null;

				}

				// Check if current map is an objective
				if (APP.database[cGame].bioRandObjectives[mapName] !== void 0){
					mapExtraClass.push('BIORAND_OBJECTIVE');
				}

			}

			// Generate room html and append to canvas
			const mapTemp = `<div id="ROOM_${mapName}" title="[${mapName}]\n${APP.database[cGame].rdt[mapName].name}, ${APP.database[cGame].rdt[mapName].location}" class="DIV_ROOM ${mapExtraClass.toString().replace(',', ' ')}" style="z-index: ${APP.graphics.zIndexMap};top: ${posY}px;left: ${posX}px;">[${mapName}]<br>${APP.database[cGame].rdt[mapName].name}</div>`;
			TMS.append('APP_MAP_CANVAS', mapTemp);

			// Bump map z-index counter
			APP.graphics.zIndexMap++;

			// Push selected map to list
			APP.graphics.addedMaps[mapName] = {x: posX, y: posY, doors: []};

			/*
				If map file isn't loading and there's a map parent, check if spawn position is over any other map
				and check what is the farest one in X coord.
			*/
			if (APP.options.isMapLoading === !1 && parent !== void 0){
				APP.graphics.processMapColission(mapName, parent);
				APP.graphics.checkForMapDistances();
			} 

			// Enable drag
			APP.graphics.enableDrag(`ROOM_${mapName}`);

			// Push map to history
			this.addedMapHistory.push({mapName: mapName, parent: parent});			
			
		}

		// Push line
		APP.graphics.pushLine(parent, mapName);

		// Update labels
		this.updateGuiLabel();

	},

	// Check for map distances
	checkForMapDistances: function(){

		// Set variables
		var distance = 0,
			getMapCoords,
			selectedMap = '',
			mList = this.addedMaps;

		// Check if there's added maps
		if (Object.keys(mList).length !== 0){

			// Process map list and seek for the farest.
			Object.keys(mList).forEach(function(cMap){
				getMapCoords = TMS.getCoords(`ROOM_${cMap}`);
				if (getMapCoords.WL > distance){
					distance = getMapCoords.WL;
					selectedMap = cMap;
				}
			});

		}

		// Set selected map
		this.xFarestMap = selectedMap;

	},

	// Process map colisions
	processMapColission: function(mapTarget, parent){

		// Check if map was added
		if (this.addedMaps[mapTarget] !== void 0){

			// Define cycle counter
			var cycles = 0,
				pointPos = 0,
				point_factor = 0,
				cGame = APP.options.settingsData.currentGame,
				distanceFactor = APP.graphics.distanceFactor;

			// Calc point factor
			const calcPointFactor = function(val){
				var res = (val * point_factor);
				if (res === 0){
					res = val;
				}
				return res;
			} 

			// Process
			const runProcess = function(){

				// Bump cycle counter
				cycles++;

				// Set reset flag
				var reRun = !1;

				// Start processing
				Object.keys(APP.graphics.addedMaps).forEach(function(cMap){

					// Exclude current map from processing
					if (cMap !== mapTarget){

						// Adjust point factors
						if (pointPos > 11){
							pointPos = 0;
							point_factor++;
						}

						/*
							Define some vars to make easy to read
						*/
						var c_checks = [],
							d_factor = (distanceFactor - 1),
							
							cMapCoords = TMS.getCoords(`ROOM_${cMap}`),
							parentCoords = TMS.getCoords(`ROOM_${parent}`),
							targetCoords = TMS.getCoords(`ROOM_${mapTarget}`);

						/*
							Push conditions to check array
						*/
						c_checks.push(targetCoords.WL > (cMapCoords.L - d_factor)); // If mapTarget left pos. + it's size is higher than cMap left (minus factor)
						c_checks.push(targetCoords.L < (cMapCoords.WL + d_factor)); // If mapTarget left pos. is lower than cMap left + it's size (plus factor)
						c_checks.push(targetCoords.TH > (cMapCoords.T - d_factor)); // If mapTarget top pos. + it's size is higher than cMap top pos. (minus factor)
						c_checks.push(targetCoords.T < (cMapCoords.TH + d_factor)); // If mapTarget top pos. is lower than cMap top pos. + it's own size (plus factor)

						// Check if needs to update mapTarget pos.
						if (c_checks.indexOf(!1) === -1){

							/*
								Seek next free location

							 8  9_____2_____10 11
								|			 |
							 3  |   [R100]   | 0
								|____________|
							 7  6     1      5 4

							  Info: 0, 3, and 9 will be skipped after first circle is completed
							*/
							switch (pointPos){

								case 0:
									if (point_factor === 0){
										TMS.css(`ROOM_${mapTarget}`, {
											'top': `${parentCoords.T}px`,
											'left': `${APP.tools.parsePositive((parentCoords.WL + distanceFactor) + (targetCoords.W * point_factor))}px`
										});
									}
									break;

								case 1:
									if (point_factor === 0){
										TMS.css(`ROOM_${mapTarget}`, {
											'top': `${APP.tools.parsePositive((parentCoords.TH + distanceFactor) + (targetCoords.H * point_factor))}px`,
											'left': `${APP.tools.parsePositive(parentCoords.WL - (parentCoords.W / 2) - (targetCoords.W / 2))}px`
										});
									}
									break;

								case 2:
									if (point_factor === 0){
										TMS.css(`ROOM_${mapTarget}`, {
											'top': `${APP.tools.parsePositive((parentCoords.T - distanceFactor) - calcPointFactor(targetCoords.H))}px`,
											'left': `${APP.tools.parsePositive(parentCoords.WL - (parentCoords.W / 2) - (targetCoords.W / 2))}px`
										});
									}
									break;

								case 3:
									if (point_factor === 0){
										TMS.css(`ROOM_${mapTarget}`, {
											'top': `${parentCoords.T}px`,
											'left': `${APP.tools.parsePositive((parentCoords.L - distanceFactor) - calcPointFactor(targetCoords.W))}px`
										});
									}
									break;

								case 4:
									TMS.css(`ROOM_${mapTarget}`, {
										'top': `${APP.tools.parsePositive((parentCoords.TH + distanceFactor) + (targetCoords.H * point_factor))}px`,
										'left': `${APP.tools.parsePositive((parentCoords.WL + distanceFactor) + (targetCoords.W * point_factor))}px`
									});
									break;

								case 5:
									TMS.css(`ROOM_${mapTarget}`, {
										'top': `${APP.tools.parsePositive((parentCoords.TH + distanceFactor) + (targetCoords.H * point_factor))}px`,
										'left': `${APP.tools.parsePositive((parentCoords.WL + distanceFactor) - calcPointFactor(targetCoords.W / 2))}px`
									});
									break;

								case 6:
									TMS.css(`ROOM_${mapTarget}`, {
										'top': `${APP.tools.parsePositive((parentCoords.TH + distanceFactor) + (targetCoords.H * point_factor))}px`,
										'left': `${APP.tools.parsePositive((parentCoords.L - distanceFactor) - calcPointFactor(targetCoords.W / 2))}px`
									});
									break;

								case 7:
									TMS.css(`ROOM_${mapTarget}`, {
										'top': `${APP.tools.parsePositive((parentCoords.TH + distanceFactor) + (targetCoords.H * point_factor))}px`,
										'left': `${APP.tools.parsePositive((parentCoords.L - distanceFactor) - calcPointFactor(targetCoords.W))}px`
									});
									break;

								case 8:
									TMS.css(`ROOM_${mapTarget}`, {
										'top': `${APP.tools.parsePositive((parentCoords.T - distanceFactor) - calcPointFactor(targetCoords.H))}px`,
										'left': `${APP.tools.parsePositive((parentCoords.L - distanceFactor) - calcPointFactor(targetCoords.W))}px`
									});
									break;

								case 9:
									TMS.css(`ROOM_${mapTarget}`, {
										'top': `${APP.tools.parsePositive((parentCoords.T - distanceFactor) - calcPointFactor(targetCoords.H))}px`,
										'left': `${APP.tools.parsePositive((parentCoords.L - distanceFactor) - calcPointFactor(targetCoords.W / 2))}px`
									});
									break;

								case 10:
									TMS.css(`ROOM_${mapTarget}`, {
										'top': `${APP.tools.parsePositive((parentCoords.T - distanceFactor) - calcPointFactor(targetCoords.H))}px`,
										'left': `${APP.tools.parsePositive((parentCoords.WL + distanceFactor) - calcPointFactor(targetCoords.W / 2))}px`
									});
									break;

								case 11:
									TMS.css(`ROOM_${mapTarget}`, {
										'top': `${APP.tools.parsePositive((parentCoords.T - distanceFactor) - calcPointFactor(targetCoords.H))}px`,
										'left': `${APP.tools.parsePositive((parentCoords.WL + distanceFactor) + (targetCoords.W * point_factor))}px`
									});
									break;

							}

							// Set run flag active
							reRun = !0;
							pointPos++;

						}

					}

				});

				// Check if need to run process again
				if (reRun === !0){
					runProcess();
				}

			}

			// Start process
			runProcess();

			// Log adittion
			console.info(`INFO - Map ${mapTarget} [${APP.database[cGame].rdt[mapTarget].name}] colissions was processed comparing with ${Object.keys(APP.graphics.addedMaps).length} maps.`);

		}

	},

	// Create line
	pushLine: function(parent, newMap){

		// Declare variables
		var canAdd = !0,
			connectedLines,
			reverseConnection,
			lineList = this.addedLines,
			lineNames = [
				`${parent}_${newMap}`,
				`${newMap}_${parent}`
			];

		// Check if can add new lines to canvas
		lineNames.forEach(function(lNames){
			if (lineList[lNames] !== void 0){
				canAdd = !1;
			}
		});
		if (parent === void 0){
			canAdd = !1;
		}

		if (canAdd === !0){

			var pData = TMS.getRect(`ROOM_${parent}`),
				nData = TMS.getRect(`ROOM_${newMap}`),
				canvasData = TMS.getRect('APP_MAP_CANVAS'),
				x1 = (pData.x + parseFloat(pData.width / 2)) - canvasData.x,
				y1 = (pData.y + parseFloat(pData.height / 2)) - canvasData.y,
				x2 = (nData.x + parseFloat(nData.width / 2)) - canvasData.x,
				y2 = (nData.y + parseFloat(nData.height / 2)) - canvasData.y;

			// Create HTML and render new lines
			lineNames.forEach(function(lName){

				const tempLine = `<svg id="${lName}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff"/></svg>`;
				TMS.append('APP_MAP_CANVAS', tempLine);

			});

			// Push to list
			APP.graphics.addedLines[`${parent}_${newMap}`] = { p: parent, n: newMap };
			APP.graphics.addedLines[`${newMap}_${parent}`] = { p: newMap, n: parent };

		}

		// Check if load map process isn't running
		if (APP.options.isMapLoading === !1){

			// Update current lines
			Array.from(document.getElementsByClassName('SVG_CURRENT_FLOW')).forEach(function(cElement){
				TMS.removeClass(cElement.id, 'SVG_CURRENT_FLOW');
			});

			// Add connection animation to current line and set backwards connection id
			TMS.addClass(`${parent}_${newMap}`, 'SVG_CURRENT_FLOW');
			reverseConnection = `${newMap}_${parent}`;

			// Display only current line with animation
			connectedLines = Object.keys(lineList).filter(function(cLine){
				if (cLine.indexOf(newMap) !== -1){
					TMS.css(cLine, {'opacity': '1'});
				}
			});
			TMS.css(reverseConnection, {'opacity': '0'});

			// Update line after render
			APP.graphics.updateLines(`ROOM_${newMap}`);

		}

	},

	// Enable drag element
	enableDrag: function(domName){

		// Variables
		var dList = this.enabledDragList,
			pos1 = pos2 = pos3 = pos4 = 0,
			elmnt = document.getElementById(domName);

		// Process drag event
		function dragElement(evt){
			evt = evt || window.event;
			evt.preventDefault();
			pos1 = (pos3 - evt.clientX);
			pos2 = (pos4 - evt.clientY);
			pos3 = evt.clientX;
			pos4 = evt.clientY;
			finalX = (elmnt.offsetLeft - pos1);
			finalY = (elmnt.offsetTop - pos2);

			// Update CSS
			TMS.css(domName, {'top': `${finalY}px`, 'left': `${finalX}px`});

			// Update Lines
			if (domName !== 'APP_MAP_CANVAS'){
				APP.graphics.updateLines(domName);
			}

		}

		// Stop drag event
		function stopDrag(){
			document.onmouseup = null;
			document.onmousemove = null;
		}

		// On mouse down
		function dragMouseDown(evt){
			evt = evt || window.event;
			evt.preventDefault();
			pos3 = evt.clientX;
			pos4 = evt.clientY;
			document.onmouseup = stopDrag;
			document.onmousemove = dragElement;
		}

		// Check if can enable drag
		if (dList.indexOf(domName) === -1 && elmnt !== null){
			document.getElementById(domName).onmousedown = dragMouseDown;
			APP.graphics.enabledDragList.push(domName);
		}

	},

	// Update lines
	updateLines: function(roomName){

		const lineList = this.addedLines;

		if (Object.keys(lineList).length !== 0){

			// Get default connected lines
			var processList = Object.keys(lineList);

			// Check if room name was provided. If so, update only connected lines
			if (roomName !== void 0){
				processList = Object.keys(lineList).filter(function(cLine){
					if (cLine.indexOf(roomName.replace('ROOM_', '')) !== -1){
						return cLine;
					}
				});
			}

			// Process lines
			processList.forEach(function(cLine){

				// Set variables
				var canvasData = TMS.getRect('APP_MAP_CANVAS'),
					pData = TMS.getRect(`ROOM_${lineList[cLine].p}`),
					nData = TMS.getRect(`ROOM_${lineList[cLine].n}`),
					x1 = (pData.x + parseFloat(pData.width / 2)) - canvasData.x,
					y1 = (pData.y + parseFloat(pData.height / 2)) - canvasData.y,
					x2 = (nData.x + parseFloat(nData.width / 2)) - canvasData.x,
					y2 = (nData.y + parseFloat(nData.height / 2)) - canvasData.y;

				// Update line
				document.getElementById(cLine).innerHTML = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff"/>`;

			});

		}

	},

	// Update player position
	updatePlayerPos: function(){

		// Check if player map history
		if (APP.gameHook.mapHistory.length !== 0){

			Object.keys(this.addedMaps).forEach(function(cMap){
				TMS.removeClass(`ROOM_${cMap}`, 'PLAYER_PRESENT');
			});

			const newRoomId = `ROOM_${APP.gameHook.mapHistory.slice(-1)}`;

			// Add class
			TMS.addClass(newRoomId, 'PLAYER_PRESENT');

			const menuRightPos = TMS.getRect('MENU_RIGHT'),
				playerRect = TMS.getRect(newRoomId),
				roomData = {
					x: parseFloat(TMS.getCssData(newRoomId, 'left').replace('px', '')),
					y: parseFloat(TMS.getCssData(newRoomId, 'top').replace('px', ''))
				},

				// Calc new pos.
				nextX = parseFloat(roomData.x - (((window.innerWidth / 2) - playerRect.width / 2) - menuRightPos.width / 2)),
				nextY = parseFloat(roomData.y - ((window.innerHeight / 2) - playerRect.height / 2));

			// Update canvas position
			TMS.css('APP_MAP_CANVAS', {'left': `${APP.tools.parsePolarity(nextX)}px`, 'top': `${APP.tools.parsePolarity(nextY)}px`});

		}

	},

	// Toggle drag map
	toggleDragMapCanvas: function(){

		// Declare vars
		const pos = APP.graphics.enabledDragList.indexOf('APP_MAP_CANVAS');

		// Check enable canvas drag
		switch (APP.graphics.enableCanvasDrag){

			case !1:
				TMS.css('APP_MAP_CANVAS', {'cursor': 'move', 'transition-duration': '0s'});
				APP.graphics.enableDrag('APP_MAP_CANVAS');
				APP.graphics.enableCanvasDrag = !0;
				break;

			case !0:
				TMS.css('APP_MAP_CANVAS', {'cursor': 'auto', 'transition-duration': '1s'});
				document.getElementById('APP_MAP_CANVAS').onmousedown = null;
				if (pos !== -1){
					APP.graphics.enabledDragList.splice(pos, 1);
				}
				APP.graphics.enableCanvasDrag = !1;
				break;

		}

		// Update labels
		this.updateGuiLabel();

	},

	// Toggle canvas bg color
	toggleBgColor: function(){

		switch (this.disableCanvasBgColor){

			// Enable background color
			case !0:
				TMS.css('APP_MAP_CANVAS', {'background-color': '#0000'});
				TMS.css('MENU_TOP_BG', {'background-color': '#0000'});
				APP.graphics.disableCanvasBgColor = !1;
				break;

			// Disable background color
			case !1:
				TMS.css('APP_MAP_CANVAS', {'background-color': '#200'});
				TMS.css('MENU_TOP_BG', {'background-color': '#200'});
				APP.graphics.disableCanvasBgColor = !0;
				break;

		}

	},

	// Get bg color
	pickGradientColor: function(colorPos){

		// Check if data was provided
		if (colorPos !== void 0){

			var cColor,
				colorIndex = 0;

			// Get current color
			if (colorPos === 'bottom'){
				colorIndex++;
			}
			cColor = APP.options.settingsData.bgGradientColor[colorIndex];

			// Prompt new color
			APP.tools.callColorPicker({
				title: `Change ${colorPos} color`,
				location: {
					x: 'calc(100% - 422px)',
					spawnLocation: 'APP_CANVAS',
					y: `${TMS.getCoords(`BTN_PICK_BG_COLOR_${colorPos.toUpperCase()}`).T}px`
				},
				color: cColor,
				outputMode: 'hex',
				onOpen: function(){

					// Disable select colors gradient buttons
					document.getElementById('BTN_PICK_BG_COLOR_TOP').disabled = 'disabled';
					document.getElementById('BTN_PICK_BG_COLOR_BOTTOM').disabled = 'disabled';

				},
				onCancel: function(){

					// Enable select color gradient buttons
					document.getElementById('BTN_PICK_BG_COLOR_TOP').disabled = '';
					document.getElementById('BTN_PICK_BG_COLOR_BOTTOM').disabled = '';

				},
				onApply: function(newColor){
					
					// Update color
					APP.options.settingsData.bgGradientColor[colorIndex] = `#${newColor}`;

					// Save settings
					APP.options.saveSettings();

					// Update GUI
					APP.graphics.updateBgColor();

					// Enable select color gradient buttons
					document.getElementById('BTN_PICK_BG_COLOR_TOP').disabled = '';
					document.getElementById('BTN_PICK_BG_COLOR_BOTTOM').disabled = '';

				}
			});

		}

	},

	// Update BG color
	updateBgColor: function(){

		// Get colors array
		const bgColors = APP.options.settingsData.bgGradientColor;

		// Update preview icons
		TMS.css('DIV_ICON_PREVIEW_BG_COLOR_TOP', {'background-color': bgColors[0]});
		TMS.css('DIV_ICON_PREVIEW_BG_COLOR_BOTTOM', {'background-color': bgColors[1]});

		// Update gradient
		TMS.css('APP_CANVAS', {'background-image': `linear-gradient(180deg, ${bgColors[0]}, ${bgColors[1]})`});

	}

}