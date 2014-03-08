(function(win, doc, Snap){

    var eventList = {};
    var settings = Snap.settings;
    var cache = Snap.cache;

    var utils = {

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
                down: (utils.hasTouch ? 'touchstart' : settings.clickToDrag ? 'mousedown' : ''),
                move: (utils.hasTouch ? 'touchmove' : settings.clickToDrag ? 'mousemove' : ''),
                up: (utils.hasTouch ? 'touchend' : settings.clickToDrag ? 'mouseup': ''),
                out: (utils.hasTouch ? 'touchcancel' : settings.clickToDrag ? 'mouseout' : '')
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
            return (utils.hasTouch && e.touches.length && e.touches[0]) ? e.touches[0]['page'+t] : e['page'+t];
        },


        klass: {

            /**
             * Checks if an element has a class name
             * @param  {Object}  el   The element to check
             * @param  {String}  name The class name to search for
             * @return {Boolean}      Returns true if the class exists
             */
            has: function(el, name){
                return (el.className).indexOf(name) !== -1;
            },

            /**
             * Adds a class name to an element
             * @param  {Object}  el   The element to add to
             * @param  {String}  name The class name to add
             */
            add: function(el, name){
                if(!utils.klass.has(el, name) && settings.addBodyClasses){
                    el.className += " "+name;
                }
            },

            /**
             * Removes a class name
             * @param  {Object} el   The element to remove from
             * @param  {String} name The class name to remove
             */
            remove: function(el, name){
                if(utils.klass.has(el, name) && settings.addBodyClasses){
                    el.className = (el.className).replace(name, "").replace(/^\s+|\s+$/g, '');
                }
            }
        },

        /**
         * Dispatch a custom Snap.js event
         * @param  {String} type The event name
         */
        dispatchEvent: function(type) {
            if (typeof eventList[type] === 'function') {
                return eventList[type].call();
            }
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
            return (cache.vendor==='Moz' || cache.vendor==='ms') ? 'transitionend' : cache.vendor+'TransitionEnd';
        },

        /**
         * Determines if the users browser supports CSS3 transformations
         * @return {[type]} [description]
         */
        canTransform: function(){
            return typeof settings.element.style[cache.vendor+'Transform'] !== 'undefined';
        },

        /**
         * Deeply extends two objects
         * @param  {Object} destination The destination object
         * @param  {Object} source      The custom options to extend destination by
         * @return {Object}             The desination object
         */
        extend: function(destination, source) {
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


        events: {

            /**
             * Adds an event to an element
             * @param {Object} element   Element to add event to
             * @param {String} eventName The event name
             * @param {Function} func      Callback function
             */
            addEvent: function addEvent(element, eventName, func) {
                if (element.addEventListener) {
                    return element.addEventListener(eventName, func, false);
                } else if (element.attachEvent) {
                    return element.attachEvent("on" + eventName, func);
                }
            },

            /**
             * Removes an event to an element
             * @param {Object} element   Element to remove event from
             * @param {String} eventName The event name
             * @param {Function} func      Callback function
             */
            removeEvent: function addEvent(element, eventName, func) {
                if (element.addEventListener) {
                    return element.removeEventListener(eventName, func, false);
                } else if (element.attachEvent) {
                    return element.detachEvent("on" + eventName, func);
                }
            },

            /**
             * Prevents the default event
             * @param  {Object} e The event object
             */
            prevent: function(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
            }
        },

        /**
         * Searches the parent element until a specified attribute has been matched
         * @param  {Object} el   The element to search from
         * @param  {String} attr The attribute to search for
         * @return {Object|null}      Returns a matched element if it exists, else, null
         */
        parentUntil: function(el, attr) {
            var isStr = typeof attr === 'string';
            while (el.parentNode) {
                if (isStr && el.getAttribute && el.getAttribute(attr)){
                    return el;
                } else if(!isStr && el === attr){
                    return el;
                }
                el = el.parentNode;
            }
            return null;
        }
    };

    Snap.utils = utils;
    Snap.eventList = eventList;

}).call(this, window, document, Snap);
