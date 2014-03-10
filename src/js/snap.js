(function(win, doc) {

    'use strict';

    /**
     * Our default settings for a Snap instance
     * @type {Object}
     */
    var defaultSettings = {
        element: null,
        dragger: null,
        disable: 'none',
        addBodyClasses: true,
        hyperextensible: true,
        resistance: 0.5,
        flickThreshold: 50,
        transitionSpeed: 0.3,
        easing: 'ease',
        maxPosition: 266,
        minPosition: -266,
        tapToClose: true,
        touchToDrag: true,
        clickToDrag: true,
        slideIntent: 40, // degrees
        minDragDistance: 5
    };

    /**
     * Stores internally global data
     * @type {Object}
     */
    var defaultCache = {
        simpleStates: {
            opening: null,
            towards: null,
            hyperExtending: null,
            halfway: null,
            flick: null,
            translation: {
                absolute: 0,
                relative: 0,
                sinceDirectionChange: 0,
                percentage: 0
            }
        }
    };

    /**
     * Utilties
     */
    var utils = {};

    /**
      * Deeply extends two objects
      * @param  {Object} destination The destination object
      * @param  {Object} source      The custom options to extend destination by
      * @return {Object}             The desination object
      */
    utils.extend = function(destination, source) {
        var property;
        for (property in source) {
            destination[property] = source[property];
        }
        return destination;
    };

    /**
     * Checks if an element has a class name
     * @param  {Object}  el   The element to check
     * @param  {String}  name The class name to search for
     * @return {Boolean}      Returns true if the class exists
     */
    utils.hasClass = function(el, name){
        return (el.className).indexOf(name) !== -1;
    };

    /**
     * Adds a class name to an element
     * @param  {Object}  el   The element to add to
     * @param  {String}  name The class name to add
     */
    utils.addClass = function(el, name){
        if (!utils.hasClass(el, name)) {
            el.className += " " + name;
        }
    };

    /**
     * Removes a class name
     * @param  {Object} el   The element to remove from
     * @param  {String} name The class name to remove
     */
    utils.removeClass = function(el, name){
        if (utils.hasClass(el, name)) {
            el.className = (el.className).replace(name, "").replace(/^\s+|\s+$/g, '');
        }
    };

    /**
     * Searches the parent element until a specified attribute has been matched
     * @param  {Object} el   The element to search from
     * @param  {String} attr The attribute to search for
     * @return {Object|null}      Returns a matched element if it exists, else, null
     */
    utils.parentUntil = function(el, attr) {
        var isStr = typeof attr === 'string';
        while (el.parentNode) {
            if (isStr && el.getAttribute && el.getAttribute(attr)){
                return el;
            } else if (!isStr && el === attr){
                return el;
            }
            el = el.parentNode;
        }
        return null;
    };

    /**
     * Adds an event to an element
     * @param {Object} element   Element to add event to
     * @param {String} eventName The event name
     * @param {Function} func      Callback function
     */
    utils.addEvent = function(element, eventName, func) {
        if (element.addEventListener) {
            return element.addEventListener(eventName, func, false);
        } else if (element.attachEvent) {
            return element.attachEvent("on" + eventName, func);
        }
    };

    /**
     * Removes an event to an element
     * @param {Object} element   Element to remove event from
     * @param {String} eventName The event name
     * @param {Function} func      Callback function
     */
    utils.removeEvent = function(element, eventName, func) {
        if (element.addEventListener) {
            return element.removeEventListener(eventName, func, false);
        } else if (element.attachEvent) {
            return element.detachEvent("on" + eventName, func);
        }
    };

    /**
     * Prevents the default event
     * @param  {Object} e The event object
     */
    utils.preventEvent = function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    };

    /**
     * SNAP.JS
     */

    /**
     * Our Snap global that initializes our instance
     * @param {Object} opts The custom Snap.js options
     */
    var Snap = function(opts) {
        this.settings = {};
        this.cache = {};
        this.eventList = {};

        /* mixin both the default settings and user-specified options */
        utils.extend(this.settings, defaultSettings);
        utils.extend(this.settings, opts);

        /* make sure the user defined an element to attach to */
        if (!this.settings.element) { throw new Error('Cannot instantiate Snap without a specified element'); }

        /* mixin our initial state */
        utils.extend(this.cache, defaultCache);

        /* populate a few starter values for the cache */
        this.cache.vendor = this.vendor();
        this.cache.hasTouch = this.hasTouch();
        this.cache.canTransform = this.canTransform();

        /* start listening */
        this.listen();
    };

    /**
     * Compat
     */

    utils.extend(Snap.prototype, {
        /**
         * Determines if we are interacting with a touch device
         * @type {Boolean}
         */
        hasTouch: function() {
            return ('ontouchstart' in doc.documentElement || win.navigator.msPointerEnabled);
        },

        /**
         * Determines if the users browser supports CSS3 transformations
         * @return {[type]} [description]
         */
        canTransform: function(){
            return typeof this.settings.element.style[this.cache.vendor+'Transform'] !== 'undefined';
        },

        /**
         * Returns the appropriate event type based on whether we are a touch device or not
         * @param  {String} action The "action" event you're looking for: up, down, move, out
         * @return {String}        The browsers supported event name
         */
        eventType: function(action) {
            var eventTypes = {
                down: (this.cache.hasTouch ? 'touchstart' : this.settings.clickToDrag ? 'mousedown' : ''),
                move: (this.cache.hasTouch ? 'touchmove' : this.settings.clickToDrag ? 'mousemove' : ''),
                up: (this.cache.hasTouch ? 'touchend' : this.settings.clickToDrag ? 'mouseup': ''),
                out: (this.cache.hasTouch ? 'touchcancel' : this.settings.clickToDrag ? 'mouseout' : '')
            };
            return eventTypes[action];
        },

        /**
         * Returns the correct "cursor" position on both browser and mobile
         * @param  {String} t The coordinate to retrieve, either "X" or "Y"
         * @param  {Object} e The event object being triggered
         * @return {Number}   The desired coordiante for the events interaction
         */
        page: function(t, e){
            return (this.cache.hasTouch && e.touches.length && e.touches[0]) ? e.touches[0]['page'+t] : e['page'+t];
        },

        /**
         * Determines the browsers vendor prefix for CSS3
         * @return {String} The browsers vendor prefix
         */
        vendor: function(){
            var tmp = doc.createElement("div"),
                prefixes = 'webkit Moz O ms'.split(' '),
                i;
            for (i in prefixes) {
                if (typeof tmp.style[prefixes[i] + 'Transition'] !== 'undefined') {
                    return prefixes[i];
                }
            }
        },

        /**
         * Determines the browsers vendor prefix for transition callback events
         * @return {String} The event name
         */
        transitionCallback: function(){
            return (this.cache.vendor==='Moz' || this.cache.vendor==='ms') ? 'transitionend' : this.cache.vendor+'TransitionEnd';
        }
    });

    /**
     * Events
     */

    utils.extend(Snap.prototype, {
        /**
         * Dispatch a custom Snap.js event
         * @param  {String} type The event name
         */
        dispatchEvent: function(type) {
            if (typeof this.eventList[type] === 'function') {
                return this.eventList[type].call();
            }
        }
    });

    /**
     * Actions
     */

    utils.extend(Snap.prototype, {
        /**
         * Methods that handle translating the elements position
         */

        /**
         * Returns the amount an element is translated
         * @param  {Number} index The index desired from the CSS3 values of translate3d
         * @return {Number}       The amount of pixels an element is translated
         */
        matrix: function(index) {
            if (!this.cache.canTransform){
                return parseInt(this.settings.element.style.left, 10);
            } else {
                var matrix = win.getComputedStyle(this.settings.element)[this.cache.vendor+'Transform'].match(/\((.*)\)/),
                    ieOffset = 8;
                if (matrix) {
                    matrix = matrix[1].split(',');
                    if(matrix.length===16){
                        index+=ieOffset;
                    }
                    return parseInt(matrix[index], 10);
                }
                return 0;
            }
        },

        /**
         * Animates the pane by the specified amount of pixels
         * @param  {Number} n The amount of pixels to move the pane
         */
        easeTo: function(n) {
            if (!this.cache.canTransform) {
                this.cache.translation = n;
                this.x(n);
            } else {
                this.cache.easing = true;
                this.cache.easingTo = n;

                this.settings.element.style[this.cache.vendor+'Transition'] = 'all ' + this.settings.transitionSpeed + 's ' + this.settings.easing;

                /* Called when the element has finished transitioning */
                var that = this;
                var easeCallback = function(){
                    that.settings.element.style[that.cache.vendor+'Transition'] = '';
                    that.cache.translation = that.matrix(4);
                    that.cache.easing = false;

                    if (that.cache.easingTo===0) {
                        if (that.settings.addBodyClasses) {
                            utils.removeClass(doc.body, 'snapjs-right');
                            utils.removeClass(doc.body, 'snapjs-left');
                        }
                    }

                    that.dispatchEvent('animated');
                    utils.removeEvent(that.settings.element, that.transitionCallback(), that.easeCallback);
                };

                utils.addEvent(this.settings.element, this.transitionCallback(), easeCallback);
                this.x(n);
            }
            if (n===0) {
                this.settings.element.style[this.cache.vendor+'Transform'] = '';
            }
        },

        /**
         * Immediately translates the element on its X axis
         * @param  {Number} n Amount of pixels to translate
         */
        x: function(n) {
            if ((this.settings.disable==='left' && n>0) ||
               (this.settings.disable==='right' && n<0)
            ) { return; }

            if (!this.settings.hyperextensible) {
                if (n===this.settings.maxPosition || n>this.settings.maxPosition) {
                    n = this.settings.maxPosition;
                } else if (n===this.settings.minPosition || n<this.settings.minPosition) {
                    n = this.settings.minPosition;
                }
            }

            n = parseInt(n, 10);
            if (isNaN(n)) {
                n = 0;
            }

            if (this.cache.canTransform) {
                var theTranslate = 'translate3d(' + n + 'px,0,0)';
                this.settings.element.style[this.cache.vendor+'Transform'] = theTranslate;
            } else {
                this.settings.element.style.width = (win.innerWidth || doc.documentElement.clientWidth)+'px';

                this.settings.element.style.left = n+'px';
                this.settings.element.style.right = '';
            }
        },

        /**
         * Handles all the events that interface with dragging
         * @type {Object}
         */

        /**
         * Begins listening for drag events on our element
         */
        listen: function() {
            this.cache.translation = 0;
            this.cache.easing = false;

            utils.addEvent(this.settings.element, this.eventType('down'), this.startDrag);
            utils.addEvent(this.settings.element, this.eventType('move'), this.dragging);
            utils.addEvent(this.settings.element, this.eventType('up'), this.endDrag);
        },

        /**
         * Stops listening for drag events on our element
         */
        stopListening: function() {
            utils.removeEvent(this.settings.element, this.eventType('down'), this.startDrag);
            utils.removeEvent(this.settings.element, this.eventType('move'), this.dragging);
            utils.removeEvent(this.settings.element, this.eventType('up'), this.endDrag);
        },

        /**
         * Determines an angle between two points
         * @param  {Number} x The X coordinate
         * @param  {Number} y The Y coordinate
         * @return {Number}   The number of degrees between the two points
         */
        angleOfDrag: function(x, y) {
            var degrees, theta;
            // Calc Theta
            theta = Math.atan2(-(cache.startDragY - y), (cache.startDragX - x));
            if (theta < 0) {
                theta += 2 * Math.PI;
            }
            // Calc Degrees
            degrees = Math.floor(theta * (180 / Math.PI) - 180);
            if (degrees < 0 && degrees > -180) {
                degrees = 360 - Math.abs(degrees);
            }
            return Math.abs(degrees);
        },

        /**
         * Fired immediately when the user begins to drag the content pane
         * @param  {Object} e Event object
         */
        startDrag: function(e) {
            // No drag on ignored elements
            var target = e.target ? e.target : e.srcElement,
                ignoreParent = utils.parentUntil(target, 'data-snap-ignore');

            if (ignoreParent) {
                utils.dispatchEvent('ignore');
                return;
            }

            if (this.settings.dragger) {
                var dragParent = utils.parentUntil(target, this.settings.dragger);

                // Only use dragger if we're in a closed state
                if (!dragParent && (this.cache.translation !== this.settings.minPosition &&
                                    this.cache.translation !== this.settings.maxPosition
                )) {
                    return;
                }
            }

            utils.dispatchEvent('start');
            this.settings.element.style[this.cache.vendor+'Transition'] = '';
            this.cache.isDragging = true;
            this.cache.hasIntent = null;
            this.cache.intentChecked = false;
            this.cache.startDragX = this.page('X', e);
            this.cache.startDragY = this.page('Y', e);
            this.cache.dragWatchers = {
                current: 0,
                last: 0,
                hold: 0,
                state: ''
            };
            this.cache.simpleStates = {
                opening: null,
                towards: null,
                hyperExtending: null,
                halfway: null,
                flick: null,
                translation: {
                    absolute: 0,
                    relative: 0,
                    sinceDirectionChange: 0,
                    percentage: 0
                }
            };
        },

        /**
         * Fired while the user is moving the content pane
         * @param  {Object} e Event object
         */
        dragging: function(e) {
            if (this.cache.isDragging && this.settings.touchToDrag) {
                var thePageX = this.page('X', e),
                    thePageY = this.page('Y', e),
                    translated = this.cache.translation,
                    absoluteTranslation = this.matrix(4),
                    whileDragX = thePageX - this.cache.startDragX,
                    openingLeft = absoluteTranslation > 0,
                    translateTo = whileDragX,
                    diff;

                // Shown no intent already
                if ((this.cache.intentChecked && !this.cache.hasIntent)) {
                    return;
                }

                if ((absoluteTranslation)>0) {
                    if (this.settings.addBodyClasses) {
                        utils.addClass(doc.body, 'snapjs-left');
                        utils.removeClass(doc.body, 'snapjs-right');
                    }
                } else if ((absoluteTranslation)<0) {
                    if (this.settings.addBodyClasses) {
                        utils.addClass(doc.body, 'snapjs-right');
                        utils.removeClass(doc.body, 'snapjs-left');
                    }
                }

                if (this.cache.hasIntent === false || this.cache.hasIntent === null) {
                    var deg = this.angleOfDrag(thePageX, thePageY),
                        inRightRange = (deg >= 0 && deg <= this.settings.slideIntent) || (deg <= 360 && deg > (360 - this.settings.slideIntent)),
                        inLeftRange = (deg >= 180 && deg <= (180 + this.settings.slideIntent)) || (deg <= 180 && deg >= (180 - this.settings.slideIntent));
                    if (!inLeftRange && !inRightRange) {
                        this.cache.hasIntent = false;
                    } else {
                        this.cache.hasIntent = true;
                    }
                    this.cache.intentChecked = true;
                }

                if (
                    (this.settings.minDragDistance>=Math.abs(thePageX-this.cache.startDragX)) || // Has user met minimum drag distance?
                    (this.cache.hasIntent === false)
                ) {
                    return;
                }

                utils.preventEvent(e);
                this.dispatchEvent('drag');

                this.cache.dragWatchers.current = thePageX;
                // Determine which direction we are going
                if (this.cache.dragWatchers.last > thePageX) {
                    if (this.cache.dragWatchers.state !== 'left') {
                        this.cache.dragWatchers.state = 'left';
                        this.cache.dragWatchers.hold = thePageX;
                    }
                    this.cache.dragWatchers.last = thePageX;
                } else if (this.cache.dragWatchers.last < thePageX) {
                    if (this.cache.dragWatchers.state !== 'right') {
                        this.cache.dragWatchers.state = 'right';
                        this.cache.dragWatchers.hold = thePageX;
                    }
                    this.cache.dragWatchers.last = thePageX;
                }
                if (openingLeft) {
                    // Pulling too far to the right
                    if (this.settings.maxPosition < absoluteTranslation) {
                        diff = (absoluteTranslation - this.settings.maxPosition) * settings.resistance;
                        translateTo = whileDragX - diff;
                    }
                    this.cache.simpleStates = {
                        opening: 'left',
                        towards: this.cache.dragWatchers.state,
                        hyperExtending: this.settings.maxPosition < absoluteTranslation,
                        halfway: absoluteTranslation > (this.settings.maxPosition / 2),
                        flick: Math.abs(this.cache.dragWatchers.current - this.cache.dragWatchers.hold) > this.settings.flickThreshold,
                        translation: {
                            absolute: absoluteTranslation,
                            relative: whileDragX,
                            sinceDirectionChange: (this.cache.dragWatchers.current - this.cache.dragWatchers.hold),
                            percentage: (absoluteTranslation/this.settings.maxPosition)*100
                        }
                    };
                } else {
                    // Pulling too far to the left
                    if (this.settings.minPosition > absoluteTranslation) {
                        diff = (absoluteTranslation - this.settings.minPosition) * this.settings.resistance;
                        translateTo = whileDragX - diff;
                    }
                    this.cache.simpleStates = {
                        opening: 'right',
                        towards: this.cache.dragWatchers.state,
                        hyperExtending: this.settings.minPosition > absoluteTranslation,
                        halfway: absoluteTranslation < (this.settings.minPosition / 2),
                        flick: Math.abs(this.cache.dragWatchers.current - this.cache.dragWatchers.hold) > this.settings.flickThreshold,
                        translation: {
                            absolute: absoluteTranslation,
                            relative: whileDragX,
                            sinceDirectionChange: (this.cache.dragWatchers.current - this.cache.dragWatchers.hold),
                            percentage: (absoluteTranslation/this.settings.minPosition)*100
                        }
                    };
                }
                action.translate.x(translateTo + translated);
            }
        },

        /**
         * Fired when the user releases the content pane
         * @param  {Object} e Event object
         */
        endDrag: function(e) {
            if (this.cache.isDragging) {
                utils.dispatchEvent('end');
                var translated = this.matrix(4);

                // Tap Close
                if (this.cache.dragWatchers.current === 0 && translated !== 0 && this.settings.tapToClose) {
                    this.dispatchEvent('close');
                    this.prevent(e);
                    this.easeTo(0);
                    this.cache.isDragging = false;
                    this.cache.startDragX = 0;
                    return;
                }

                // Revealing Left
                if (this.cache.simpleStates.opening === 'left') {
                    // Halfway, Flicking, or Too Far Out
                    if ((this.cache.simpleStates.halfway || this.cache.simpleStates.hyperExtending || this.cache.simpleStates.flick)) {
                        if (this.cache.simpleStates.flick && this.cache.simpleStates.towards === 'left') { // Flicking Closed
                            this.easeTo(0);
                        } else if (
                            (this.cache.simpleStates.flick && this.cache.simpleStates.towards === 'right') || // Flicking Open OR
                            (this.cache.simpleStates.halfway || this.cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
                        ) {
                            this.easeTo(settings.maxPosition); // Open Left
                        }
                    } else {
                        this.easeTo(0); // Close Left
                    }
                    // Revealing Right
                } else if (this.cache.simpleStates.opening === 'right') {
                    // Halfway, Flicking, or Too Far Out
                    if ((this.cache.simpleStates.halfway || this.cache.simpleStates.hyperExtending || this.cache.simpleStates.flick)) {
                        if (this.cache.simpleStates.flick && this.cache.simpleStates.towards === 'right') { // Flicking Closed
                            this.easeTo(0);
                        } else if (
                            (this.cache.simpleStates.flick && this.cache.simpleStates.towards === 'left') || // Flicking Open OR
                            (this.cache.simpleStates.halfway || this.cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
                        ) {
                            this.easeTo(settings.minPosition); // Open Right
                        }
                    } else {
                        this.easeTo(0); // Close Right
                    }
                }
                this.cache.isDragging = false;
                this.cache.startDragX = utils.page('X', e);
            }
        }
    });

    /**
     * Public API
     */

    utils.extend(Snap.prototype, {
        /**
         * Opens the specified side menu
         * @param  {String} side Must be "left" or "right"
         */
        open: function(side) {
            this.dispatchEvent('open');

            if (this.settings.addBodyClasses) {
                utils.removeClass(doc.body, 'snapjs-expand-left');
                utils.removeClass(doc.body, 'snapjs-expand-right');
            }

            if (side === 'left') {
                this.cache.simpleStates.opening = 'left';
                this.cache.simpleStates.towards = 'right';

                if (this.settings.addBodyClasses) {
                    utils.addClass(doc.body, 'snapjs-left');
                    utils.removeClass(doc.body, 'snapjs-right');
                }

                this.easeTo(this.settings.maxPosition);
            } else if (side === 'right') {
                this.cache.simpleStates.opening = 'right';
                this.cache.simpleStates.towards = 'left';

                if (this.settings.addBodyClasses) {
                    utils.addClass(doc.body, 'snapjs-right');
                    utils.removeClass(doc.body, 'snapjs-left');
                }

                this.easeTo(this.settings.minPosition);
            }
        },

        /**
         * Closes the pane
         */
        close: function() {
            this.dispatchEvent('close');
            this.easeTo(0);
        },

        /**
         * Hides the content pane completely allowing for full menu visibility
         * @param  {String} side Must be "left" or "right"
         */
        expand: function(side){
            var to = win.innerWidth || doc.documentElement.clientWidth;

            if (side==='left') {
                this.dispatchEvent('expandLeft');

                if (this.settings.addBodyClasses) {
                    utils.addClass(doc.body, 'snapjs-expand-left');
                    utils.removeClass(doc.body, 'snapjs-expand-right');
                }
            } else {
                this.dispatchEvent('expandRight');

                if (this.settings.addBodyClasses) {
                    utils.addClass(doc.body, 'snapjs-expand-right');
                    utils.removeClass(doc.body, 'snapjs-expand-left');
                }

                to *= -1;
            }
            this.easeTo(to);
        },

        /**
         * Listen in to custom Snap events
         * @param  {String}   evt The snap event name
         * @param  {Function} fn  Callback function
         * @return {Object}       Snap instance
         */
        on: function(evt, fn) {
            this.eventList[evt] = fn;
            return this;
        },

        /**
         * Stops listening to custom Snap events
         * @param  {String} evt The snap event name
         */
        off: function(evt) {
            if (this.eventList[evt]) {
                this.eventList[evt] = false;
            }
        },

        /**
         * Enables Snap.js events
         */
        enable: function() {
            this.dispatchEvent('enable');
            this.listen();
        },

        /**
         * Disables Snap.js events
         */
        disable: function() {
            this.dispatchEvent('disable');
            this.stopListening();
        },

        /**
         * Updates the instances settings
         * @param  {Object} opts The Snap options to set
         */
        settings: function(opts){
            utils.extend(this.settings, opts);
        },

        /**
         * Returns information about the state of the content pane
         * @return {Object} Information regarding the state of the pane
         */
        state: function() {
            var state,
                fromLeft = this.matrix(4);
            if (fromLeft === this.settings.maxPosition) {
                state = 'left';
            } else if (fromLeft === this.settings.minPosition) {
                state = 'right';
            } else {
                state = 'closed';
            }
            return {
                state: state,
                info: this.cache.simpleStates
            };
        }
    });

    /* put the Snap object on the window */
    win.Snap = Snap;

}).call(this, window, document);
