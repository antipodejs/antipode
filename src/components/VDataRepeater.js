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

        this.itemsByIndex = [];
        this.orderedChildren = [];
        this.ordModels = [];
    }

    fillComponents () {

        let cnt;
        if (this.collection && this.repeaterComponents) {
            cnt = Math.min(this.collection.models.length, this.data.numItems - 2); // todo: need to invest..
            while (cnt--) {
                this.insertComponent(this.repeaterComponents);
            }
        }
        
        return cnt;
    }


    setExtend () {
        // First - need check amounts elements on screen
        // .... todo
        if (this.collection) {
            this.doIt();
        }
    }

    assignItem (model, index, item = {}) {

        let itemsByIndex = this.itemsByIndex;
        let curModel = item.model ? item.model : (item.model = {});
        let curIndex = item.index;

        if (curModel !== model) {
            item.model = model;
            item.selected = this.Selector.get(model._uid);
        }

        if (curIndex !== index) {
            item.index = index;
        }

        itemsByIndex[index] = item;
        return item;
    }

    doIt () {
        var dd = this.collection,
            ddl = dd.models.length,
            f = this.data.first,
            st = this.data.scrollPx,
            children = this.orderedChildren,
            ord_models = this.ordModels,
            ord_models_st = [],
            fo = Math.floor( st / this.data.deltaPx ),
            i, num, set, id, model, lo, index,
            reused = [],
            needModels = {},
            c = [];

        if (st < 0) {
            console.error('scroll less than 0');
            return;
        }
            
        var fo = Math.floor( st / this.data.deltaPx );

        if (fo > 0) {
            fo = fo - 1;
        }
        lo = Math.min(ddl, fo + this.data.numItems + 2);

        for (i = fo; i < lo; ++i) {
            index = i - fo;
            model = dd.at(i);
            ord_models_st[ord_models_st.length] = model;
            var present = ord_models.indexOf(model);

            if (present > -1) {
                if (children[present].index !== i) {
                    children[present].index = i;
                    reused[reused.length] = present;
                }
                c[index] = children[present];
            } else {
                needModels[index] = {model, index: i};
            }
        };

        for (i = fo; i < lo; ++i) {
            index = i - fo;
            if (!c[index]) {
                c[index] = this.assignItem(dd.at(i), i, c[index]); // i
                delete needModels[index];
            }
        }

        // todo: need to check the rest in the needModels 
        //let keys_need = Object.keys(needModels);
        // console.log('KEYSSSS ===>>> ', keys_need);

        this.orderedChildren = c;
        this.ordModels = ord_models_st;
        this.setItems && this.setItems();
    }

}

export default VDRepeater;
