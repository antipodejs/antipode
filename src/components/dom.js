import platform from './platform';

	/**
	* dom
	*/
	const global = (function() {
		return (new Function('return this')())
	})();

	const escape = (text) => {
		return text !== null ? String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
	};

	/**
	* @private
	*/
	const getComputedStyle = (node) => {
		if(platform.ie < 9 && node && node.currentStyle) {
			//simple global.getComputedStyle polyfill for IE8
			let computedStyle = utils.clone(node.currentStyle);
			computedStyle.getPropertyValue = this._ie8GetComputedStyle;
			computedStyle.setProperty = function() {
				return node.currentStyle.setExpression.apply(node.currentStyle, arguments);
			};
			computedStyle.removeProperty = function() {
				return node.currentStyle.removeAttribute.apply(node.currentStyle, arguments);
			};
			return computedStyle;
		} else {
			return global.getComputedStyle && node && global.getComputedStyle(node, null);
		}
	};

	/**
	* @private
	*/
	const getComputedStyleValue = (node, property, computedStyle) => {
		let s   = computedStyle || getComputedStyle(node),
			nIE = platform.ie;

		s = s ? s.getPropertyValue(property) : null;

		if (nIE) {
			let oConversion = {
				'thin'   : (nIE > 8 ? 2 : 1) + 'px',
				'medium' : (nIE > 8 ? 4 : 3) + 'px',
				'thick'  : (nIE > 8 ? 6 : 5) + 'px',
				'none'   : '0'
			};
			if (typeof oConversion[s] != 'undefined') {
				s = oConversion[s];
			}

			if (s == 'auto') {
				switch (property) {
				case 'width':
					s = node.offsetWidth;
					break;
				case 'height':
					s = node.offsetHeight;
					break;
				}
			}
		}

		return s;
	};

	const hasClass = (node, s) => {
		if (!node || !node.className) { return; }
		return (' ' + node.className + ' ').indexOf(' ' + s + ' ') >= 0;
	};

	const addClass = (node, s) => {
		if (node && !hasClass(node, s)) {
			let ss = node.className;
			node.className = (ss + (ss ? ' ' : '') + s);
		}
	};

	const removeClass = (node, s) => {
		if (node && hasClass(node, s)) {
			let ss = node.className;
			node.className = (' ' + ss + ' ').replace(' ' + s + ' ', ' ').slice(1, -1);
		}
	};

	const addRemoveClass = (node, s, need) => {
		let has = hasClass(node, s);
		if (need) {
			!has && addClass(node, s);
		} else {
			has && removeClass(node, s);
		}
	};

	const setOpacity = (element, value) => {

	    if (value == 1 || value === '') {
	    	value = '';
	    } else if (value < 0.00001) {
	    	value = 0;
	    }
	    element.style.opacity = value;
	    return element;
	}

	const setStyle = (element, styles) => {
	 
	    var elementStyle = element.style, match;

	    if (typeof styles == "string") {
			elementStyle.cssText += ';' + styles;
			if (~styles.search('opacity')) {
				let opacity = styles.match(/opacity:\s*(\d?\.?\d*)/)[1];
				setOpacity(element, opacity);
			}
			return element;
	    }

	    for (let property in styles) {
	    	if (property === 'opacity') {
	    		setOpacity(element, styles[property]);
	      	} else {
	        	let value = styles[property];
	        	if (property === 'float' || property === 'cssFloat') {
	          		property = typeof(elementStyle.styleFloat) == "undefined"
	          			? 'cssFloat' 
	          			: 'styleFloat';
	        	}
	        	elementStyle[property] = value;
	      	}
	    }

	    return element;
	}

	const camelize = (str) => {
    	return str.replace(/-+(.)?/g, function(match, chr) {
      		return chr ? chr.toUpperCase() : '';
    	});
  	}

  	const capitalize = (str) => {
    	return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
  	}

  	const normalizeStyleName = (style) => {
    	if (style === 'float' || style === 'styleFloat')
      		return 'cssFloat';
    	return camelize(style);
  	}

	const getStyle = (element, style) => {

	    style = normalizeStyleName(style);

	    let value = element.style[style];
	    
	    if (!value || value === 'auto') {
	      var css = document.defaultView.getComputedStyle(element, null);
	      value = css ? css[style] : null;
	    }

	    if (style === 'opacity') {
	    	return value 
	    		? parseFloat(value) 
	    		: 1.0;
	    }

	    return value === 'auto' ? null : value;
	}


	export default {
		escape,
		getComputedStyleValue,
		hasClass,
		addClass,
		addRemoveClass,
		removeClass,
		setStyle,
		getStyle
	};