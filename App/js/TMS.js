/*
	**************************************************************************************

		TMS.js
		Created by TemmieHeartz (@temmieheartz)
		https://github.com/temmieheartz/TMS.js

		This file exists because I don't want to deal with jQuery anymore!

		Original source / motivation:
		http://youmightnotneedjquery.com/

	**************************************************************************************
*/

const TMS = Object.seal(Object.freeze({

	// Log warning
	logWarnings: !1,

	// Warn if something go wrong
	warn: function(warnText){
		if (this.logWarnings === !0){
			console.warn(`[TMS] ${warnText}`);
		}
	},

	/*
		TMS Functions
	*/

	/*
		Get element
	*/
	getElement: function(elementId){
		var res = document.getElementById(elementId);
		if (res === null){
			res = document.getElementsByTagName(elementId)[0];
		}
		if (res === void 0){
			res = null;
		}
		return res;
	},

	/*
		Append custom class
	*/
	appendCustomClass: function(name, css){

		// Check if can add custom class
		if (Object.keys(css).length !== 0){

			// Check if document has the class holder
			if (TMS.getElement('TMS_JS_CLASS_LIST') === null){
				TMS.append('body', '<div style="display:none !important;" id="TMS_JS_CLASS_LIST"></div>');
			}

			// Create custom class
			var finalHtml = `.${name} { `;
			Object.keys(css).forEach(function(cKey){
				finalHtml = `${finalHtml}${cKey}: ${css[cKey]}; `;
			});
			finalHtml = `${finalHtml.slice(0, (finalHtml.length - 1))} }`;

			// Append class
			if (TMS.getElement(`TMS_JS_CLASS_${name}`) !== null){
				TMS.getElement(`TMS_JS_CLASS_${name}`).innerHTML = finalHtml;
			} else {
				TMS.append('TMS_JS_CLASS_LIST', `<style id="TMS_JS_CLASS_${name}">${finalHtml}</style>`);
			}

		} else {
			TMS.warn('Unable to append new CSS class because no items were provided!');
		}

	},

	/**
		* Remove custom class
	*/
	removeCustomClass: function(name){
		if (TMS.getElement(`TMS_JS_CLASS_${name}`) !== null){
			TMS.removeDOM(`TMS_JS_CLASS_${name}`);
		}
	},

	/*
		CSS
	*/
	css: function(elementId, cssChanges){

		var eReason = [],
			canStart = !0,
			elId = TMS.getElement(elementId);

		if (elId === null){
			canStart = !1;
			eReason.push(`DOM or Tag does not exist! (${elementId})`);
		}
		if (typeof cssChanges !== 'object'){
			canStart = !1;
			eReason.push(`You must insert an object for CSS data (Current type: ${typeof cssChanges})`);
		}

		// End
		if (canStart === !0){

			Object.keys(cssChanges).forEach(function(cItem){
				elId.style[cItem] = cssChanges[cItem];
			});

		} else {
			TMS.warn(`Unable to apply CSS data!\n${eReason.toString().replace(RegExp(',', 'gi'), '\n')}`);
		}

	},

	/*
		Animate

		elementId     = HTML DOM id
		cssChanges    = Object {width: x, height, y}
		animationTime = Number (Min: 0)
		animationEase = CSS for transition option, like cubic-bezier
	*/
	animate: function(elementId, cssChanges, animationTime, animationEase){

		var eReason = [],
			canStart = !0,
			transitionString = '';
			elId = TMS.getElement(elementId);

		if (elId === null){
			canStart = !1;
			eReason.push(`\nDOM does not exist! (${elementId})`);
		}
		if (typeof cssChanges !== 'object'){
			canStart = !1;
			eReason.push(`\nYou must insert an object for CSS data (Current type: ${typeof cssChanges})`);
		}
		if (typeof animationTime !== 'number'){
			canStart = !1;
			eReason.push(`\nYou must insert a number on animation time (Current type: ${typeof animationTime})`);
		}

		// End
		if (canStart === !0){

			if (animationEase === void 0){
				animationEase = '';
			}
			if (animationTime < 0){
				animationTime = 0;
			}

			Object.keys(cssChanges).forEach(function(cItem){
				elId.style[cItem] = cssChanges[cItem];
				transitionString = `${transitionString}${cItem} ${(animationTime / 1000)}s `;
				elId.style['transition'] = transitionString + animationEase;
			});

			setTimeout(function(){
				elId.style['transition'] = 'none 0s';
			}, (animationTime + 1));

		} else {
			TMS.warn(`Unable to animate!\n${eReason.toString().replace(RegExp(',', 'gi'), '\n')}`);
		}
	},

	/*
		Focus Element
		sTimeout = time [ms]
	*/
	focus: function(elementId, sTimeout){

		const elId = TMS.getElement(elementId);

		if (elId !== null){

			if (sTimeout !== void 0 && Number(sTimeout) !== NaN){

				setTimeout(function(){
					elId.focus();
				}, sTimeout);

			} else {
				elId.focus();
			}

		} else {
			TMS.warn(`Unable to focus element because it does not exist! (${elementId})`);
		}
	},

	/*
		Disable Element
	*/
	disableElement: function(idList){

		var disableList = [];

		if (typeof idList === 'object'){
			disableList = idList;
		} else {
			disableList.push(idList);
		}

		// End
		disableList.forEach(function(cItem){

			const elId = TMS.getElement(cItem);

			if (elId !== null){

				elId.disabled = !0;
				elId.disabled = 'disabled';

				// If is <input>
				if (elId.type === 'button'){
					TMS.css(cItem, {'filter': 'grayscale(1) blur(0.8px)', 'cursor': 'not-allowed', 'opacity': '0.6'});
				}

			} else {
				TMS.warn(`Unable to disable element because it does not exist! (${cItem})`);
			}

		});

	},

	/*
		Enable Element
	*/
	enableElement: function(elementId){

		const elId = TMS.getElement(elementId);

		if (elId !== null){

			elId.disabled = '';
			elId.disabled = !1;

			if (elId.type === 'button'){
				TMS.css(elementId, {'filter': 'grayscale(0) blur(0px)', 'cursor': 'pointer', 'opacity': '1'});
			}

		} else {
			TMS.warn(`Unable to enable element because it does not exist! (${elementId})`);
		}
	},

	/*
		Get CSS data
		Returns the attr value from CSS propriety
	*/
	getCssData: function(elementId, cssAttrName){

		var result = '',
			elId = TMS.getElement(elementId);

		if (elId !== null){

			result = elId.style[cssAttrName];

			// Get computed style
			if (result === ''){
				result = window.getComputedStyle(elId)[cssAttrName];
			}

			// Get from DOM
			if (result === void 0){
				result = elId[cssAttrName];
			}

		} else {
			TMS.warn(`Unable to get element because it does not exist! (${elementId})`);
		}

		return result;
	},

	/*
		Scroll top
		Usage: elementObjects = {HTML_DOM_ID_0: scrollInt, HTML_DOM_ID_1: scrollInt2} and goes on
	*/
	scrollTop: function(elementObjects){
		Object.keys(elementObjects).forEach(function(elementId){

			const elId = TMS.getElement(elementId);

			if (elId !== null){
				elId.scrollTop = elementObjects[elementId];
			} else {
				TMS.warn(`Unable to scroll element because it does not exist! (${elementId})`);
			}

		});
	},

	/*
		Append data
	*/
	append: function(elementId, newData){

		var elId = TMS.getElement(elementId);

		if (elId !== null){
			elId.insertAdjacentHTML('beforeend', newData);
		} else {
			TMS.warn(`Unable to append element data because parent DOM does not exist! (${elementId})`);
		}

	},

	/*
		Add Class
	*/
	addClass: function(elementId, className){

		const elId = TMS.getElement(elementId);

		if (elId !== null){
			elId.classList.add(className);
		} else {
			TMS.warn(`Unable to add class because DOM does not exist! (${elementId})`);
		}
	},

	/*
		Remove Class
	*/
	removeClass: function(elementId, className){

		const elId = TMS.getElement(elementId);

		if (elId !== null){
			elId.classList.remove(className);
		} else {
			TMS.warn(`Unable to remove class because DOM does not exist! (${elementId})`);
		}

	},

	/*
		Clear
		Removes all HTML inside
	*/
	clear: function(elementId){
		const elId = TMS.getElement(elementId);
		if (elId !== null){
			elId.innerHTML = '';
		} else {
			TMS.warn(`Unable to clear inner data because DOM does not exist! (${elementId})`);
		}
	},

	/*
		triggerClick
	*/
	triggerClick: function(elementId){
		const elId = TMS.getElement(elementId);
		if (elId !== null){
			elId.click();
		} else {
			TMS.warn(`Unable to clear inner data because DOM does not exist! (${elementId})`);
		}
	},

	/*
		scrollCenter
	*/
	scrollCenter: function(elementId, delay){

		const elId = TMS.getElement(elementId);

		if (elId !== null){

			var parentDom = elId.parentElement,
				parentHeight = parentDom.offsetHeight,
				elHeight = parseFloat(window.getComputedStyle(elId).height.replace('px', ''));

			if (delay === void 0 || Number(delay) === NaN){
				delay = 0;
			}

			setTimeout(function(){
				parentDom.scrollTo(0, (elId.offsetTop - ((parentHeight / 2) - (elHeight / 2))));
			}, delay);

		} else {
			TMS.warn(`Unable to scroll because DOM does not exist! (${elementId})`);
		}

	},

	/*
		setInnerHtml
	*/
	setInnerHtml: function(elementId, htmlData){
		const elId = TMS.getElement(elementId);
		if (elId !== null && elId.innerHTML !== htmlData){
			document.getElementById(elementId).innerHTML = htmlData;
		} else {
			TMS.warn(`Unable to set innerHTML because DOM does not exist or it contains the same innerHTML data (${elementId})`);
		}
	},

	/*
		Remove HTML DOM
	*/
	removeDOM: function(elementId){
		const elId = TMS.getElement(elementId);
		if (elId !== null){
			document.getElementById(elementId).remove();
		} else {
			TMS.warn(`Unable to remove DOM because DOM does not exist! (${elementId})`);
		}

	},

	/*
		Blur element
	*/
	blur: function(elementId){
		const elId = TMS.getElement(elementId);
		if (elId !== null){
			document.getElementById(elementId).blur();
		} else {
			TMS.warn(`Unable to blur DOM because DOM does not exist! (${elementId})`);
		}
	},

	/*
		Get HTML child count
	*/
	getChildCount: function(elementId){

		var res = 0,
			elId = TMS.getElement(elementId);

		if (elId !== null){

			res = document.getElementById(elementId).childElementCount;
			if (res < 0){
				res = 0;
			}

			return res;

		} else {
			TMS.warn(`Unable to get html collection because DOM does not exist! (${elementId})`);
		}

	},

	/*
		Get HTML element rect
	*/
	getRect: function(elementId){

		var res,
			elId = TMS.getElement(elementId);

		if (elId !== null){
			res = elId.getBoundingClientRect();
		} else {
			TMS.warn(`Unable to get rect because DOM does not exist! (${elementId})`);
		}

		return res;

	},

	/*
		Get HTML dom coords.
		Get element coords based on parent element 

		T:  Y
		L:  X
		W:  Width
		H:  Height
		WL: X Pos. + It's own width
		TH: Y Pos. + It's own height
	*/
	getCoords: function(elementId){

		var res,
			elId = TMS.getElement(elementId);

		if (elId !== null){

			var top = elId.offsetTop,
				left = elId.offsetLeft,
				width = elId.getBoundingClientRect().width,
				height = elId.getBoundingClientRect().height;

			res = {
				T: top,
				L: left,
				W: width,
				H: height,
				WL: parseFloat(width + left),
				TH: parseFloat(top + height)
			}

		} else {
			TMS.warn(`Unable to get coords because DOM does not exist! (${elementId})`);
		}

		return res;
	}
	
}));

// Export module
exports = TMS;