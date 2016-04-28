import xhr from './xhr';
import itemTreeStateStorage from './itemTreeStateStorage';

class DataTreeManager {
	
	constructor (collection) {
		this.collection = collection;
		this.Indexer = {};
		this.closeStorage = new itemTreeStateStorage();
	};

	expandTree (items, after) {
		this.collection.insert(after + 1, items);
	}

	getChildren (id, after, url) {

		this.closeStorage.open(id);
		if (typeof(this.Indexer[id]) != "undefined") {
			this.expandTree(this.Indexer[id], after);
		} else {
			xhr.getJSON(
				url + id,
				function(response) {
					this.Indexer[id] = response;
					this.expandTree(this.Indexer[id], after);
				}.bind(this)
			);
		}
	}

	closeNode (id) {
		var p = this.collection.at(id),
			modelId = p.id,
			level = p.level,
			end = id;


		this.closeStorage.close(p.id);

		while((p = this.collection.at(++end)) && (p.level > level)) {};

		if (p) {
			this.Indexer[modelId] = this.collection.cut(id + 1, end - id - 1);
		} 

	}

	openTriggered (index, model) {
		let isOpen = this.closeStorage.isOpen(model.id);
		isOpen
			? this.closeNode (index)
			: this.getChildren(model.id, index)
	}
}

export default new DataTreeManager();
