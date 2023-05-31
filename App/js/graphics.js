/*
	R3 Auto Map Gen.
	graphics.js
*/

temp_GRAPHICS = {

	/*
		Variables
	*/
	addedMaps: {},
	addedLines: {},
	distanceFactor: 20,
	addedMapHistory: [],
	enabledDragList: [],
	enableCanvasDrag: !1,
	disableCanvasBgColor: !0,

	/*
		Functions
	*/

	// Add room to map
	pushMap: function(mapName, parent){

		var canAdd = !0,
			mList = this.addedMaps,
			cMap = APP.gameHook.gameData.cMap;

		// Check if current map was added
		if (document.getElementById('ROOM_' + mapName) !== null){
			canAdd = !1;
		}

		if (canAdd === !0){

			// Default coords
			var posX = 50010,
				posY = 50050,
				mapExtraClass = [],
				distanceFactor = APP.graphics.distanceFactor,
				fontSizeFactor = APP.options.settingsData.fontSize,
				dPadding = (10 + fontSizeFactor),
				isBioRandMod = document.getElementById('CHECKBOX_isBioRand').checked;

			if (parent !== void 0){

				// Update parent door counts
				APP.graphics.addedMaps[parent].doors.push(mapName);

				// Get parent data
				var rect = TMS.getCoords('ROOM_' + parent);

				// Set default position
				posX = rect.L + (rect.W / 2);
				posY = rect.T;

			}

			// Change class depending on current map
			switch (mapName){

				// Game start
				case 'R10D':
					mapExtraClass.push('GAME_START');
					break;

				// Game end
				case 'R50E':
					mapExtraClass.push('GAME_END');
					break;

			}

			// Check if is save room
			if (APP.database.rdtNames[mapName].saveRoom === !0){
				mapExtraClass.push('SAVE_ROOM');
			}

			// Check if is BioRand mod and if current map is an objective
			if (isBioRandMod === !0 && APP.database.rdtNames[mapName].isBioRandObjective === !0){
				mapExtraClass.push('BIORAND_OBJECTIVE');
			}

			// Generate room html and append to canvas
			const mapTemp = '<div id="ROOM_' + mapName + '" title="[' + mapName + ']\n' + APP.database.rdtNames[mapName].name + ', ' + APP.database.rdtNames[mapName].location +
							'" class="DIV_ROOM ' + mapExtraClass.toString().replace(',', ' ') + '" style="top: ' + posY + 'px;left: ' + posX + 'px;">[' + mapName + ']<br>' + APP.database.rdtNames[mapName].name +
							'</div>';
			TMS.append('APP_MAP_CANVAS', mapTemp);

			// Push selected map to list
			APP.graphics.addedMaps[mapName] = {x: posX, y: posY, doors: []};

			// If map file isn't loading and there's a map parent, check if spawn position is over any other map
			if (APP.options.isMapLoading === !1 && parent !== void 0){
				APP.graphics.processMapColission(mapName, parent);
			} 

		}

		// Update labels
		const lMapHistory = APP.gameHook.mapHistory[APP.gameHook.mapHistory.length - 1];
		if (lMapHistory !== void 0){
			document.getElementById('LABEL_RE3_INFO_mapName').innerHTML = 'Map: ' + lMapHistory;
		}

		// Enable drag
		APP.graphics.enableDrag('ROOM_' + mapName);

		// Push history
		this.addedMapHistory.push({mapName: mapName, parent: parent});

		// Push line
		APP.graphics.pushLine(parent, mapName);

	},

	// Process map colisions
	processMapColission: function(mapTarget, parent){

		// Check if map was added
		if (this.addedMaps[mapTarget] !== void 0){

			// Define cycle counter
			var cycles = 0,
				pointPos = 0,
				point_factor = 0,
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
							
							cMapCoords = TMS.getCoords('ROOM_' + cMap),
							parentCoords = TMS.getCoords('ROOM_' + parent),
							targetCoords = TMS.getCoords('ROOM_' + mapTarget);

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

							  7 8___9__10 11
								|\	|  /|
							  6 |---O---| 0
								|/__|__\|
							  5 4   3   2 1
							*/
							switch (pointPos){

								case 0:
									TMS.css('ROOM_' + mapTarget, {
										'top': parentCoords.T + 'px',
										'left': APP.tools.parsePositive((parentCoords.WL + distanceFactor) + (targetCoords.W * point_factor)) + 'px'
									});
									break;

								case 1:
									TMS.css('ROOM_' + mapTarget, {
										'top': APP.tools.parsePositive((parentCoords.TH + distanceFactor) + (targetCoords.H * point_factor)) + 'px',
										'left': APP.tools.parsePositive((parentCoords.WL + distanceFactor) + (targetCoords.W * point_factor)) + 'px'
									});
									break;

								case 2:
									TMS.css('ROOM_' + mapTarget, {
										'top': APP.tools.parsePositive((parentCoords.TH + distanceFactor) + (targetCoords.H * point_factor)) + 'px',
										'left': APP.tools.parsePositive((parentCoords.WL + distanceFactor) - calcPointFactor(targetCoords.W / 2)) + 'px'
									});
									break;

								case 3:
									TMS.css('ROOM_' + mapTarget, {
										'top': APP.tools.parsePositive((parentCoords.TH + distanceFactor) + (targetCoords.H * point_factor)) + 'px',
										'left': APP.tools.parsePositive(parentCoords.WL - (parentCoords.W / 2) - (targetCoords.W / 2)) + 'px'
									});
									break;

								case 4:
									TMS.css('ROOM_' + mapTarget, {
										'top': APP.tools.parsePositive((parentCoords.TH + distanceFactor) + (targetCoords.H * point_factor)) + 'px',
										'left': APP.tools.parsePositive((parentCoords.L - distanceFactor) - calcPointFactor(targetCoords.W / 2)) + 'px'
									});
									break;

								case 5:
									TMS.css('ROOM_' + mapTarget, {
										'top': APP.tools.parsePositive((parentCoords.TH + distanceFactor) + (targetCoords.H * point_factor)) + 'px',
										'left': APP.tools.parsePositive((parentCoords.L - distanceFactor) - calcPointFactor(targetCoords.W)) + 'px'
									});
									break;

								case 6:
									TMS.css('ROOM_' + mapTarget, {
										'top': parentCoords.T + 'px',
										'left': APP.tools.parsePositive((parentCoords.L - distanceFactor) - calcPointFactor(targetCoords.W)) + 'px'
									});
									break;

								case 7:
									TMS.css('ROOM_' + mapTarget, {
										'top': APP.tools.parsePositive((parentCoords.T - distanceFactor) - calcPointFactor(targetCoords.H)) + 'px',
										'left': APP.tools.parsePositive((parentCoords.L - distanceFactor) - calcPointFactor(targetCoords.W)) + 'px'
									});
									break;

								case 8:
									TMS.css('ROOM_' + mapTarget, {
										'top': APP.tools.parsePositive((parentCoords.T - distanceFactor) - calcPointFactor(targetCoords.H)) + 'px',
										'left': APP.tools.parsePositive((parentCoords.L - distanceFactor) - calcPointFactor(targetCoords.W / 2)) + 'px'
									});
									break;

								case 9:
									TMS.css('ROOM_' + mapTarget, {
										'top': APP.tools.parsePositive((parentCoords.T - distanceFactor) - calcPointFactor(targetCoords.H)) + 'px',
										'left': APP.tools.parsePositive(parentCoords.WL - (parentCoords.W / 2) - (targetCoords.W / 2)) + 'px'
									});
									break;

								case 10:
									TMS.css('ROOM_' + mapTarget, {
										'top': APP.tools.parsePositive((parentCoords.T - distanceFactor) - calcPointFactor(targetCoords.H)) + 'px',
										'left': APP.tools.parsePositive((parentCoords.WL + distanceFactor) - calcPointFactor(targetCoords.W / 2)) + 'px'
									});
									break;

								case 11:
									TMS.css('ROOM_' + mapTarget, {
										'top': APP.tools.parsePositive((parentCoords.T - distanceFactor) - calcPointFactor(targetCoords.H)) + 'px',
										'left': APP.tools.parsePositive((parentCoords.WL + distanceFactor) + (targetCoords.W * point_factor)) + 'px'
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
			console.info('INFO - Map ' + mapTarget + ' [' + APP.database.rdtNames[mapTarget].name + '] colissions was processed comparing with ' + Object.keys(APP.graphics.addedMaps).length + ' maps.');;

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
				parent + '_' + newMap,
				newMap + '_' + parent
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

			var pData = TMS.getRect('ROOM_' + parent),
				nData = TMS.getRect('ROOM_' + newMap),
				canvasData = TMS.getRect('APP_MAP_CANVAS'),
				x1 = (pData.x + parseFloat(pData.width / 2)) - canvasData.x,
				y1 = (pData.y + parseFloat(pData.height / 2)) - canvasData.y,
				x2 = (nData.x + parseFloat(nData.width / 2)) - canvasData.x,
				y2 = (nData.y + parseFloat(nData.height / 2)) - canvasData.y;

			// Create HTML and render new lines
			lineNames.forEach(function(lName){
				const tempLine = '<svg id="' + lName + '"><line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#fff"/></svg>';
				TMS.append('APP_MAP_CANVAS', tempLine);
			});

			// Push to list
			APP.graphics.addedLines[parent + '_' + newMap] = { p: parent, n: newMap };
			APP.graphics.addedLines[newMap + '_' + parent] = { p: newMap, n: parent };

		}

		// Check if load map process isn't running
		if (APP.options.isMapLoading === !1){

			// Update current lines
			Array.from(document.getElementsByClassName('SVG_CURRENT_FLOW')).forEach(function(cElement){
				TMS.removeClass(cElement.id, 'SVG_CURRENT_FLOW');
			});

			// Add connection animation to current line and set backwards connection id
			TMS.addClass(parent + '_' + newMap, 'SVG_CURRENT_FLOW');
			reverseConnection = newMap + '_' + parent;

			// Display only current line with animation
			connectedLines = Object.keys(lineList).filter(function(cLine){
				if (cLine.indexOf(newMap) !== -1){
					TMS.css(cLine, {'opacity': '1'});
				}
			});
			TMS.css(reverseConnection, {'opacity': '0'});

			// Update line after render
			APP.graphics.updateLines('ROOM_' + newMap);

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
			TMS.css(domName, {'top': finalY + 'px', 'left': finalX + 'px'});

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
		if (dList.indexOf(domName) === -1){
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
					pData = TMS.getRect('ROOM_' + lineList[cLine].p),
					nData = TMS.getRect('ROOM_' + lineList[cLine].n),
					x1 = (pData.x + parseFloat(pData.width / 2)) - canvasData.x,
					y1 = (pData.y + parseFloat(pData.height / 2)) - canvasData.y,
					x2 = (nData.x + parseFloat(nData.width / 2)) - canvasData.x,
					y2 = (nData.y + parseFloat(nData.height / 2)) - canvasData.y;

				// Update line
				document.getElementById(cLine).innerHTML = '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#fff"/>';

			});

		}

	},

	// Update player position
	updatePlayerPos: function(){

		// Check if player map history
		if (APP.gameHook.mapHistory.length !== 0){

			Object.keys(this.addedMaps).forEach(function(cMap){
				TMS.removeClass('ROOM_' + cMap, 'PLAYER_PRESENT');
			});
	
			const newRoomId = 'ROOM_' + APP.gameHook.mapHistory.slice(-1);
	
			// Add class
			TMS.addClass(newRoomId, 'PLAYER_PRESENT');
	
			var menuPos = TMS.getRect('MENU_RIGHT'),
				playerRect = TMS.getRect(newRoomId),
				roomData = {
					x: parseFloat(TMS.getCssData(newRoomId, 'left').replace('px', '')),
					y: parseFloat(TMS.getCssData(newRoomId, 'top').replace('px', ''))
				},
	
				// Calc new pos.
				nextX = parseFloat(roomData.x - (((window.innerWidth / 2) - playerRect.width / 2) - menuPos.width / 2)),
				nextY = parseFloat(roomData.y - ((window.innerHeight / 2) - playerRect.height / 2));
	
			// Update canvas position
			TMS.css('APP_MAP_CANVAS', {'left': APP.tools.parsePolarity(nextX) + 'px', 'top': APP.tools.parsePolarity(nextY) + 'px'});

		}

	},

	// Toggle drag map
	toggleDragMapCanvas: function(){

		// Check if window has focus
		if (nw.Window.get().cWindow.focused === !0){

			// Declare vars
			var labelStatus = 'INACTIVE',
				pos = APP.graphics.enabledDragList.indexOf('APP_MAP_CANVAS');

			// Reset top menu size
			if (APP.options.hideTopMenuOnSave === !1){
				TMS.css('MENU_TOP', {'height': '30px'});
			}

			// Check enable canvas drag
			switch (APP.graphics.enableCanvasDrag){

				case !1:
					TMS.css('APP_MAP_CANVAS', {'cursor': 'move', 'transition-duration': '0s'});
					APP.graphics.enableDrag('APP_MAP_CANVAS');
					APP.graphics.enableCanvasDrag = !0;
					labelStatus = 'ACTIVE';
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

			// Update label
			document.getElementById('LABEL_mapDragStatus').innerHTML = ' - Canvas drag is ' + labelStatus;

		}

	},

	// Toggle canvas bg color
	toggleBgColor: function(){

		switch (this.disableCanvasBgColor){

			// Enable background color
			case !0:
				TMS.css('APP_MAP_CANVAS', {'background-color': '#0000'});
				APP.graphics.disableCanvasBgColor = !1;
				break;

			// Disable background color
			case !1:
				TMS.css('APP_MAP_CANVAS', {'background-color': '#200'});
				APP.graphics.disableCanvasBgColor = !0;
				break;

		}

	}

}