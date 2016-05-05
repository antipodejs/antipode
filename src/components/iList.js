import VDataRepeater from './VDataRepeater';
import ScrollControl from './ScrollControl';
import istyle from './iList.css';
import dom from './dom';

class iList extends VDataRepeater {

	constructor(params) {

		super(_.merge({
			template:`
				<div class="infinitelist" on-click="selectItem">
		  			<components></components>
						<div id="sliderBar" on-mouseover="mover(event)"
										on-mouseout="mout(event)"
										on-mousemove="mmove(event)">
						<div id="startArrow" on-click="pgShift('Up')"></div>
						<div id="endArrow" on-click="pgShift('Down')"></div>
						<div id="slider" on-mousedown="mDown(event)" style="height: {{sliderWidthPx}}px;"></div>
					</div>
				</div>`,

			sliderTop: 0,
			unVisibleItems: 3,

			on: {

				"pgShift": (dir) => {
					dir == 'Up' ? this.pgUp() : this.pgDown();
				},

				"mout": (e) => {
					dom.setStyle(this.startArrow, {
						display: 'none'
					});
					dom.setStyle(this.endArrow, {
						display: 'none'
					});
				},

				"mover": (e) => {
					if (this.slider !== e.srcElement) {
						if (Math.min(e.pageY, e.offsetY) < this.sliderTop) {
							dom.setStyle(this.startArrow, {
								display: 'block',
								height: this.sliderTop + 'px'
							});
						} else if (e.pageY > this.sliderTop + this.data.sliderWidthPx) {
							dom.setStyle(this.endArrow, {
								display: 'block',
								height: '100%',
								top: this.sliderTop + this.data.sliderWidthPx + 'px'
							});
						}
					}
				},

				mDown (e) {
					this.startOffset =   e.clientY - this.sliderTop;
					document.querySelector('html')
						.addEventListener('mouseup', this.scrollEndOfOutSide = scrollEndOfOutSide.bind(this), true);
                	document.querySelector('html')
						.addEventListener('mousemove', this.sliderMove = sliderMove.bind(this), true);
				}
			}
		}, params));

		const sliderMove = (e) => {

			let scr = e.clientY - this.startOffset;

			(scr < 0) && (scr = 0);
			(scr > this.data.sliderWayPx) && (scr = this.data.sliderWayPx);
			this.Scroller.setScroll(scr / this.data.sliderWayPx * this.data.scrollerWayPx);

			e.preventDefault();
		    e.stopPropagation();
		    //return false;
		}

		const scrollEndOfOutSide = (e) => {
            document.querySelector('html')
                .removeEventListener('mouseup', this.scrollEndOfOutSide, true);
            document.querySelector('html')
                .removeEventListener('mousemove', this.sliderMove, true);
        }

		this.Scroller = new ScrollControl(this.$parent);
    	this.Scroller.scroll = this.scroll.bind(this);

	}

	scroll (offset) {
		let f = Math.ceil(offset / (this.data.deltaPx));

		this.data.scrollPx = offset;
	    this.set('first', f);
	    this.positionChildren();

	    this.sliderTop = ((offset / (this.Scroller.max)) * this.data.sliderWayPx);
    	this.slider && (this.slider.style.top = this.sliderTop + 'px');
	}

	reset () {
		this.data.numVisibleItems = this.data.numItems - this.unVisibleItems;
		this.data.listHeightPx = this.data.numVisibleItems * this.data.deltaPx;
		this.data.sliderWayPx = this.data.listHeightPx - this.data.sliderWidthPx;
		this.data.scrollerWayPx = this.data.deltaPx * (this.collection.models.length > this.data.numVisibleItems
				? this.collection.models.length - this.data.numVisibleItems
				: 0
			);
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

	rendered () {

		super.rendered();
		this.reset();
		this.positionChildren();
	}

	positionChildren () {
     
	    var oc = this.getComponents() || [],
	      	i, c, p, fi, li, is;

	    for (i = 0; i < oc.length; i++) {
	      c = oc[i];
	      p = this.getPosition(c.get('_index'));
	      c.$element.style['transform'] = 
				'translate3d(' + '0'/*((this.data.model.level || 0) * 25)*/ + 'px, ' + p + 'px, 0)';
	    }
	}

	getPosition (index, scroll) {
	    return (index * this.data.deltaPx) - Math.round(this.data.scrollPx);
	}

	calculatePgUpDownArrows () {
		dom.setStyle(this.startArrow, {
			height: this.sliderTop + 'px'
		});

		dom.setStyle(this.endArrow, {
			top: this.sliderTop + this.data.sliderWidthPx + 'px'
		});
	}

	pgUp () {
		this.Scroller.setScroll(this.data.scrollPx - (this.data.numVisibleItems - 1) * this.data.deltaPx);
		this.calculatePgUpDownArrows();
	}

	pgDown () {
		this.Scroller.setScroll(this.data.scrollPx + (this.data.numVisibleItems - 1) * this.data.deltaPx);
		this.calculatePgUpDownArrows();
	}

};

export default iList;