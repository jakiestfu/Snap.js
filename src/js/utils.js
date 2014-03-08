(function(win, doc, Snap){

    var eventList = {};
    var settings = Snap.settings;
    var cache = Snap.cache;

    var utils = {

        hasTouch: ('ontouchstart' in doc.documentElement || win.navigator.msPointerEnabled),
        eventType: function(action) {
            var eventTypes = {
                down: (utils.hasTouch ? 'touchstart' : 'mousedown'),
                move: (utils.hasTouch ? 'touchmove' : 'mousemove'),
                up: (utils.hasTouch ? 'touchend' : 'mouseup'),
                out: (utils.hasTouch ? 'touchcancel' : 'mouseout')
            };
            return eventTypes[action];
        },
        page: function(t, e){
            return (utils.hasTouch && e.touches.length && e.touches[0]) ? e.touches[0]['page'+t] : e['page'+t];
        },
        klass: {
            has: function(el, name){
                return (el.className).indexOf(name) !== -1;
            },
            add: function(el, name){
                if(!utils.klass.has(el, name) && settings.addBodyClasses){
                    el.className += " "+name;
                }
            },
            remove: function(el, name){
                if(settings.addBodyClasses){
                    el.className = (el.className).replace(name, "").replace(/^\s+|\s+$/g, '');
                }
            }
        },
        dispatchEvent: function(type) {
            if (typeof eventList[type] === 'function') {
                return eventList[type].call();
            }
        },
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
        transitionCallback: function(){
            return (cache.vendor==='Moz' || cache.vendor==='ms') ? 'transitionend' : cache.vendor+'TransitionEnd';
        },
        canTransform: function(){
            return typeof settings.element.style[cache.vendor+'Transform'] !== 'undefined';
        },
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
            addEvent: function addEvent(element, eventName, func) {
                if (element.addEventListener) {
                    return element.addEventListener(eventName, func, false);
                } else if (element.attachEvent) {
                    return element.attachEvent("on" + eventName, func);
                }
            },
            removeEvent: function addEvent(element, eventName, func) {
                if (element.addEventListener) {
                    return element.removeEventListener(eventName, func, false);
                } else if (element.attachEvent) {
                    return element.detachEvent("on" + eventName, func);
                }
            },
            prevent: function(e) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
            }
        },
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
