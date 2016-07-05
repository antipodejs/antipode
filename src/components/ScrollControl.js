/**
* Contains the declaration for the {@link Scroll} class.
* @module ScrollControl
*/
class Scroll {

    /**
    * @private
    */
    constructor (view, cb) {

        let indicator, reference, velocity,
            frame, timestamp, ticker,
            amplitude, target,   
            timeConstant = 175, // ms
            xform = 'transform',
            pressed = false,
            delta_prev = 0,
            offset = 0,
            max = 0,
            min = 0;

        this.setScroll = (s) => {
            _scroll(s);
        }

        this.scrollTo = (y, animate) => {
            scrollTo(y, animate);
        }

        /**
        * @private
        */
        const requestAnimationFrame = (() => {

            const w = window;
            return w.requestAnimationFrame ||
                w.webkitRequestAnimationFrame ||
                w.mozRequestAnimationFrame ||
                w.oRequestAnimationFrame ||
                w.msRequestAnimationFrame ||
                function (callback, element) {
                    w.setTimeout(callback, 16.7);
                };
            }
        )()

        /**
        * @private
        */
        const _scroll = ((y) => {

            let prev = offset;
            offset = (y > this.max) ? this.max : (y < min) ? min : y; 
            (prev != offset) && this.scroll(offset);
        }).bind(this)

        /**
        * @private
        */
        const track = () => {

            let now, elapsed, delta, v; 
            now = Date.now();
            elapsed = now - timestamp;
            timestamp = now;
            delta = offset - frame;
            frame = offset;
            v = 1000 * delta / (1 + elapsed);
            velocity = 0.9 * v + 0.2 * velocity;
        }

        /**
        * @private
        */
        const autoScroll = () => {

            let elapsed, delta;
            if (amplitude) {
                elapsed = Date.now() - timestamp;
                delta = -amplitude * Math.exp(-elapsed / timeConstant);
                if ((Math.abs(delta - delta_prev) > .1 ) && (delta > 0.8 || delta < -0.8)) {
                    _scroll(target + delta);
                    delta_prev = delta;
                    requestAnimationFrame(autoScroll);
                } else {
                   scrollBarFideOut(); 
                }
            }
        }

        const scrollTo = (y, animate) => {

            let maxAnimateDelta = 1000;

            if (animate) {
                if (y - offset > maxAnimateDelta) {
                    offset = y - maxAnimateDelta;
                } else if (offset - y > maxAnimateDelta) {
                    offset = y + maxAnimateDelta;
                }

                amplitude = y - offset;
                target = y;
                timestamp = Date.now();
                requestAnimationFrame(autoScroll);
            } else {
                amplitude = 0;
                _scroll(y);
            }
        }

        /**
        * @private
        */
        const tap = (e) => {

            pressed = true;
            reference = e.clientY;
            velocity = amplitude = 0;
            frame = offset;
            timestamp = Date.now();
            clearInterval(ticker);
            ticker = setInterval(track, 100);
            e.preventDefault();
            e.stopPropagation();
            scrollBarFideIn();
            document.querySelector('html')
                .addEventListener('mouseup', scrollEndOfOutSide, true);
            return false;
        }

        /**
        * @private
        */
        const drag = (e) => {

            let delta;
            if (pressed) {
                delta = reference - e.clientY;
                if (delta > 0.1 || delta < -0.1) {
                    reference = e.clientY;
                    _scroll(offset + delta);
                }
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        /**
        * @private
        */
        const release = (e) => {

            if (pressed) {
                pressed = false;
            } else {
                return true;
            }
            clearInterval(ticker);
            if (velocity > 1 || velocity < -1) {
                amplitude = 0.9 * velocity;
                target = Math.round(offset + amplitude);
                timestamp = Date.now();
                requestAnimationFrame(autoScroll);
            } else {
                scrollBarFideOut();
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        /**
        * @private
        */
        const scrollEndOfOutSide = (e) => {

            release(e);  
            document.querySelector('html')
                .removeEventListener('mouseup', scrollEndOfOutSide, true);
        }

        /**
        * @private
        */
        const onWheel = (e) => {

            e = e || window.event;
            tap(e);
            velocity = e.deltaY * 4; 
            release(e);

            e.preventDefault();
            e.stopPropagation();
        }

        /**
        * @private
        */
        const scrollBarFideIn = (() => {

            this.scrollBarFideIn();
        }).bind(this)

        /**
        * @private
        */
        const scrollBarFideOut = (() => {

            this.scrollBarFideOut();
        }).bind(this)

        // touch event
        if (typeof window.ontouchstart !== 'undefined') {
            view.addEventListener('touchstart', tap);
            view.addEventListener('touchmove', drag);
            view.addEventListener('touchend', release);
        }
        view.addEventListener('mousedown', tap);
        view.addEventListener('mousemove', drag);
        view.addEventListener("mousewheel", onWheel);

        ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
            var e = prefix + 'Transform';
            if (typeof view.style[e] !== 'undefined') {
                xform = e;
                return false;
            }
            return true;
        });
    }

    /**
    * @private
    */
    scroll () {}

    /**
    * @private
    */
    scrollBarFideIn () {}

    /**
    * @private
    */
    scrollBarFideOut () {}

    /**
    * @private
    */
    getMaxHeight() {

        return this.max;
    }

    /**
    * @private
    */
    setMaxHeight(m) {

        this.max = m;
    }

};

export default Scroll;
