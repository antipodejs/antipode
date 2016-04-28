import _ from 'lodash';

class Atom {

	/**
	* @private
	*/
	constructor (params = {}) {

		_.assignIn(this, {
			$: {},
			data: {},
			_observers: {}
		}, params);
	}

	checkObservers (d, is, was) {
		let o;
		if (o = this._observers[d]) {
			o.forEach(function(handler) {
				handler(was, is);
			})
		}
	}

	/**
	* @public
	*/
	set (d, value) { 

		let s = d.split('.'), v, prev = eval('this.data.' + d);

		if (s.length - 1) {
			v = s.splice(-1);
		    (+v) && (v = +v);
			eval('this.data.' + s.join('.')) [v] = value;		
		} else {
			eval('this.data')[s[0]] = value;
		}
		value !== prev && this.checkObservers(d, value, prev);
	}

	/**
	* @public
	*/
	get(value, index) {

		return arguments.length == 0 
			? this.data
			: typeof (index) !== "undefined" 
				? eval('this.data.' + value)[index] 
				: eval('this.data.' + value);
	}

	/**
	* @private
	*/
	observer (changes) {

		const o = this._observers;

		changes.forEach((change) => {
	       	if (o[change.name]) {
	       		o[change.name].forEach((handler) => {
	       			handler(change.oldValue, this['data'][change.name]);
	       		});
	       	}
	   	});
	}

	/**
	* @public
	*/
	observe(value, handler) {

		if (typeof (this._observers[value]) == "undefined") {
			this._observers[value] = [];
		};

		this._observers[value].push(handler);
	}

	/**
	* @public
	*/
	unobserve(value = undefined) {

		if (value && this._obserers[value] && this._obserers[value].length) {
			delete this._obserers[value];
		}
		if (!value || !Object.keys(this._observers)) {
			this._obserers = [];
		}
	}

}

export default Atom;