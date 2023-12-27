/*
	R3 Auto Map Gen.
	graphics.js
*/

temp_GRAPHICS = {

	/*
		Variables
	*/
	maxHeight: 30,
	zIndexMap: 10,
	currentMap: 0,
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

		// Get data, save it on localstorage and display menu by default
		const maxHeight = this.maxHeight;
		APP.options.hideTopMenu = document.getElementById('CHECKBOX_hideTopMenu').checked;
		localStorage.setItem('hideTopMenu', APP.options.hideTopMenu);
		TMS.css('MENU_TOP', {'height': `${maxHeight}px`});

		// Check if game is running
		if (APP.gameHook.gameActive === !0){

			// Create CSS vars and check if hide top menu is active
			var bgCssData = {'display': 'none'},
				menuCssData = {'height': `${maxHeight}px`};
			if (APP.options.hideTopMenu === !0){
				menuCssData = {'height': '0px'};
				bgCssData = {'display': 'inline'};
			}

			// Apply CSS
			TMS.css('MENU_TOP', {'height': menuCssData});
			TMS.css('MENU_TOP_BG', {'display': bgCssData});

		}

	},

	// Update canvas zoom
	updateCanvasZoom: function(){
		const cZoom = document.getElementById('OPTION_mapCanvasZoom').value;
		document.getElementById('LABEL_mapCanvasZoom').innerHTML = cZoom;
		TMS.css('APP_MAP_CANVAS', {'zoom': `${cZoom}`});
	},

	// Reset canvas zoom
	resetCanvasZoom: function(){
		document.getElementById('OPTION_mapCanvasZoom').value = 1;
		APP.graphics.updateCanvasZoom();
	},

	// Update current map label
	updateGuiLabel: function(){

		// Get max height value and check if can update GUI labels
		const maxHeight = this.maxHeight;
		if (APP.graphics.skipUpdateGuiLabel === !1){

			var cMap = '',
				labelDragMessage = '',
				gameRunningStatus = '',
				canvasDragStatus = 'OFF',
				bioRandSeedName = 'Unknown',
				cGame = APP.options.settingsData.currentGame,
				checkBioRand = document.getElementById('CHECKBOX_isBioRand').checked,
				lMapHistory = APP.gameHook.mapHistory[APP.gameHook.mapHistory.length - 1],
				seedFile = `${APP.options.settingsData[cGame].gamePath}/mod_biorand/description.txt`;

			// Reset top menu and update if select scenario should be active (or not)
			if (APP.options.hideTopMenu === !1){
				TMS.css('MENU_TOP', {'height': `${maxHeight}px`});
			}
			if (APP.gameHook.gameActive === !1){
				document.getElementById('SELECT_SCENARIO').disabled = APP.options.settingsData.currentGame !== 'bio2';
			}

			// Check if "is BioRand" active
			if (checkBioRand === !0 && APP.fs.existsSync(seedFile) === !0){
				const randDesc = APP.fs.readFileSync(seedFile, 'utf8');
				bioRandSeedName = randDesc.slice(randDesc.indexOf('Seed: ') + 6).replace('\r\n', '');
			}

			// Check if latest map exists and if game is running
			if (lMapHistory !== void 0 && APP.gameHook.gameActive === !0){
				cMap = `Map: ${lMapHistory}`;
				gameRunningStatus = ' - ';
			}

			// Check canvas drag status
			if (this.enableCanvasDrag === !0){
				canvasDragStatus = 'ON';
			}

			// Check if right menu is closed
			if (APP.options.isMenuRightClosed === !0){
				labelDragMessage = ' [ You can use this label to drag app window ]';
			}

			// Set label strings and update top info GUI
			document.getElementById('LABEL_RE3_INFO_mapName').innerHTML = cMap;
			document.getElementById('LABEL_bioRandSeed').innerHTML = bioRandSeedName;
			document.getElementById('LABEL_doorCounter').innerHTML = APP.options.doorTrigger;
			document.getElementById('LABEL_mapDragStatus').innerHTML = `${gameRunningStatus}Canvas drag is <u>${canvasDragStatus}</u>${labelDragMessage}`;
			APP.graphics.toggleShowGameData();

		}

	},

	// Display top message
	displayTopMsg: function(msg, timeout){

		// Set skip update label flag as true and set GUI
		this.skipUpdateGuiLabel = !0;
		TMS.css('MENU_TOP', {'height': `${this.maxHeight}px`});

		// Set labels, reset skip label flag and update it after timeout
		document.getElementById('LABEL_mapDragStatus').innerHTML = msg;
		document.getElementById('LABEL_RE3_INFO_mapName').innerHTML = '';
		setTimeout(function(){

			// Set skip update label and call update label function
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

		// Variables
		var canAdd = !0,
			errorReason = '',
			mList = this.addedMaps,
			cMap = APP.gameHook.gameData.cMap,
			distanceFactor = this.distanceFactor;

		// Get current game and check if current map was added
		const cGame = APP.options.settingsData.currentGame;
		if (document.getElementById(`ROOM_${mapName}`) !== null){
			canAdd = !1;
		}

		// Check if current map name was provided
		if (mapName === void 0){
			canAdd = !1;
		}

		// Check if map exists on database
		if (APP.database[cGame].rdt[mapName] === void 0){
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
				cGameScenario = document.getElementById('SELECT_SCENARIO').value,
				isBioRandMod = document.getElementById('CHECKBOX_isBioRand').checked;

			if (parent !== void 0){

				// Update parent door counts and get parent data
				APP.graphics.addedMaps[parent].doors.push(mapName);
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
				
				// Can add message var
				var canAddGameStart = !0;

				// Check if is Bio 2 and current map is start from other scenario (Start from B on A and vice-versa)
				if (cGame === 'bio2' && cGameScenario === 'scenario_a' && mapName === 'R104'){
					canAddGameStart = !1;
				}
				if (cGame === 'bio2' && cGameScenario === 'scenario_b' && mapName === 'R100'){
					canAddGameStart = !1;
				}

				// Check if can add
				if (canAddGameStart === !0){
					mapExtraClass.push('GAME_START');
				}

			}

			// Check if is game end
			if (APP.database[cGame].rdt[mapName].gameEnd === !0){

				// Create check var and check if current game isn't RE2
				var canAddGameEnd = !1;
				if (cGame !== 'bio2'){
					canAddGameEnd = !0;
				}

				// Check if is RE2 and is scenario a
				if (cGame === 'bio2' && mapName === 'R700' && cGameScenario === 'scenario_a'){
					canAddGameEnd = !0;
				}

				// Check if is RE2 and is scenario b
				if (cGame === 'bio2' && mapName === 'R704' && cGameScenario === 'scenario_b'){
					canAddGameEnd = !0;
				}

				// Check if can add
				if (canAddGameEnd === !0){
					mapExtraClass.push('GAME_END');
				}

			}

			// Check if player can save on current map
			if (APP.database[cGame].rdt[mapName].canSave === !0){
				mapExtraClass.push('ROOM_CAN_SAVE');
			}

			// Check if current map have item box
			if (APP.database[cGame].rdt[mapName].haveItemBox === !0){
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
			const mapTemp = `<div id="ROOM_${mapName}" title="[${mapName}]\n${APP.database[cGame].rdt[mapName].name}, ${APP.database[cGame].rdt[mapName].location}" class="DIV_ROOM ${mapExtraClass.toString().replace(RegExp(',', 'gi'), ' ')}" style="z-index: ${APP.graphics.zIndexMap};top: ${posY}px;left: ${posX}px;">[${mapName}]<br>${APP.database[cGame].rdt[mapName].name}</div>`;
			TMS.append('APP_MAP_CANVAS', mapTemp);

			// Bump map z-index counter and push selected map to list
			APP.graphics.zIndexMap++;
			APP.graphics.addedMaps[mapName] = {x: posX, y: posY, mapId: APP.graphics.currentMap, doors: []};

			/*
				If map file isn't loading and there's a map parent, check if spawn position is over any other map
				and check what is the farest one in X coord.
			*/
			if (APP.options.isMapLoading === !1 && parent !== void 0){
				APP.graphics.processMapColission(mapName, parent);
				APP.graphics.checkForMapDistances();
			} 

			// Enable drag and push map to history
			APP.graphics.enableDrag(`ROOM_${mapName}`);
			this.addedMapHistory.push({mapName: mapName, parent: parent});			
			
		}

		// Push line, bump door trigger var and update labels
		APP.graphics.pushLine(parent, mapName);
		APP.options.doorTrigger++;
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

				// Bump cycle counter and set reset flag
				cycles++;
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

			// Update map label pos
			if (domName === 'APP_MAP_CANVAS'){
				document.getElementById('LABEL_map_X').innerHTML = APP.tools.parsePolarity(parseInt(finalX));
				document.getElementById('LABEL_map_Y').innerHTML = APP.tools.parsePolarity(parseInt(finalY));
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

			// Get default connected lines and check if room name was provided. If so, update only connected lines
			var processList = Object.keys(lineList);
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
	updatePlayerPos: function(disableCanvasDrag){

		// Check if player map history
		if (APP.gameHook.mapHistory.length !== 0){

			// Check if needs to disable canvas drag
			if (disableCanvasDrag === !0){
				APP.graphics.enableCanvasDrag = !0;
				APP.graphics.toggleDragMapCanvas();
			}

			// Remove present class from all maps and get new room id
			Object.keys(this.addedMaps).forEach(function(cMap){
				TMS.removeClass(`ROOM_${cMap}`, 'PLAYER_PRESENT');
			});
			const newRoomId = `ROOM_${APP.gameHook.mapHistory.slice(-1)}`;

			// Add class and calculate positions
			TMS.addClass(newRoomId, 'PLAYER_PRESENT');
			const
				menuRightPos = TMS.getRect('MENU_RIGHT'),
				playerRect = TMS.getRect(newRoomId),
				roomData = {
					x: parseFloat(TMS.getCssData(newRoomId, 'left').replace('px', '')),
					y: parseFloat(TMS.getCssData(newRoomId, 'top').replace('px', ''))
				},

				// Calc new pos.
				nextX = parseFloat(roomData.x - (((window.innerWidth / 2) - playerRect.width / 2) - menuRightPos.width / 2)),
				nextY = parseFloat(roomData.y - ((window.innerHeight / 2) - playerRect.height / 2)),

				// Fix polarity
				finalX = APP.tools.parsePolarity(nextX),
				finalY = APP.tools.parsePolarity(nextY);

			// Update canvas and map label pos.
			TMS.css('APP_MAP_CANVAS', {'left': `${finalX}px`, 'top': `${finalY}px`});
			document.getElementById('LABEL_map_X').innerHTML = parseInt(nextX);
			document.getElementById('LABEL_map_Y').innerHTML = parseInt(nextY);

		}

	},

	// Toggle drag map
	toggleDragMapCanvas: function(){

		// Declare vars and check enable canvas drag
		const pos = APP.graphics.enabledDragList.indexOf('APP_MAP_CANVAS');
		switch (APP.graphics.enableCanvasDrag){

			case !1:
				TMS.css('APP_MAP_CANVAS_BG', {'transition-duration': '0s', 'transition-timing-function': 'cubic-bezier(0,0,1,1)'});
				TMS.css('APP_MAP_CANVAS', {'cursor': 'move', 'transition-duration': '0s'});
				APP.graphics.enableDrag('APP_MAP_CANVAS');
				APP.graphics.enableCanvasDrag = !0;
				break;

			case !0:
				TMS.css('APP_MAP_CANVAS_BG', {'transition-duration': '1s', 'transition-timing-function': 'cubic-bezier(0,1,0,1)'});
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

	// Toggle tablet mode
	toggleTabletMode: function(){

		// Variables
		var marginCss = {'margin': '6px 0px 6px 0px'},
			btnCssData = {'height': 'auto', 'max-height': '30px', 'min-width': 'auto', 'font-size': '13px'},
			marginClassList = [
				'DIV_CHECKBOX',
				'DIV_TMS_COLOR_PICKER_RANGE'
			],
			btnClassList = [
				'BTN_LEFT',
				'BTN_RIGHT',
				'BTN_OPTIONS',
				'BTN_MENU_TOP',
				'BTN_SHOW_RIGHT_MENU',
				'BTN_TMS_COLOR_PICKER'
			];

		// Set default data and check if tablet mode is enabled. If so, update CSS
		APP.graphics.maxHeight = 30;
		APP.options.enableTabletMode = document.getElementById('CHECKBOX_enableTabletMode').checked;
		if (APP.options.enableTabletMode === !0){
			APP.graphics.maxHeight = 40;
			marginCss = {'margin': '16px 0px 16px 0px'};
			btnCssData = {'height': '40px', 'max-height': '40px !important', 'min-width': '80px !important', 'font-size': '15px'};
		}

		// Process button class list
		btnClassList.forEach(function(cClass){
			TMS.removeCustomClass(cClass);
			TMS.appendCustomClass(cClass, btnCssData);
		});

		// Process margin class list
		marginClassList.forEach(function(cClass){
			TMS.removeCustomClass(cClass);
			TMS.appendCustomClass(cClass, marginCss);
		});

		// Update GUI, open right menu, update checkbox class and update localstorage data
		APP.graphics.updateGuiLabel();
		APP.options.toggleRightMenu('open');
		localStorage.setItem('enableTabletMode', APP.options.enableTabletMode);

	},

	// Toggle BG grid and app box shadow
	toggleBgGrid: function(){

		// Create vars and check if grid is enabled
		var bgOpacity = 0,
			appBoxShadow = '0px 0px 10px #0000 inset';
		APP.options.enableGrid = document.getElementById('CHECKBOX_enableGrid').checked;
		if (APP.options.enableGrid === !0){
			bgOpacity = 0.12;
			appBoxShadow = '0px 0px 10px #000 inset';
		}

		// Set data on localStorage and apply css
		localStorage.setItem('enableGrid', APP.options.enableGrid);
		TMS.css('APP_MAP_CANVAS_BG', {'opacity': bgOpacity});
		TMS.css('APP_CANVAS', {'box-shadow': appBoxShadow});

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
				
				// Disable top info
				APP.options.showGameData = !1;
				document.getElementById('CHECKBOX_showGameData').checked = !1;
				APP.graphics.toggleShowGameData();

				TMS.css('APP_MAP_CANVAS', {'background-color': '#200'});
				TMS.css('MENU_TOP_BG', {'background-color': '#200'});
				APP.graphics.disableCanvasBgColor = !0;
				break;

		}

		// Check BG grid
		this.toggleBgGrid();

	},

	// Toggle show game data
	toggleShowGameData: function(){

		// Get status
		const getShowGameData = document.getElementById('CHECKBOX_showGameData').checked;
		localStorage.setItem('showGameData', getShowGameData);

		// Create opacity and min width vars
		var sGameDataOpacity = 1,
			sGameDataMinWidth = 190;

		// Check if can display game data and update min width size
		if (getShowGameData === !1){
			sGameDataOpacity = 0;
		}
		if (document.getElementById('CHECKBOX_isBioRand').checked === !0){
			sGameDataMinWidth = 560;
		}

		// Set final CSS
		TMS.css('APP_GAME_DATA', {'opacity': sGameDataOpacity, 'min-width': `${sGameDataMinWidth}px`});

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
					
					// Update color, save settings and update GUI
					APP.options.settingsData.bgGradientColor[colorIndex] = `#${newColor}`;
					APP.options.saveSettings();
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

		// Get colors array, update preview icons and update gradient
		const bgColors = APP.options.settingsData.bgGradientColor;
		TMS.css('DIV_ICON_PREVIEW_BG_COLOR_TOP', {'background-color': bgColors[0]});
		TMS.css('DIV_ICON_PREVIEW_BG_COLOR_BOTTOM', {'background-color': bgColors[1]});
		TMS.css('APP_CANVAS', {'background-image': `linear-gradient(180deg, ${bgColors[0]}, ${bgColors[1]})`});

	},

	// Start window actions
	startWinActions: function(){

		APP.win.on('resize', function(){
			APP.graphics.updatePlayerPos(!0);
		});

		APP.win.on('restore', function(){
			APP.graphics.updatePlayerPos(!0);
		});

		APP.win.on('maximize', function(){
			APP.graphics.updatePlayerPos(!0);
		});

	},

	// Disable GUI list
	processDisableList: function(list){
		list.forEach(function(cItem){
			document.getElementById(cItem).disabled = 'disabled';
		});
	},

	// Enable GUI list
	processEnableList: function(list){
		list.forEach(function(cItem){
			document.getElementById(cItem).disabled = '';
		});
	}

}