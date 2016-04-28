import _ from 'lodash';
import Atom from './Atom';

/**
* Contains the declaration for the {@link Collection} class.
* @module Collection
*/
class Collection extends Atom { 
	
	/**
	* @private
	*/
	constructor (params) {

		super(
			_.assignIn({
				collection: null,
				uid_field_name: 'id',
				models: [],
				data: {
					length: 0
				}
			}, params)
		);
	}

	/**
	* @private
	*/
	initial (models) {
		
		this.models = models;
		this.set('length', models.length);
	}

	/**
	* @private
	*/
	commit (models) {

		if (!_.isObject) {

			throw new Error('Models must have Object or Array of objects');

		} else {

			models = _.isArray(models) ? models : [models];

			var model, position, id, field_id = this.uid_field_name;

			for (var i = 0, counts = models.length; i < counts; ++i) {

				model = models[i];
				id = model[this.uid_field_name]; 

				var m = _.find(this.models, function(m) { return m[field_id] == id }); 

				if (!m) {
					this.models.push(model);
				} else {
					if (!_.isEqual(m, model)) {
						_.merge(m, model);
						m.__change && m.__change(model);
					}
				}
			}
		}
	}

	/**
	* @private
	*/
	at (index) {
		
		return this.models[index];
	}

	/**
	* @private
	*/
	getRange (index, counts) {

		return 	counts > 0 
				? this.models.slice(index, counts + index)
				: this.models.slice(index + counts + 1, index + 1); 
	}

	/**
	* @private
	*/
	cut (index, counts) {

		let removed = this.models.splice(index, counts);
		this.set('length', this.models.length);
		return removed;
	}

	/**
	* @private
	*/
	insert (after, models) {

		Array.prototype.splice.apply(this.models, [after, 0].concat(models));
		this.set('length', this.models.length);
	}

}

export default Collection;