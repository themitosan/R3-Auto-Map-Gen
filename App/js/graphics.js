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
	addedMapHistory: [],
	enableCanvasDrag: !1,

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
				saveRoomClass = '',
				mapExtraClass = '';

			if (parent !== void 0){

				// Update parent door counts
				APP.graphics.addedMaps[parent].doors.push(mapName);

				// Get parent data
				var heightFactor = 74,
					nDoorFactor = (heightFactor * APP.graphics.addedMaps[parent].doors.length),
					rect = TMS.getRect('ROOM_' + parent),
					pData = {
						width: rect.width,
						height: rect.height,
						top: parseInt(TMS.getCssData('ROOM_' + parent, 'top').replace('px', '')),
						left: parseInt(TMS.getCssData('ROOM_' + parent, 'left').replace('px', ''))
					};

				posX = parseFloat((pData.left + pData.width) + 20);
				posY = (pData.top - heightFactor) + nDoorFactor;

			}

			// Check if is save room
			if (APP.database.rdtNames[mapName].saveRoom === !0){
				saveRoomClass = ' SAVE_ROOM';
			}

			switch (mapName){

				// Game start
				case 'R10D':
					mapExtraClass = 'GAME_START';
					break;

				// Game end
				case 'R50E':
					mapExtraClass = 'GAME_END';
					break;

			}

			// Generate room and append to map
			const mapTemp = '<div id="ROOM_' + mapName + '" class="DIV_ROOM' + saveRoomClass + ' ' + mapExtraClass + '" style="top: ' + posY + 'px;left: ' + posX + 'px;">[' + mapName + ']<br>' +
				  APP.database.rdtNames[mapName].name + '</div>';

			TMS.append('APP_MAP_CANVAS', mapTemp);

			// Enable drag
			APP.graphics.enableDrag('ROOM_' + mapName);

			// Push selected map to list
			APP.graphics.addedMaps[mapName] = {x: posX, y: posY, doors: []};

		}

		// Update labels
		document.getElementById('LABEL_RE3_INFO_mapName').innerHTML = 'Map: ' + APP.gameHook.mapHistory[APP.gameHook.mapHistory.length - 1];

		// Push line
		if (parent !== void 0){
			APP.graphics.pushLine(parent, mapName);
		}

		// Push history
		this.addedMapHistory.push({mapName: mapName, parent: parent});

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

			// Add connection animation to current line and get backwards connection id
			for (var i = 0; i < lineNames.length; i++){
				if (document.getElementById(lineNames[i]) !== null){
					reverseConnection = lineNames[i].split('_').reverse().toString().replace(',', '_');
					TMS.addClass(lineNames[i], 'SVG_CURRENT_FLOW');
					break;
				}
			}

			// Display only current line with animation
			connectedLines = Object.keys(lineList).filter(function(cLine){
				if (cLine.indexOf(newMap) !== -1){
					TMS.css(cLine, {'opacity': '1'});
				}
			});
			TMS.css(reverseConnection, {'opacity': '0'});

		}

	},

	// Enable drag element
	enableDrag: function(domName){

		// Variables
		var pos1 = pos2 = pos3 = pos4 = 0,
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

		// Enable drag
		document.getElementById(domName).onmousedown = dragMouseDown;

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

			var labelStatus = 'INACTIVE';

			switch (APP.graphics.enableCanvasDrag){

				case !1:
					TMS.css('APP_MAP_CANVAS', {'cursor': 'move', 'transition-duration': '0s'});
					APP.graphics.enableDrag('APP_MAP_CANVAS');
					APP.graphics.enableCanvasDrag = !0;
					labelStatus = 'ACTIVE';
					break;

				case !0:
					document.getElementById('APP_MAP_CANVAS').onmousedown = null;
					TMS.css('APP_MAP_CANVAS', {'cursor': 'auto', 'transition-duration': '1s'});
					APP.graphics.enableCanvasDrag = !1;
					break;

			}

			// Update label
			document.getElementById('LABEL_mapDragStatus').innerHTML = ' - Canvas drag is ' + labelStatus;

		}

	}

}