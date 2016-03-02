let pointer_down_events = [ 'touchstart', 'pointerdown', 'MSPointerDown', 'mousedown' ];
let pointer_move_events = [ 'touchmove', 'pointermove', 'MSPointerMove', 'mousemove' ];
let pointer_up_events = [ 'touchend', 'pointerup', 'MSPointerUp', 'mouseup', 'touchcancel', 'pointercancel', 'MSPointerCancel', 'mousecancel' ];
let resize_events = [ 'orientationchange', 'resize' ];
let transitionend_events = [ 'transitionend', 'webkitTransitionEnd', 'oTransitionEnd', 'MSTransitionEnd' ];

class EventHandler {
    constructor(dom_element) {
        this.cb = {
            // Note: This are meant to represents all clicker/pointer types, e.g. mouse, touch, ...
            //       I used pointer* since w3c is standardizing it and it will represent same thing in all devices.
            //       Don't use PEP.js, (pointerevents polyfill, it is uberly slow).
            pointer: {
                down: [],
                move: [],
                up: []
            },
            resize: [],
            transitionend: []
        };

        this.dom_element = dom_element || window;

        if (this.dom_element) {
            pointer_down_events.forEach(event => this.dom_element.addEventListener(event, this, false));
            pointer_move_events.forEach(event => this.dom_element.addEventListener(event, this, false));
            pointer_up_events.forEach(event => this.dom_element.addEventListener(event, this, false));
            resize_events.forEach(event => this.dom_element.addEventListener(event, this, false));
            transitionend_events.forEach(event => this.dom_element.addEventListener(event, this, false));
        }
    }

    /**
     * Note: Class destructor is a fantasy, even in es6, thus must be called manually.
     */
    destructor() { this.unbind_events(); }

    unbind_events() {
        if (this.dom_element) {
            pointer_down_events.forEach(event => this.dom_element.removeEventListener(event, this, false));
            pointer_move_events.forEach(event => this.dom_element.removeEventListener(event, this, false));
            pointer_up_events.forEach(event => this.dom_element.removeEventListener(event, this, false));
            resize_events.forEach(event => this.dom_element.removeEventListener(event, this, false));
            transitionend_events.forEach(event => this.dom_element.removeEventListener(event, this, false));
        }
    }

    /**
     * Use this instead of handing this._handleEvent to keep the "this" context of _handleEvent method.
     * @returns {Function}
     */
    getHandler() {
        return (e) => this.handleEvent(e);
    }

    on_pointer_events(cb, event_type) {
        if (event_type in this.cb.pointer) {
            this.cb.pointer[event_type].push(cb);
        } else {
            throw "Unrecognized pointer event-type"
        }

        return this;
    }

    off_pointer_events(cb, event_type) {
        if (event_type in this.cb.pointer) {
            let index = this.cb.pointer[event_type].indexOf(cb);
            let cb_exist = index !== -1;
            if (cb_exist) { this.cb.pointer[event_type].splice(index, 1); }
        } else {
            throw "Unrecognized pointer event-type"
        }

        return this;
    }

    on_resize(cb) {
        this.cb.resize.add(cb);
        return this;
    }

    off_resize(cb) {
        let index = this.cb.resize.indexOf(cb);
        let cb_exist = index !== -1;
        if (cb_exist) { this.cb.resize.splice(index, 1); }
        return this;
    }

    on_transitionend(cb) {
        this.cb.transitionend.add(cb);
        return this;
    }

    off_transitionend(cb) {
        let index = this.cb.transitionend.indexOf(cb);
        let cb_exist = index !== -1;
        if (cb_exist) { this.cb.transitionend.splice(index, 1); }
        return this;
    }

    _pointer_handler(e, event_type) {
        if (event_type in this.cb.pointer) {
            this.cb.pointer[event_type].forEach(cb => cb(e));
        } else {
            throw "Unrecognized pointer event-type"
        }
    }

    _resize_handler(e) {
        this.cb.resize.forEach(cb => cb(e));
        return this;
    }

    _transitionend_handler(e) {
        this.cb.transitionend.forEach(cb => cb(e));
        return this;
    }

    handleEvent(e) {
        switch ( e.type ) {
            case 'touchstart':
            case 'pointerdown':
            case 'MSPointerDown':
            case 'mousedown':
                this._pointer_handler(e, 'down');
                break;
            case 'touchmove':
            case 'pointermove':
            case 'MSPointerMove':
            case 'mousemove':
                this._pointer_handler(e, 'move');
                break;
            case 'touchend':
            case 'pointerup':
            case 'MSPointerUp':
            case 'mouseup':
            case 'touchcancel':
            case 'pointercancel':
            case 'MSPointerCancel':
            case 'mousecancel':
                this._pointer_handler(e, 'up');
                break;
            case 'orientationchange':
            case 'resize':
                this._resize_handler(e);
                break;
            case 'transitionend':
            case 'webkitTransitionEnd':
            case 'oTransitionEnd':
            case 'MSTransitionEnd':
                this._transitionend_handler(e);
                break;
        }
    }
}

module.exports = {
    EventHandler: EventHandler,
    isMobile: (function() {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    })()
};
