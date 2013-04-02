/*
 * Snap.js
 *
 * Copyright 2013, Jacob Kelley - http://jakiestfu.com/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  http://github.com/jakiestfu/Snap.js/
 * Version: 1.0
 */


(function(undefined){

    'use strict';
    
    var Snap = Snap || function (userOpts) {

        var settings = {
            element: null,
            resistance: 0.5,
            flickThreshold: 50,
            transitionSpeed: 0.3,
            maxPosition: 266,
            minPosition: -266
        },
        cache = {},
        eventList = {},
        utils = {
        	eventType: function(action){
	        	var hasTouch = (document.ontouchstart!==null),
		        	eventTypes = {
			        	down: hasTouch ? 'mousedown' : 'touchstart',
			        	move: hasTouch ? 'mousemove' : 'touchmove',
			        	up: hasTouch ? 'mouseup' : 'touchend'
		        	};
		        return eventTypes[action];
        	},
        	dispatchEvent: function(type){
        		if(typeof eventList[type]=='function'){
        			eventList[type].call();
        		}
        	},
        	deepExtend: function(destination, source) {
                for (var property in source) {
                    if (source[property] && source[property].constructor &&
                        source[property].constructor === Object) {
                        destination[property] = destination[property] || {};
                        utils.deepExtend(destination[property], source[property]);
                    } else {
                        destination[property] = source[property];
                    }
                }
                return destination;
            },
            events: {
                addEvent: function addEvent(element, eventName, func) {
                    if (element.addEventListener){
                        element.addEventListener(eventName,func,false);
                    } else if (element.attachEvent) {
                        element.attachEvent("on"+eventName, func);
                    }
                },
                removeEvent: function addEvent(element, eventName, func){
                    if (element.addEventListener){
                        element.removeEventListener(eventName,func,false);
                    } else if (element.attachEvent) {
                        element.detachEvent("on"+eventName, func);
                    }
                },
                
                preventDefaultEvent: function(e){
                    if(e.preventDefault){
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                }
            },
        },

        action = {

            translate: {
                get: {
                    matrix: function(index){
                        var matrix = getComputedStyle(settings.element).webkitTransform.match(/\((.*)\)/);
                        matrix = matrix[1].split(',');
                        return parseInt(matrix[index]);
                    }
                },
                easeTo: function(n){
                	cache.easing = true;
                	console.log('Easing: '+(cache.easing).toString());
					settings.element.style.webkitTransition = 'all '+settings.transitionSpeed+'s ease';
                    utils.events.addEvent(settings.element, 'webkitTransitionEnd', function(){
                        settings.element.style.webkitTransition = '';
                        cache.translation = action.translate.get.matrix(4);
                        cache.easing = false;
                        console.log('Easing: '+(cache.easing).toString());
                    });
                    action.translate.x(n);
                },
                x: function(n){
                    var theTranslate = 'translate3d('+parseInt(n)+'px, 0,0)';
                    settings.element.style.webkitTransform = theTranslate;
                }
            },

            drag: {
                listen: function(){
                    cache.translation = 0;
                    cache.easing = false;
                    utils.events.addEvent(settings.element, utils.eventType('down'), action.drag.startDrag);
                    utils.events.addEvent(settings.element, utils.eventType('move'), action.drag.dragging);
                    utils.events.addEvent(settings.element, utils.eventType('up'), action.drag.endDrag);
                },
                startDrag: function(e){
                	
                	// No drag on ignored elements
                	if(e.srcElement.dataset.snapIgnore!=undefined){
                		utils.dispatchEvent('ignore');
                		return;
                	}
                	utils.dispatchEvent('start');
                    settings.element.style.webkitTransition = '';
                    cache.isDragging = true;
                    cache.startDragX = e.pageX;
                    cache.dragWatchers = {
                    	current: 0,
                    	last: 0,
                    	hold: 0,
                    	state: ''
                    };
                    cache.simpleStates = {};
                },
                dragging: function(e){
                    if(cache.isDragging){
                    	
                    	utils.dispatchEvent('drag');
                    	
                        var pageX = e.pageX,
                        	translated = cache.translation,
                        	absoluteTranslation = action.translate.get.matrix(4),
                            whileDragX = pageX - cache.startDragX,
                            openingLeft = absoluteTranslation > 0,
                            translateTo = whileDragX;
						cache.dragWatchers.current = pageX;
						
						// Determine which direction we are going
						if(cache.dragWatchers.last > pageX){
							if(cache.dragWatchers.state!='left'){
								cache.dragWatchers.state='left';
								cache.dragWatchers.hold=pageX;
							}
							cache.dragWatchers.last = pageX;
						} else if(cache.dragWatchers.last < pageX) {
							if(cache.dragWatchers.state!='right'){
								cache.dragWatchers.state='right';
								cache.dragWatchers.hold=pageX;
							}
							cache.dragWatchers.last = pageX;
						}
						
						if(openingLeft){
							
							// Pulling too far to the right
                            if(settings.maxPosition < absoluteTranslation){
                                var diff = (absoluteTranslation - settings.maxPosition) * settings.resistance;
                                translateTo = whileDragX - diff;
                            }
                            cache.simpleStates = {
                            	opening: 'left',
                            	towards: cache.dragWatchers.state,
								hyperExtending: settings.maxPosition < absoluteTranslation,
								halfway: absoluteTranslation>(settings.maxPosition/2),
								flick: Math.abs(cache.dragWatchers.current-cache.dragWatchers.hold) > settings.flickThreshold,
								translation: {
									absolute: absoluteTranslation,
									relative: whileDragX,
									sinceDirectionChange: (cache.dragWatchers.current-cache.dragWatchers.hold)
								}
							};
                        } else {
                        	
                        	// Pulling too far to the left
                            if(settings.minPosition > absoluteTranslation){
                                var diff = (absoluteTranslation - settings.minPosition) * settings.resistance;
                                translateTo = whileDragX - diff;
                            }
                            cache.simpleStates = {
                            	opening: 'right',
                            	towards: cache.dragWatchers.state,
								hyperExtending: settings.minPosition > absoluteTranslation,
								halfway: absoluteTranslation<(settings.minPosition/2),
								flick: Math.abs(cache.dragWatchers.current-cache.dragWatchers.hold) > settings.flickThreshold,
								translation: {
									absolute: absoluteTranslation,
									relative: whileDragX,
									sinceDirectionChange: (cache.dragWatchers.current-cache.dragWatchers.hold)
								}
							};
                        }
                        action.translate.x(translateTo+translated);
                    }
                },
                endDrag: function(e){

                    if(cache.isDragging){
                    	utils.dispatchEvent('end');
                    	var translated = action.translate.get.matrix(4),
	                        revealingLeft = translated > 0;
                    	
                    	// Tap Close
	                    if(cache.dragWatchers.current==0 && translated!=0){
	                    	action.translate.easeTo(0);
	                        cache.isDragging = false;
	                        cache.startDragX = 0;
	                        return;
	                    }
	
						// Revealing Left
	                    if(cache.simpleStates.opening=='left'){
	                    	
	                    	// Halfway, Flicking, or Too Far Out
	                    	if((cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick)){
	                    		if(cache.simpleStates.flick && cache.simpleStates.towards=='left'){ // Flicking Closed
	                    			action.translate.easeTo(0);
	                    		} else if(
	                    			(cache.simpleStates.flick && cache.simpleStates.towards=='right') || // Flicking Open OR
	                    			(cache.simpleStates.halfway || cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
	                    		) {
	                    			action.translate.easeTo(settings.maxPosition); // Open Left
	                    		}
	                    	} else {
	                    		action.translate.easeTo(0); // Close Left
	                    	}
	                    
	                    // Revealing Right
	                    } else if(cache.simpleStates.opening=='right'){
	                    	
	                    	// Halfway, Flicking, or Too Far Out
	                    	if((cache.simpleStates.halfway || cache.simpleStates.hyperExtending || cache.simpleStates.flick)){
	                    		if(cache.simpleStates.flick && cache.simpleStates.towards=='right'){ // Flicking Closed
	                    			action.translate.easeTo(0);
	                    		} else if(
	                    			(cache.simpleStates.flick && cache.simpleStates.towards=='left') || // Flicking Open OR
	                    			(cache.simpleStates.halfway || cache.simpleStates.hyperExtending) // At least halfway open OR hyperextending
	                    		) {
	                    			action.translate.easeTo(settings.minPosition); // Open Right
	                    		}
	                    	} else {
	                    		action.translate.easeTo(0); // Close Right
	                    	}
	                    }
	                    cache.isDragging = false;
	                    cache.startDragX = e.pageX;
	                }
                }
            }
        },
        init = function (opts) {
			if(opts.element){
            	utils.deepExtend(settings, opts);
				action.drag.listen();
			}
		};

        /*
         * Public
         */
        this.open = function(side){
            if(side=='left'){
                action.translate.easeTo(settings.maxPosition);
            } else if(side=='right'){
                action.translate.easeTo(settings.minPosition);
            }
        },
        this.close = function(){
            action.translate.easeTo(0);
        },
        this.on = function(evt, fn){
        	eventList[evt]=fn;
        	return this;
        },
        this.off = function(evt, fn){
        	if(eventList[evt]){
        		eventList[evt] = false;
        	}
        },
        this.state = function(){
        	
	        var state,
	        	fromLeft = action.translate.get.matrix(4);
	        if(fromLeft == settings.maxPosition){
		        state = 'left';
	        } else if(fromLeft == settings.minPosition){
		        state = 'right';
	        } else {
		        state = 'closed';
	        }
	        return {
	        	state: state,
	        	info: cache.simpleStates
	        };
        };

        init(userOpts);

    };


    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Snap;
    }

    if (typeof ender === 'undefined') {
        this.Snap = Snap;
    }

    if (typeof define === "function" && define.amd) {
        define("snap", [], function () { 
            return Snap; 
        });
    }

}).call(this);