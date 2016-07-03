import VDataRepeater from './VDataRepeater';
import ScrollControl from './ScrollControl';
import ScrollBar from './ScrollBar';
import Collection from './Collection'
import istyle from './iList.css';
import dom from './dom';

class iList extends VDataRepeater {
    constructor(params) {
        super(_.merge({
            template:`
                <div class="infinitelist" on-click="selectItemEvent(event)">
                    <components></components>
                     <div id="scrollBar"></div>
                </div>
               `,
            data: {
                eventClickSelect: true
            },

            sliderTop: 0,
            unVisibleItems: 3,
            selected: {},

            on: {

                "selectItemEvent": (e) => {
                    if (this.data.eventClickSelect !== false) {
                        let item = antipode.in(e.srcElement); // todo
                        if (item.name == 'item') {
                            this.selectItem(item);
                        }
                    }
                }
            }
        }, params));

        if (!this.collection) {
            this.collection = new Collection();
        }

        this.Scroller = new ScrollControl(this.element);  // todo! chack it part!
        this.Scroller.scroll = this.scroll.bind(this);
    }

    selectItem (item) {
        const id = item.get('model.id');
        if (this.Selector.get(id)) {
            this.Selector.set(id, false);
            dom.removeClass(item.$element, this.Selector.selectedClass);
        } else {
            this.Selector.set(id, true);
            dom.addClass(item.$element, this.Selector.selectedClass);
        }
    }

    scroll (offset) {

        let f = Math.ceil(offset / (this.data.deltaPx));

        this.data.scrollPx = offset;
        this.set('first', f);
        this.positionChildren();
        this.ScrollBar.scrollTo(offset);
    }

    reset () {

        this.data.numVisibleItems = this.data.numItems - this.unVisibleItems;
        this.data.listHeightPx = this.data.numVisibleItems * this.data.deltaPx;
        this.maxHeight = this.Scroller.getMaxHeight;
        this.Scroller.max = this.data.scrollerWayPx
            ? (this.collection.models.length - this.data.numItems + this.unVisibleItems) * this.data.deltaPx
            : 0;

        let c = this.collection.models.length;

        if (this.getComponents().length > c) {
            this.removeComponent(this.getComponents().slice(c));
            this.data.scrollPx = this.data.first = 0;
        }

        dom.setStyle(this.sliderBar, {
            display: this.data.scrollerWayPx
                ? 'block'
                : 'none'
        });

        this.setExtend();
        this.positionChildren();
    }

    rendered() {
        super.rendered();
        this.ScrollBar = new ScrollBar({
            element: this.element.querySelector('#scrollBar'),
            scrollerLength: (this.collection.models.length - 8) * this.data.deltaPx,
            eventScroll: (position) => {
                this.scroll(position);
            }
        });
        this.fillComponents() && this.doIt();
    }

    positionChildren () {

        var oc = this.getComponents() || [],
              i, c, p, fi, li, is;

        for (i = 0; i < oc.length; i++) {
            c = oc[i];
            if (!c.set) continue;
            p = this.getPosition(c.get('_index2'));
            c.element.style['transform'] = 'translate3d(0, ' + p + 'px, 0)';
        }
    }

    getPosition (index, scroll) {

        return (index * this.data.deltaPx) - this.data.scrollPx;
    }

    setItems () {
        let oc = this.orderedChildren,
            c = this.getComponents(),
            comps = c.length,
            i = 0, p,
            cnt = oc.length;

        for (; i < cnt; ++i) {
            if (oc[i].num > -2 && oc[i].num < comps - 1) {
                p = (oc[i].index * this.data.deltaPx) - Math.round(this.data.scrollPx);
                c[i].set('_index2', oc[i].index);
                c[i].set('model', oc[i].model);
                c[i].updateValues();

                c[i].$.flag.dataUpdate({
                    flag: oc[i].model.id
                });
            }
        }
    }

    gotoRecord (rec) {

        let scroll = this.data.deltaPx * rec;
        this.Scroller.setScroll(scroll);
        this.scroll (scroll);
    }

};

export default iList;
