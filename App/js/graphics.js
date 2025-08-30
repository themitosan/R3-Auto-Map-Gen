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
	availableCamHints: 0,
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
				currentObjective = 'Unknown',
				availableCamHints = 'Unknown',
				clearedObjectives = 'Unknown',
				cGame = APP.options.settingsData.currentGame,
				checkBioRand = document.getElementById('CHECKBOX_isBioRand').checked,
				lMapHistory = APP.gameHook.mapHistory[APP.gameHook.mapHistory.length - 1],
				seedFile = `${APP.options.settingsData[cGame].gamePath}/mod_biorand/description.txt`;

			// Reset top menu and update if select scenario should be active (or not)
			if (APP.options.hideTopMenu === !1) TMS.css('MENU_TOP', {'height': `${maxHeight}px`});
			if (APP.gameHook.gameActive === !1) document.getElementById('SELECT_SCENARIO').disabled = APP.options.settingsData.currentGame !== 'bio2';

			// Check if current game is RE: Code veronica
			if (cGame === 'biocv') seedFile = `${APP.path.parse(APP.options.settingsData[cGame].dumpPath).dir}/mod_biorand/description.txt`;

			// Hide elements depending of which game is selected
			var btnDisplayIso = { 'display': 'inline' },
				selectScenario = { 'display': 'inline' };

			// Hide current scenario if current game isn't bio2
			if (cGame !== 'bio2') selectScenario =  { 'display': 'none' };

			// Hide select iso button if current game is biocv
			if (cGame !== 'biocv') btnDisplayIso = { 'display': 'none' };

			// Update options CSS
			TMS.css('BTN_SELECT_ISO', btnDisplayIso);
			TMS.css('SELECT_SCENARIO', selectScenario);			

			// Disable buttons is game is running
			document.getElementById('BTN_SELECT_ISO').disabled = APP.gameHook.gameActive === !0;
			document.getElementById('BTN_RESET_CONFIGS').disabled = APP.gameHook.gameActive === !0;

			// Check if "is BioRand" active
			if (checkBioRand === !0 && APP.fs.existsSync(seedFile) === !0){
				const randDesc = APP.fs.readFileSync(seedFile, 'utf-8');
				bioRandSeedName = randDesc.slice(randDesc.indexOf('Seed: ') + 6).replace('\r\n', '');
				clearedObjectives = APP.options.bioRandObjectives.clearedObjectives;
				if (APP.options.bioRandObjectives.current !== null) currentObjective = `[${APP.options.bioRandObjectives.current}] ${APP.database[cGame].rdt[APP.options.bioRandObjectives.current].name}`;
			}

			// Check if latest map exists and if game is running
			if (lMapHistory !== void 0 && APP.gameHook.gameActive === !0){
				cMap = `Map: ${lMapHistory}`;
				gameRunningStatus = ' - ';
			}

			// Check canvas drag status
			if (this.enableCanvasDrag === !0) canvasDragStatus = 'ON';

			// Check if available cam hints is available
			if (APP.options.enableCamHint === !0) availableCamHints = APP.graphics.availableCamHints;

			// Check if right menu is closed and wine fix is disabled
			if (APP.options.isMenuRightClosed === !0 && nw.App.manifest.extra.wineFix === !1) labelDragMessage = ' [ Use this label to drag this window ]';

			// Set game hint vars
			var gameHintCss = { 'opacity': '0', 'app-region': 'no-drag' },
				gameHintData = '<!-- Nothing to see here™ -->';

			// Check if show game hints is active
			if (APP.options.showGameHints === !0 && APP.database[cGame].gameHints[lMapHistory] !== void 0){
				gameHintCss.opacity = '1';
				gameHintCss['app-region'] = 'drag';
				gameHintData = ` === Game Hint ===<br>${APP.database[cGame].gameHints[lMapHistory]}`;
			}

			// Set game hint data
			TMS.css('APP_GAME_HINTS', gameHintCss);
			document.getElementById('APP_GAME_HINTS').innerHTML = gameHintData;

			// Set label strings and update top info GUI
			document.getElementById('LABEL_RE3_INFO_mapName').innerHTML = cMap;
			document.getElementById('LABEL_currentObjective').innerHTML = currentObjective;
			document.getElementById('LABEL_clearedObjectives').innerHTML = clearedObjectives;
			document.getElementById('LABEL_availableCamHints').innerHTML = availableCamHints;
			document.getElementById('LABEL_doorCounter').innerHTML = APP.options.doorTrigger;
			document.getElementById('LABEL_bioRandSeed').innerHTML = bioRandSeedName.slice(0, 9);
			document.getElementById('LABEL_currentCamera').innerHTML = APP.gameHook.currentCamera;
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
			if (APP.options.hideTopMenu === !0 && APP.gameHook.gameActive === !0) TMS.css('MENU_TOP', {'height': '0px'});

		}, timeout);

	},

	// Add room to map
	pushMap: function(mapName, parent){

		// Set vars, get current game and check if current map was added
		var canAdd = !0;
		const cGame = APP.options.settingsData.currentGame;
		if (document.getElementById(`ROOM_${mapName}`) !== null) canAdd = !1;

		// Check if current map name was provided
		if (mapName === void 0) canAdd = !1;

		// Check if map exists on database
		if (APP.database[cGame].rdt[mapName] === void 0) canAdd = !1;

		// Check if can add map
		if (canAdd === !0){

			// Default coords
			var posX = 50000,
				posY = 50050,
				mapExtraClass = [],
				cGameScenario = document.getElementById('SELECT_SCENARIO').value,
				cBioRandObjective = APP.database[cGame].bioRandObjectives[mapName],
				isBioRandMod = document.getElementById('CHECKBOX_isBioRand').checked;

			// Reset map drag
			APP.graphics.enableCanvasDrag = !0;
			APP.graphics.toggleDragMapCanvas();

			// Check if parent map was provided
			if (parent !== void 0){

				// Set default position
				var rect = TMS.getCoords(`ROOM_${parent}`);
				posX = rect.L + (rect.W / 2);
				posY = rect.T;

				// Check if farest map was defined
				if (APP.graphics.xFarestMap === '') APP.graphics.checkForMapDistances();

			}

			// Check if is game start
			if (APP.database[cGame].rdt[mapName].gameStart === !0){

				// Create can add message var, check if is Bio 2 and current map is start from other scenario (Start from B on A and vice-versa)
				var canAddGameStart = !0;
				if (cGame === 'bio2' && cGameScenario === 'scenario_a' && mapName === 'R104') canAddGameStart = !1;
				if (cGame === 'bio2' && cGameScenario === 'scenario_b' && mapName === 'R100') canAddGameStart = !1;

				// Check if can add
				if (canAddGameStart === !0) mapExtraClass.push('GAME_START');

			}

			// Check if is game end
			if (APP.database[cGame].rdt[mapName].gameEnd === !0){

				// Create check var and check if current game isn't RE2
				var canAddGameEnd = !1;
				if (cGame !== 'bio2') canAddGameEnd = !0;

				// Check if is RE2 and is scenario a
				if (cGame === 'bio2' && mapName === 'R700' && cGameScenario === 'scenario_a') canAddGameEnd = !0;

				// Check if is RE2 and is scenario b
				if (cGame === 'bio2' && mapName === 'R704' && cGameScenario === 'scenario_b') canAddGameEnd = !0;

				// Check if can add
				if (canAddGameEnd === !0) mapExtraClass.push('GAME_END');

			}

			// Check if player can save on current map
			if (APP.database[cGame].rdt[mapName].canSave === !0) mapExtraClass.push('ROOM_CAN_SAVE');

			// Check if current map have item box
			if (APP.database[cGame].rdt[mapName].haveItemBox === !0) mapExtraClass.push('ROOM_ITEM_BOX');

			// Check if "is BioRand" mode is active
			if (isBioRandMod === !0){

				// Update BioRand objective and check if reset objective flag is active
				if (parent !== void 0) APP.options.updateBioRandObjective(mapName, parent);
				if (APP.options.bioRandObjectives.reset === !0){

					// Check if map is loading and if needs to apply distance from previous segment
					if (APP.options.isMapLoading === !1 && APP.options.bioRandObjectives.applyDistance === !0){

						// Get farest map coords and update X pos.
						const fMap = TMS.getCoords(`ROOM_${APP.graphics.xFarestMap}`);
						APP.options.bioRandObjectives.applyDistance = null;
						posX = fMap.WL + (window.innerWidth / 2);

					}

					// Reset objective vars
					APP.options.bioRandObjectives.reset = !1;
					APP.options.bioRandObjectives.applyDistance = null;

				}

				// Check if current map is an objective
				if (cBioRandObjective !== void 0){

					// Set can add BioRand objective var and check current game
					var canAddBioRandObjective = !0;
					if (cGame === 'bio2' && cBioRandObjective.requiredScenario !== null && cBioRandObjective.requiredScenario !== cGameScenario) canAddBioRandObjective = !1;

					// Check if can add BioRand objective
					if (canAddBioRandObjective === !0) mapExtraClass.push('BIORAND_OBJECTIVE');

				}

			}

			// Generate room html and append to canvas
			const mapTemp = `<div id="ROOM_${mapName}" title="[${mapName}]\n${APP.database[cGame].rdt[mapName].name}, ${APP.database[cGame].rdt[mapName].location}" 
							class="DIV_ROOM ${mapExtraClass.toString().replace(RegExp(',', 'gi'), ' ')}" style="z-index: ${APP.graphics.zIndexMap};top: ${posY}px;left: ${posX}px;">
							[${mapName}]<br>${APP.database[cGame].rdt[mapName].name}</div>`;
			TMS.append('APP_MAP_CANVAS', mapTemp);

			// Bump map z-index counter and push selected map to list
			APP.graphics.addedMaps[mapName] = { x: posX, y: posY, mapId: APP.graphics.currentMap, cams: {} };
			APP.graphics.zIndexMap++;

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
			this.addedMapHistory.push({ mapName: mapName, parent: parent });

		}

		// Push line, bump door trigger var and update labels
		APP.graphics.pushLine(parent, mapName);
		APP.graphics.processCamHint();
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
				if (res === 0) res = val;
				return res;
			} 

			// Process
			const runProcess = function(){

				// Bump cycle counter, set reset flag and start processing
				cycles++;
				var reRun = !1;
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

			// Start process and log
			runProcess();
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
			if (lineList[lNames] !== void 0) canAdd = !1;
		});
		if (parent === void 0) canAdd = !1;

		// Check if can add
		if (canAdd === !0){

			// Create vars
			var pData = TMS.getRect(`ROOM_${parent}`),
				nData = TMS.getRect(`ROOM_${newMap}`),
				canvasData = TMS.getRect('APP_MAP_CANVAS'),
				x1 = (pData.x + parseFloat(pData.width / 2)) - canvasData.x,
				y1 = (pData.y + parseFloat(pData.height / 2)) - canvasData.y,
				x2 = (nData.x + parseFloat(nData.width / 2)) - canvasData.x,
				y2 = (nData.y + parseFloat(nData.height / 2)) - canvasData.y;

			// Create HTML and render new lines
			lineNames.forEach(function(lName){
				TMS.append('APP_MAP_CANVAS', `<svg id="${lName}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff"/></svg>`);
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
				if (cLine.indexOf(newMap) !== -1) TMS.css(cLine, {'opacity': '1'});
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

			// Create enable vars
			var enable_x = !0,
				enable_y = !0;
			
			// Disable coords if Ctrl / Shift keys are active
			if (APP.kbInput.indexOf('ShiftLeft') !== -1) enable_y = !1;
			if (APP.kbInput.indexOf('ControlLeft') !== -1) enable_x = !1;

			// Update CSS
			if (enable_x === !0) TMS.css(domName, {'left': `${finalX}px`});
			if (enable_y === !0) TMS.css(domName, {'top': `${finalY}px`});

			// Update Lines
			if (domName !== 'APP_MAP_CANVAS') APP.graphics.updateLines(domName);

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

		// Create line const and check how much lines exists
		const lineList = this.addedLines;
		if (Object.keys(lineList).length !== 0){

			// Get default connected lines and check if room name was provided. If so, update only connected lines
			var processList = Object.keys(lineList);
			if (roomName !== void 0){
				processList = Object.keys(lineList).filter(function(cLine){
					if (cLine.indexOf(roomName.replace('ROOM_', '')) !== -1) return cLine;
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
			TMS.css('APP_MAP_CANVAS', { 'left': `${finalX}px`, 'top': `${finalY}px` });
			document.getElementById('LABEL_map_X').innerHTML = parseInt(nextX);
			document.getElementById('LABEL_map_Y').innerHTML = parseInt(nextY);

		}

	},

	// Add cam hint
	processAddCamHint: function(mapName){

		// Get previous maps / cams and check if exists. if not, return null map / cam 0
		const currentCam = APP.graphics.addedMaps[mapName].cams[structuredClone(APP.gameHook.currentCamera)];
		var prevMap = APP.gameHook.mapHistory[APP.gameHook.mapHistory.length - 2],
			prevCam = APP.gameHook.camHistory[APP.gameHook.camHistory.length - 2];

		// Fix if cam doesn't exists yet and check if current exists on current map
		if (prevCam === void 0) prevCam = 0;
		if (currentCam === void 0) APP.graphics.addedMaps[mapName].cams[structuredClone(APP.gameHook.currentCamera)] = [];

		// Check if can add previous map connection to dataabase
		if (prevMap !== void 0){

			// Check if previous cams on previous maps contains current map and if previous map exists on current cam
			if (APP.graphics.addedMaps[prevMap].cams[prevCam].indexOf(mapName) === -1) APP.graphics.addedMaps[prevMap].cams[prevCam].push(mapName);
			if (currentCam.indexOf(prevMap) === -1) APP.graphics.addedMaps[mapName].cams[structuredClone(APP.gameHook.currentCamera)].push(prevMap);

		}

		APP.graphics.processCamHint();

	},

	// Process cam hint
	processCamHint: function(){

		// Set current feature status
		APP.options.enableCamHint = document.getElementById('CHECKBOX_enableCamHint').checked;
		localStorage.setItem('enableCamHint', APP.options.enableCamHint);
		for (var i = 0; i < APP.gameHook.mapHistory.length; i++) TMS.removeDOM(`CAM_HINT_${i}`);
		APP.graphics.availableCamHints = 0;

		// Get current map and current game
		const
			currentMap = APP.gameHook.currentMap,
			currentCam = APP.gameHook.currentCamera,
			cGame = APP.options.settingsData.currentGame;

		// Check if current cam exists on database
		if (APP.graphics.addedMaps[currentMap] !== void 0 && APP.graphics.addedMaps[currentMap].cams[currentCam] === void 0){
			APP.graphics.addedMaps[currentMap].cams[currentCam] = [];
		}

		// Check if have maps
		if (Object.keys(APP.graphics.addedMaps).length !== 0 && APP.options.isMapLoading === !1){

			// Requirements to render hint
			const hintRequirements = [
				APP.options.enableCamHint === !0,
				APP.graphics.addedMaps[currentMap] !== void 0,
				APP.graphics.addedMaps[currentMap].cams[currentCam].length !== 0
			];

			// Check if can render cam hint
			if (hintRequirements.indexOf(!1) === -1){

				// Set current cam hints and process cam list
				APP.graphics.availableCamHints = APP.graphics.addedMaps[currentMap].cams[currentCam].length;
				APP.graphics.addedMaps[currentMap].cams[currentCam].forEach(function(mapTarget, cIndex){

					// Check if map can be processed
					if (APP.database[cGame].rdt[mapTarget].skipCamHint === !1){

						// Get map coords and append hint on map
						const cMapCoords = TMS.getCoords(`ROOM_${mapTarget}`);
						TMS.append('APP_MAP_CANVAS', `<div id="CAM_HINT_${cIndex}" class="DIV_CAM_HINT" style="z-index: ${(APP.graphics.addedMapHistory.length * 2)};top: ${(cMapCoords.T - 6)}px;left: ${(cMapCoords.L - 6)}px;width: ${(cMapCoords.W + 6)}px;height: ${(cMapCoords.H + 6)}px;"></div>`);

					}

				});

			}

		}

		// Update labels GUI
		APP.graphics.updateGuiLabel();

	},

	// Play background objective animation
	playBgObjetiveAnimation: function(animationName, mapName){
		
		// Create log and play animation
		console.info(`INFO - Playing objective animation: ${animationName} for Map ${mapName}`);
		switch (animationName){

			// Found objective
			case 'foundObjective':

				// Start animation by disabling toggle and appending HTML
				document.getElementById('CHECKBOX_enableBgObjectiveAnimation').disabled = !0;
				TMS.append('APP_CANVAS', `<div id="APP_MAP_OBJECTIVE_ANIMATION_${APP.options.bioRandObjectives.clearedObjectives}" class="APP_MAP_OBJECTIVE_ANIMATION_${animationName}"></div>`);

				// Fade in
				APP.tools.createTimeout(`animation_${animationName}_${APP.options.bioRandObjectives.clearedObjectives}_start`, function(){
					TMS.css(`APP_MAP_OBJECTIVE_ANIMATION_${APP.options.bioRandObjectives.clearedObjectives}`, { 'opacity': 1 });
				}, 100);

				// Fade out
				APP.tools.createTimeout(`animation_${animationName}_${APP.options.bioRandObjectives.clearedObjectives}_fadeOut`, function(){
					TMS.css(`APP_MAP_OBJECTIVE_ANIMATION_${APP.options.bioRandObjectives.clearedObjectives}`, { 'opacity': 0 });
				}, 1110);

				// Clear animation
				APP.tools.createTimeout(`animation_${animationName}_${APP.options.bioRandObjectives.clearedObjectives}_end`, function(){
					APP.graphics.clearBgObjectiveAnimation();
					document.getElementById('CHECKBOX_enableBgObjectiveAnimation').disabled = !1;
				}, 2150);
				break;

			// Clear objective
			case 'clearObjective':

				// Start animation by disabling toggle and appending HTML
				document.getElementById('CHECKBOX_enableBgObjectiveAnimation').disabled = !0;
				TMS.append('APP_CANVAS', `<div id="APP_MAP_OBJECTIVE_ANIMATION_${APP.options.bioRandObjectives.clearedObjectives}" class="APP_MAP_OBJECTIVE_ANIMATION_${animationName}"></div>`);

				// Transition fade position
				APP.tools.createTimeout(`animation_${animationName}_${APP.options.bioRandObjectives.clearedObjectives}_start`, function(){
					TMS.css(`APP_MAP_OBJECTIVE_ANIMATION_${APP.options.bioRandObjectives.clearedObjectives}`, { 'left': '-100%' });
				}, 10);

				// Clear animation
				APP.tools.createTimeout(`animation_${animationName}_${APP.options.bioRandObjectives.clearedObjectives}_end`, function(){
					APP.graphics.clearBgObjectiveAnimation();
					document.getElementById('CHECKBOX_enableBgObjectiveAnimation').disabled = !1;
				}, 1050);
				break;

			// Unknown animation
			default:
				console.warn(`WARN - Unable to play objective animation: ${animationName}`);
				break;

		}

	},

	// Toggle enable objective background animation
	toggleBgObjectiveAnimation: function(){

		// Set variables
		APP.options.enableBgObjectiveAnimation = document.getElementById('CHECKBOX_enableBgObjectiveAnimation').checked;
		localStorage.setItem('enableBgObjectiveAnimation', APP.options.enableBgObjectiveAnimation);
		if (APP.options.enableBgObjectiveAnimation === !1){
			APP.graphics.clearBgObjectiveAnimation();
		}

	},

	// Clear objective background animation
	clearBgObjectiveAnimation: function(){
		for (var i = 0; i < 20; i++){
			TMS.removeDOM(`APP_MAP_OBJECTIVE_ANIMATION_${i}`);
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
				if (pos !== -1) APP.graphics.enabledDragList.splice(pos, 1);
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

		// Check if enable background color is active
		if (this.disableCanvasBgColor === !0){
			TMS.css('APP_MAP_CANVAS', {'background-color': '#0000'});
			TMS.css('MENU_TOP_BG', {'background-color': '#0000'});
			APP.graphics.disableCanvasBgColor = !1;
		} else {

			// Disable top info
			document.getElementById('CHECKBOX_showGameData').checked = !1;
			APP.graphics.toggleShowGameData();
			APP.options.showGameData = !1;

			APP.graphics.disableCanvasBgColor = !0;
			TMS.css('MENU_TOP_BG', {'background-color': '#200'});
			TMS.css('APP_MAP_CANVAS', {'background-color': '#200'});

		}

		// Check BG grid
		this.toggleBgGrid();

	},

	// Toggle show game data
	toggleShowGameData: function(){

		// Get variables, update show game data var, create opacity and min width vars
		const getShowGameData = document.getElementById('CHECKBOX_showGameData').checked;
		localStorage.setItem('showGameData', getShowGameData);

		var appDragCss = 'drag',
			sGameDataOpacity = 1;

		// Check if can display game data and update min width size
		if (getShowGameData === !1){
			sGameDataOpacity = 0;
			appDragCss = 'no-drag';
		}

		// Set final CSS
		TMS.css('APP_GAME_DATA', {
			'app-region': appDragCss,
			'opacity': sGameDataOpacity
		});

	},

	// Toggle show game hints
	toggleShowGameHints: function(){

		// Get feature state and update settings data
		const getShowGameHints = document.getElementById('CHECKBOX_showGameHints').checked;
		localStorage.setItem('showGameHints', getShowGameHints);
		APP.options.showGameHints = getShowGameHints;
		APP.graphics.updateGuiLabel();

	},

	// Get bg color
	pickGradientColor: function(colorPos){

		// Check if data was provided
		if (colorPos !== void 0){

			// Declare main vars
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

		// Define actions for resize, restore and maximize
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