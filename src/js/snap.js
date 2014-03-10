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
    utils = {};

    /**
      * Deeply extends two objects
      * @param  {Object} destination The destination object
      * @param  {Object} source      The custom options to extend destination by
      * @return {Object}             The desination object
      */
    utils.extend = function(destination, source) {
        var property;
        for (property in source) {
            if (source[property] && source[property].constructor && source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                utils.extend(destination[property], source[property]);
            } else {
                destination[property] = source[property];
            }
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
        if (!utils.hasClass(el, name) && settings.addBodyClasses) {
            el.className += " " + name;
        }
    };

    /**
     * Removes a class name
     * @param  {Object} el   The element to remove from
     * @param  {String} name The class name to remove
     */
    utils.removeClass = function(el, name){
        if (utils.hasClass(el, name) && settings.addBodyClasses) {
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
    utils.addEvent = function addEvent(element, eventName, func) {
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
    utils.removeEvent = function addEvent(element, eventName, func) {
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

        /* mixin both the default settings and user-specified options */
        utils.extend(this.settings, defaultSettings);
        utils.extend(this.settings, opts);

        /* make sure the user defined an element to attach to */
        if (!this.settings.element) { throw new Error('Cannot instantiate Snap without a specified element'); }

        /* mixin our initial state */
        utils.extend(this.cache, defaultCache);

        /* populate a few starter values for the cache */
        this.cache.vendor = this.compat.vendor();
        this.cache.canTransform = this.compat.canTransform();

        /* start listening */
        this.action.drag.listen();
    };

    /**
     * Compat
     */

    utils.extend(Snap.prototype, {
        /**
         * Determines if we are interacting with a touch device
         * @type {Boolean}
         */
        hasTouch: ('ontouchstart' in doc.documentElement || win.navigator.msPointerEnabled),

        /**
         * Returns the appropriate event type based on whether we are a touch device or not
         * @param  {String} action The "action" event you're looking for: up, down, move, out
         * @return {String}        The browsers supported event name
         */
        eventType: function(action) {
            var eventTypes = {
                down: (compat.hasTouch ? 'touchstart' : this.settings.clickToDrag ? 'mousedown' : ''),
                move: (compat.hasTouch ? 'touchmove' : this.settings.clickToDrag ? 'mousemove' : ''),
                up: (compat.hasTouch ? 'touchend' : this.settings.clickToDrag ? 'mouseup': ''),
                out: (compat.hasTouch ? 'touchcancel' : this.settings.clickToDrag ? 'mouseout' : '')
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
            return (compat.hasTouch && e.touches.length && e.touches[0]) ? e.touches[0]['page'+t] : e['page'+t];
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
        },

        /**
         * Determines if the users browser supports CSS3 transformations
         * @return {[type]} [description]
         */
        canTransform: function(){
            return typeof this.settings.element.style[this.cache.vendor+'Transform'] !== 'undefined';
        }
    });

    /**
     * Events
     */

    /**
     * Dispatch a custom Snap.js event
     * @param  {String} type The event name
     */
    utils.extend(Snap.prototype, {
        dispatchEvent: function(type) {
            if (typeof eventList[type] === 'function') {
                return eventList[type].call();
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
            if (!cache.canTransform){
                return parseInt(settings.element.style.left, 10);
            } else {
                var matrix = win.getComputedStyle(settings.element)[cache.vendor+'Transform'].match(/\((.*)\)/),
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
         * Called when the element has finished transitioning
         */
        easeCallback: function(){
            settings.element.style[cache.vendor+'Transition'] = '';
            cache.translation = action.translate.get.matrix(4);
            cache.easing = false;

            if(cache.easingTo===0){
                utils.removeClass(doc.body, 'snapjs-right');
                utils.removeClass(doc.body, 'snapjs-left');
            }

            utils.dispatchEvent('animated');
            utils.events.removeEvent(settings.element, utils.transitionCallback(), action.translate.easeCallback);
        },

        /**
         * Animates the pane by the specified amount of pixels
         * @param  {Number} n The amount of pixels to move the pane
         */
        easeTo: function(n) {
            if (!cache.canTransform){
                cache.translation = n;
                action.translate.x(n);
            } else {
                cache.easing = true;
                cache.easingTo = n;

                settings.element.style[cache.vendor+'Transition'] = 'all ' + settings.transitionSpeed + 's ' + settings.easing;

                utils.events.addEvent(settings.element, utils.transitionCallback(), action.translate.easeCallback);
                action.translate.x(n);
            }
            if(n===0){
                settings.element.style[cache.vendor+'Transform'] = '';
            }
        },

        /**
         * Immediately translates the element on its X axis
         * @param  {Number} n Amount of pixels to translate
         */
        x: function(n) {
            if( (settings.disable==='left' && n>0) ||
                (settings.disable==='right' && n<0)
            ){ return; }

            if( !settings.hyperextensible ){
                if( n===settings.maxPosition || n>settings.maxPosition ){
                    n=settings.maxPosition;
                } else if( n===settings.minPosition || n<settings.minPosition ){
                    n=settings.minPosition;
                }
            }

            n = parseInt(n, 10);
            if(isNaN(n)){
                n = 0;
            }

            if( cache.canTransform ){
                var theTranslate = 'translate3d(' + n + 'px, 0,0)';
                settings.element.style[cache.vendor+'Transform'] = theTranslate;
            } else {
                settings.element.style.width = (win.innerWidth || doc.documentElement.clientWidth)+'px';

                settings.element.style.left = n+'px';
                settings.element.style.right = '';
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
            cache.translation = 0;
            cache.easing = false;
            utils.events.addEvent(settings.element, utils.eventType('down'), action.drag.startDrag);
            utils.events.addEvent(settings.element, utils.eventType('move'), action.drag.dragging);
            utils.events.addEvent(settings.element, utils.eventType('up'), action.drag.endDrag);
        },

        /**
         * Stops listening for drag events on our element
         */
        stopListening: function() {
            utils.events.removeEvent(settings.element, utils.eventType('down'), action.drag.startDrag);
            utils.events.removeEvent(settings.element, utils.eventType('move'), action.drag.dragging);
            utils.events.removeEvent(settings.element, utils.eventType('up'), action.drag.endDrag);
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

            if(settings.dragger){
                var dragParent = utils.parentUntil(target, settings.dragger);

                // Only use dragger if we're in a closed state
                if( !dragParent &&
                    (cache.translation !== settings.minPosition &&
                    cache.translation !== settings.maxPosition
                )){
                    return;
                }
            }

            utils.dispatchEvent('start');
            settings.element.style[cache.vendor+'Transition'] = '';
            cache.isDragging = true;
            cache.hasIntent = null;
            cache.intentChecked = false;
            cache.startDragX = utils.page('X', e);
            cache.startDragY = utils.page('Y', e);
            cache.dragWatchers = {
                current: 0,
                last: 0,
                hold: 0,
                state: ''
            };
            cache.simpleStates = {
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
            if (cache.isDragging && settings.touchToDrag) {

                var thePageX = utils.page('X', e),
                    thePageY = utils.page('Y', e),
                    translated = cache.translation,
                    absoluteTranslation = action.translate.get.matrix(4),
                    whileDragX = thePageX - cache.startDragX,
                    openingLeft = absoluteTranslation > 0,
                    translateTo = whileDragX,
                    diff;

                // Shown no intent already
                if((cache.intentChecked && !cache.hasIntent)){
                    return;
                }

                if(settings.addBodyClasses){
                    if((absoluteTranslation)>0){
                        utils.addClass(doc.body, 'snapjs-left');
                        utils.removeClass(doc.body, 'snapjs-right');
                    } else if((absoluteTranslation)<0){
                        utils.addClass(doc.body, 'snapjs-right');
                        utils.removeClass(doc.body, 'snapjs-left');
                    }
                }

                if (cache.hasIntent === false || cache.hasIntent === null) {
                    var deg = utils.angleOfDrag(thePageX, thePageY),
                        inRightRange = (deg >= 0 && deg <= settings.slideIntent) || (deg <= 360 && deg > (360 - settings.slideIntent)),
                        inLeftRange = (deg >= 180 && deg <= (180 + settings.slideIntent)) || (deg <= 180 && deg >= (180 - settings.slideIntent));
                    if (!inLeftRange && !inRightRange) {
                        cache.hasIntent = false;
                    } else {
                        cache.hasIntent = true;
                    }
                    cache.intentChecked = true;
                }

                if (
                    (settings.minDragDistance>=Math.abs(thePageX-cache.startDragX)) || // Has user met minimum drag distance?
                    (cache.hasIntent === false)
                ) {
                    return;
                }

                utils.events.prevent(e);
                utils.dispatchEvent('drag');

                cache.dragWatchers.current = thePageX;
                // Determine which direction we are going
                if (cache.dragWatchers.last > thePageX) {
                    if (cache.dragWatchers.state !== 'left') {
                        cache.dragWatchers.state = 'left';
                        cache.dragWatchers.hold = thePageX;
                    }
                    cache.dragWatchers.last = thePageX;
                } else if (cache.dragWatchers.last < thePageX) {
                    if (cache.dragWatchers.state !== 'right') {
                        cache.dragWatchers.state = 'right';
                        cache.dragWatchers.hold = thePageX;
                    }
                    cache.dragWatchers.last = thePageX;
                }
                if (openingLeft) {
                    // Pulling too far to the right
                    if (settings.maxPosition < absoluteTranslation) {
                        diff = (absoluteTranslation - settings.maxPosition) * settings.resistance;
                        translateTo = whileDragX - diff;
                    }
                    cache.simpleStates = {
                        opening: 'left',
                        towards: cache.dragWatchers.state,
                        hyperExtending: settings.maxPosition < absoluteTranslation,
                        halfway: absoluteTranslation > (settings.maxPosition / 2),
                        flick: Math.abs(cache.dragWatchers.current - cache.dragWatchers.hold) > settings.flickThreshold,
                        translation: {
                            absolute: absoluteTranslation,
                            relative: whileDragX,
                            sinceDirectionChange: (cache.dragWatchers.current - cache.dragWatchers.hold),
                            percentage: (absoluteTranslation/settings.maxPosition)*100
                        }
                    };
                } else {
                    // Pulling too far to the left
                    if (settings.minPosition > absoluteTranslation) {
                        diff = (absoluteTranslation - settings.minPosition) * settings.resistance;
                        translateTo = whileDragX - diff;
                    }
                    cache.simpleStates = {
                        opening: 'right',
                        towards: cache.dragWatchers.state,
                        hyperExtending: settings.minPosition > absoluteTranslation,
                        halfway: absoluteTranslation < (settings.minPosition / 2),
                        flick: Math.abs(cache.dragWatchers.current - cache.dragWatchers.hold) > settings.flickThreshold,
                        translation: {
                            absolute: absoluteTranslation,
                            relative: whileDragX,
                            sinceDirectionChange: (cache.dragWatchers.current - cache.dragWatchers.hold),
                            percentage: (absoluteTranslation/settings.minPosition)*100
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
            if (cache.isDragging) {
                utils.dispatchEvent('end');
                var translated = action.translate.get.matrix(4);

                // Tap Close
                if (cache.dragWatchers.current === 0 && translated !== 0 && settings.tapToClose) {
                    utils.dispatchEvent('close');
                    utils.events.prevent(e);
                    action.translate.easeTo(0);
                    cache.isDragging = false;
                    cache.startDragX = 0;
                    return;
                }

                // Revealing Left
                if (cache.simpleStates.opening === 'left') {
                    // Halfway, Flicking, or Too Far Out
                    if ((cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick)) {
                        if (cache.simpleStates.flick && cache.simpleStates.towards === 'left') { // Flicking Closed
                            action.translate.easeTo(0);
                        } else if (
                            (cache.simpleStates.flick && cache.simpleStates.towards === 'right') || // Flicking Open OR
                            (cache.simpleStates.halfway || cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
                        ) {
                            action.translate.easeTo(settings.maxPosition); // Open Left
                        }
                    } else {
                        action.translate.easeTo(0); // Close Left
                    }
                    // Revealing Right
                } else if (cache.simpleStates.opening === 'right') {
                    // Halfway, Flicking, or Too Far Out
                    if ((cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick)) {
                        if (cache.simpleStates.flick && cache.simpleStates.towards === 'right') { // Flicking Closed
                            action.translate.easeTo(0);
                        } else if (
                            (cache.simpleStates.flick && cache.simpleStates.towards === 'left') || // Flicking Open OR
                            (cache.simpleStates.halfway || cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
                        ) {
                            action.translate.easeTo(settings.minPosition); // Open Right
                        }
                    } else {
                        action.translate.easeTo(0); // Close Right
                    }
                }
                cache.isDragging = false;
                cache.startDragX = utils.page('X', e);
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
            utils.dispatchEvent('open');
            utils.removeClass(doc.body, 'snapjs-expand-left');
            utils.removeClass(doc.body, 'snapjs-expand-right');

            if (side === 'left') {
                cache.simpleStates.opening = 'left';
                cache.simpleStates.towards = 'right';
                utils.addClass(doc.body, 'snapjs-left');
                utils.removeClass(doc.body, 'snapjs-right');
                action.translate.easeTo(settings.maxPosition);
            } else if (side === 'right') {
                cache.simpleStates.opening = 'right';
                cache.simpleStates.towards = 'left';
                utils.removeClass(doc.body, 'snapjs-left');
                utils.addClass(doc.body, 'snapjs-right');
                action.translate.easeTo(settings.minPosition);
            }
        },

        /**
         * Closes the pane
         */
        close: function() {
            utils.dispatchEvent('close');
            action.translate.easeTo(0);
        },

        /**
         * Hides the content pane completely allowing for full menu visibility
         * @param  {String} side Must be "left" or "right"
         */
        expand: function(side){
            var to = win.innerWidth || doc.documentElement.clientWidth;

            if (side==='left') {
                utils.dispatchEvent('expandLeft');
                utils.addClass(doc.body, 'snapjs-expand-left');
                utils.removeClass(doc.body, 'snapjs-expand-right');
            } else {
                utils.dispatchEvent('expandRight');
                utils.addClass(doc.body, 'snapjs-expand-right');
                utils.removeClass(doc.body, 'snapjs-expand-left');
                to *= -1;
            }
            action.translate.easeTo(to);
        },

        /**
         * Listen in to custom Snap events
         * @param  {String}   evt The snap event name
         * @param  {Function} fn  Callback function
         * @return {Object}       Snap instance
         */
        on: function(evt, fn) {
            eventList[evt] = fn;
            return this;
        },

        /**
         * Stops listening to custom Snap events
         * @param  {String} evt The snap event name
         */
        off: function(evt) {
            if (eventList[evt]) {
                eventList[evt] = false;
            }
        },

        /**
         * Enables Snap.js events
         */
        enable: function() {
            utils.dispatchEvent('enable');
            action.drag.listen();
        },

        /**
         * Disables Snap.js events
         */
        disable: function() {
            utils.dispatchEvent('disable');
            action.drag.stopListening();
        },

        /**
         * Updates the instances settings
         * @param  {Object} opts The Snap options to set
         */
        settings: function(opts){
            utils.extend(settings, opts);
        },

        /**
         * Returns information about the state of the content pane
         * @return {Object} Information regarding the state of the pane
         */
        state: function() {
            var state,
                fromLeft = action.translate.get.matrix(4);
            if (fromLeft === settings.maxPosition) {
                state = 'left';
            } else if (fromLeft === settings.minPosition) {
                state = 'right';
            } else {
                state = 'closed';
            }
            return {
                state: state,
                info: cache.simpleStates
            };
        }
    });

}).call(this, window, document);
