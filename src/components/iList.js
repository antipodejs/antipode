import VDataRepeater from './VDataRepeater';
import ScrollControl from './ScrollControl';
import dom from './dom';

class iList extends VDataRepeater {

	constructor(params) {
		super(Object.assign({
			template: `
				<div style="position: relative; height: 200px; width: 180px; border: 1px gray solid; display: inline-block; background-color: #878FA7; padding-left: 10px; overflow: hidden;" on-click="selectItem">
		  			<components></components>
		  			<div id="sliderBar" on-mouseout="mout(event)" on-mousemove="mmove(event)" style="position: absolute; top: 0; right: 0; bottom: 0; height: 100%; width: 5px; background-color: #707676;">
		  				<div id="startArrow" style="position: ablolute; top: 0; height: 20px; width: 5px ;">^</div>
		  				<div id="endArrow" style="position: absolute; bottom: 0;  height: 20px; width: 5px;">v</div>
		  				<div id="slider" on-mousedown="mDown(event)" style="position: absolute; top: 0px; right: 0px; height: 20px; width: 5px; background-color: #BABBBB;"></div>	
		  			</div>
				</div>`,

			sliderTop: 0,
// TODO: Here not finished job!!! ATEND IMMEDIATELY !!!
			on: {

				"mout": (e) => {
					console.log('mout ', e);
				},

				"mmove": (e) => {
					console.log('mouseMove ', e);
				},

				"MouseEvent":  (e) => {

					if (~[this.sliderBar, this.startArrow, this.endArrow].indexOf(e.srcElement)) {
			
						if (e.type == 'mouseover') {
							console.log('over ', e);

							if (e.offsetY < this.sliderTop) {
								console.log('WOW TOP')
								dom.setStyle(this.startArrow, {
									opacity: 1
								});
							} else {
								console.log('e.clientY < this.sliderTop = ', e.clientY, this.sliderTop);
							}
							if (e.offsetY > this.sliderTop + 20) {
								dom.setStyle(this.endArrow, {
									opacity: 1
								});
							}
						} else {
							console.log('out this.startArrow', e, this.startArrow);
							dom.setStyle(this.startArrow, {
								opacity: 0
							});
							dom.setStyle(this.endArrow, {
								opacity: 0
							});
						}
					}
				},

				mDown (e) {

					this.startOffsetY = e.offsetY;
					this.startScroll = this.data.scrollPx;

					document.querySelector('html')
                		.addEventListener('mouseup', scrollEndOfOutSide2, true);
                	document.querySelector('html')
                		.addEventListener('mousemove', sliderMove2, true);
				}
			}
		}, params));

		const sliderMove2 = (e) => {

			let scr = e.clientY - this.startOffsetY - 20; // TODO: Change to const !! and below..

			(scr < 0) && (scr = 0);
			(scr > 180) && (scr = 180);
			this.Scroller.setScroll(scr / 180 * 2800);

			e.preventDefault();
		    e.stopPropagation();
		    return false;
		}

		const scrollEndOfOutSide2 = (e) => {
            document.querySelector('html')
                .removeEventListener('mouseup', scrollEndOfOutSide2, true);
            document.querySelector('html')
                .removeEventListener('mousemove', sliderMove2, true);
        }

		this.Scroller = new ScrollControl(this.$parent);
    	this.Scroller.scroll = this.scroll.bind(this);
    	this.maxHeight = this.Scroller.getMaxHeight;
    	this.Scroller.max = (this.collection.models.length - this.data.numItems + 3) * this.data.deltaPx;

	}

	scroll (offset) {
		let f = Math.ceil(offset / (this.data.deltaPx));

		this.data.scrollPx = offset;
	    this.set('first', f);
	    this.positionChildren();

	    this.sliderTop = ((offset / (this.Scroller.max)) * 180);
    	this.slider && (this.slider.style.top = this.sliderTop + 'px');
	}

	rendered () {
		super.rendered();
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

};

export default iList;