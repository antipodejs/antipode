import Component from './Component';
import dom from './dom';
import sbstyle from './scroll-bar.css';

/**
* Contains the declaration for the {@link ScrollBar} class.
* @module ScrollBar
*/
class ScrollBar extends Component {

    constructor(params) {

        super(_.merge({

                container: undefined,
                sliderTop: 0,

                data: {
                    orientation: 'vertical',
                    sliderLengthPx: 40,
                    sliderPosition: 0,
                    sliderBarLength: undefined,
                    scrollerLength: params.scrollerLength || 3000,
                    scrollerPosition: 0
                },

                template: [
                    '<div id="sliderBar" on-mousedown="mousedownSliderBar(event)">',
                        '<div id="prevButton" on-mousedown="navButtonClick(\'prev\')">',
                            '<div id="prevButtonArrow"></div>',
                        '</div>',
                        '<div id="sliderTrack" on-click="sliderTrackClick(event)">',
                            '<div id="slider" on-mousedown="mouseDown(event)"></div>',
                        '</div>',
                        '<div id="nextButton" on-mousedown="navButtonClick(\'next\')">',
                            '<div id="nextButtonArrow"></div>',
                        '</div>',
                    '</div>'
                ],

                on: {
                    mousedownSliderBar (event) {
                        event.preventDefault();
                        event.stopPropagation();
                    },

                    mouseDown (event) {
                        this.startOffset =   event.clientY - this.sliderTop;
                        document.querySelector('html')
                            .addEventListener('mouseup', this.scrollEndOfOutSide = scrollEndOfOutSide.bind(this), true);
                        document.querySelector('html')
                            .addEventListener('mousemove', this.sliderMove = sliderMove.bind(this), true);
                    },

                    navButtonClick (dir) {
                        const 
                            scrollerPosition = this.get('scrollerPosition'),
                            scrollerLength = this.get('scrollerLength');
                        if (dir === 'next') {
                            this.scrollTo(scrollerPosition + this.sliderTrackLength / 3);
                        } else {
                            this.scrollTo(scrollerPosition - this.sliderTrackLength / 3);
                        }
                    },

                    sliderTrackClick (event) {
                        const 
                            offsetY = event.offsetY,
                            sliderPosition = this.get('sliderPosition'),
                            sliderLengthPx = this.get('sliderLengthPx'),
                            scrollerPosition = this.get('scrollerPosition');

                        if (offsetY < sliderPosition || offsetY > (sliderPosition + sliderLengthPx)) {
                            if (offsetY < sliderPosition) {
                                this.scrollTo(scrollerPosition - this.sliderTrackLength / 1.2);
                            } else if (offsetY > (sliderPosition + sliderLengthPx)) {
                                this.scrollTo(scrollerPosition + this.sliderTrackLength / 1.2);
                            }
                        }
                    }
                }
            }, params)
        );

        this.observe('sliderLengthPx', (was, is) => {
            if (is > this.sliderTrackLength) {
                this.data.sliderLengthPx = this.sliderTrackLength;
            }
            let params = {};
            params[this.unitMeasure] = this.data.sliderLengthPx + 'px';
            dom.setStyle(this.slider, params);
            this.refresh();
        });

        this.observe('sliderPosition', (was, is) => {
            if (is < 0) {
                this.data.sliderPosition = 0;
            } else  if (is > this.sliderTrevelRange) {
                this.data.sliderPosition = this.sliderTrevelRange;
            };

            let params = {};
            params[this.startMeasure] = this.data.sliderPosition + 'px';
            dom.setStyle(this.slider, params);
            this.sliderTop = this.data.sliderPosition;
            
        });

        this.observe('scrollerPosition', (was, is) => {
            console.log('scrollerPosition ====>>>> ', is);
            this.eventScroll(is);
        });

        const sliderMove = (e) => {
            let offset = e.clientY - this.startOffset;
            (offset < 0) && (offset = 0);
            (offset > this.sliderTrackLength) && (offset = this.sliderTrackLength);
            this.set('sliderPosition', offset);

            let scrollerPosition = offset / this.sliderTrevelRange * this.data.scrollerLength;
            (scrollerPosition < 0) && (scrollerPosition = 0);
            (scrollerPosition > this.data.scrollerLength) && (scrollerPosition = this.data.scrollerLength);
            this.set('scrollerPosition', scrollerPosition);

            e.preventDefault();
            e.stopPropagation();
        }

        const scrollEndOfOutSide = (e) => {
            document.querySelector('html')
                .removeEventListener('mouseup', this.scrollEndOfOutSide, true);
            document.querySelector('html')
                .removeEventListener('mousemove', this.sliderMove, true);
        }
    }

    scrollTo (position) {
        let scrollerPosition = position;
        (scrollerPosition < 0) && (scrollerPosition = 0);
        (scrollerPosition > this.data.scrollerLength) && (scrollerPosition = this.data.scrollerLength);
        this.set('scrollerPosition', scrollerPosition);

        const sliderPosition = (scrollerPosition / this.data.scrollerLength) * this.sliderTrackLength;
        this.set('sliderPosition', sliderPosition);
    }

    refresh () {
         
        this.unitMeasure = this.get('orientation') === 'vertical' ? 'height' : 'width';
        this.startMeasure = this.unitMeasure === 'height' ? 'top' : 'left';

        const    
            prevBtLength = parseFloat( dom.getStyle(this.element.querySelector('#prevButton'), this.unitMeasure) ),
            nextBtLength = parseFloat( dom.getStyle(this.element.querySelector('#nextButton'), this.unitMeasure) ),
            totalLength = parseFloat( dom.getStyle(this.element, 'height') ),
            sliderLength = this.get('sliderLengthPx');

        this.sliderTrackLength = totalLength - prevBtLength - nextBtLength;

        let measure = { };
        measure[this.unitMeasure] = this.sliderTrackLength + 'px';
        measure[this.startMeasure] = prevBtLength + 'px';
        dom.setStyle(this.element.querySelector('#sliderTrack'), measure);

        measure = { };
        measure[this.unitMeasure] = sliderLength + 'px';
        dom.setStyle(this.slider, measure);

        this.trackLength = dom.getStyle(this.element, 'height');
        this.sliderTrevelRange = this.sliderTrackLength - sliderLength;
    }

    rendered () {
        this.slider = this.element.querySelector('#slider');
        this.refresh();
    }

    eventScroll () {}
}

export default ScrollBar;