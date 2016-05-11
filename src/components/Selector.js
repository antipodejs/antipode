import Atom from './Atom';

/**
* Contains the declaration for the {@link Selector} class.
* @module Selector
*/
class Selector extends Atom {

	constructor (params = {}) {
		super(
			Object.assign({
				 _sel: {},
				multi: true
			}, params)
		);
	}

	get (key) {
		return !!this._sel[key];
	}

	set (key, state) {
		if (state === true || typeof(state) == "undefined") {
			!this.multi && (this._sel = {});
			this._sel[key] = true;
		} else if (state === false && this._sel[key]) {
			delete this._sel[key];
		}
	}

	clear () {
		this._sel = {};
	}

	getAll () {
		return Object.keys(this._sel);
	}
}

export default Selector;