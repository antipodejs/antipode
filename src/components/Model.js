import _ from 'lodash';

/**
* Contains the declaration for the {@link Model} class.
* @module Model
*/
class Model {

	/**
	* @private
	*/
	constructor(model) {

		this.m = model || {};
	}

	/**
	* @private
	*/
	set (m) {

		!_.isEqual(m, this.m) && (this.observe(m, this.m), this.m = _.assign(m));
	}

	/**
	* @private
	*/
	get () {

		return this.m;
	}

	/**
	* @private
	*/
	observe (is, was) {
	}
};

export default Model;