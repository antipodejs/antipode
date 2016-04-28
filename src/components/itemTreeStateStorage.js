import _ from 'lodash';

class itemTreeStateStorage {

	constructor(startStateOpen = true) {
		this.startStateOpen = startStateOpen;
		this.storage = {};
	}

	get (id) {
		return this.storage[id];
	}

	set (id, model) {
		this.storage[id] = _.assignIn({}, model);
	}

	isOpen (id) {
		return this.startStateOpen && (typeof this.storage[id] == "undefined");
	}

	open (id) {
		
		delete this.storage[id];
	}

	close (id) {
		this.storage[id] = true;
	}
}

export default itemTreeStateStorage;