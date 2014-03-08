(function(win, doc, Snap){

    var cache = Snap.cache;
    var utils = Snap.utils;
    var settings = Snap.settings;

    var action = {

        /**
         * Handles translating the elements position
         * @type {Object}
         */
        translate: {
            get: {

                /**
                 * Returns the amount an element is translated
                 * @param  {Number} index The index desired from the CSS3 values of translate3d
                 * @return {Number}       The amount of pixels an element is translated
                 */
                matrix: function(index) {

                    if( !cache.canTransform ){
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
                    utils.klass.remove(doc.body, 'snapjs-right');
                    utils.klass.remove(doc.body, 'snapjs-left');
                }

                utils.dispatchEvent('animated');
                utils.events.removeEvent(settings.element, utils.transitionCallback(), action.translate.easeCallback);
            },

            /**
             * Animates the pane by the specified amount of pixels
             * @param  {Number} n The amount of pixels to move the pane
             */
            easeTo: function(n) {

                if( !cache.canTransform ){
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
            }
        },

        /**
         * Handles all the events that interface with dragging
         * @type {Object}
         */
        drag: {

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
                            utils.klass.add(doc.body, 'snapjs-left');
                            utils.klass.remove(doc.body, 'snapjs-right');
                        } else if((absoluteTranslation)<0){
                            utils.klass.add(doc.body, 'snapjs-right');
                            utils.klass.remove(doc.body, 'snapjs-left');
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
        }
    };

    Snap.action = action;

}).call(this, window, document, Snap);
