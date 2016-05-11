import Component from './Component';
import Selector from './Selector';

class VDRepeater extends Component {

	constructor(params = {}, data = {}) {

		let repeaterComponents;

		if (params.components && params.components.length) {
			repeaterComponents = Object.assign({}, params.components[0]);
			delete params.components;
		}

		super(
			_.merge({
				orderedChildren: [],
				collection: null,
				data: {
					first: 0,
					numItems: 10,
					spacing: 1,
					itemHeight: 19,
					deltaPx: 0,
					scrollPx: 0,
					sliderWidthPx: 20
				}
			}, params)
		);

		this.Selector = new Selector({
			multi: true,
			selectedClass: 'selected'
		});

		this.set('deltaPx', this.data.itemHeight + this.data.spacing);

		this.observe('first', (was, is) => {
			this.setExtend();
		});

		this.repeaterComponents = repeaterComponents;
	}

	fillComponents () {

		let cnt;
		if (this.collection && this.repeaterComponents) {
			cnt = Math.min(this.collection.models.length, this.data.numItems - 2);
			while (cnt--) {
				this.insertComponent(this.repeaterComponents);
			}
		}
		return cnt;
	}

	rendered() {

		super.rendered();
		this.fillComponents() && this.doIt();
		this.slider = this.$element.querySelector('#slider');
		this.sliderBar = this.$element.querySelector('#sliderBar');
		this.startArrow = this.$element.querySelector('#startArrow');
		this.endArrow = this.$element.querySelector('#endArrow');
	}

	setExtend () {
		// First - need check amounts elements on screen
		// .... todo
		if (this.collection) {
			this.doIt();
		}
	}

	doIt () {

		var dd = this.collection,
			ddl = dd.models.length,
	        f = this.data.first,
	        st = this.data.scrollPx,
	        i, n, set, id, el;
	        
	    var fo = Math.floor( st / this.data.deltaPx ),
	        //fo = st > this.data.deltaPx ? fndx - 1 : fndx,
	        lo = Math.min(ddl, fo + this.data.numItems);

		this.orderedChildren = [];

	    for (i = fo; i < lo; ++i) {
			n = i - fo - (f > 1 ? 1 : 0);
			el = dd.at(i);

			this.orderedChildren[this.orderedChildren.length] =
			{
				index: i,
				n,
				selected: this.Selector.get(el['id']),
				model: _.clone(el)
			}
	    };

	    this.setItems && this.setItems();
	}
}

export default VDRepeater;