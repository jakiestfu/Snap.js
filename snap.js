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
            draggable: true,
            drawerWidth: 266,
            resistance: 0.5
        },
        _log = function(what){ 
            if(what){
                console.log(what);
            }
        },
        cache = {},
        utils = {
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

                    settings.element.style.webkitTransition = 'all 0.3s ease';
                    utils.events.addEvent(settings.element, 'webkitTransitionEnd', function(){
                        settings.element.style.webkitTransition = '';
                        cache.translation = n;
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
                    utils.events.addEvent(settings.element, 'mousedown', action.drag.startDrag);
                    utils.events.addEvent(settings.element, 'mousemove', action.drag.dragging);
                    utils.events.addEvent(settings.element, 'mouseup', action.drag.endDrag);
                },
                startDrag: function(e){
                    settings.element.style.webkitTransition = '';
                    cache.isDragging = true;
                    cache.startDragX = e.pageX;
                },
                dragging: function(e){
                    if(cache.isDragging){
                        var translated = action.translate.get.matrix(4),
                            whileDragX = e.pageX - cache.startDragX + translated,
                            toLeft = whileDragX > 0,
                            translateTo = whileDragX;



                        if(toLeft){
                            if(settings.maxPosition < whileDragX){
                                var diff = (whileDragX - settings.maxPosition) * settings.resistance;
                                translateTo = whileDragX - diff;
                            }
                        } else {
                            if(settings.minPosition > whileDragX){
                                var diff = (whileDragX - settings.minPosition) * settings.resistance;
                                translateTo = whileDragX - diff;
                            }
                        }
                        action.translate.x(translateTo);

                    }
                },
                endDrag: function(e){

                    /*
                     * Tap
                     */
                    if(e.pageX == cache.startDragX){
                        action.translate.easeTo(0);
                        cache.isDragging = false;
                        cache.startDragX = 0;
                        return;
                    }

                    var translated = action.translate.get.matrix(4),
                        doneDragX = e.pageX - cache.startDragX - translated,
                        toLeft = doneDragX > 0;
                    
                    if(toLeft){
                        if(doneDragX>settings.maxPosition || doneDragX>(settings.maxPosition/2)){
                            action.translate.easeTo(settings.maxPosition);
                        } else {
                            action.translate.easeTo(0);
                        }
                    } else {
                        if(doneDragX<settings.minPosition || doneDragX<(settings.minPosition/2)){
                            action.translate.easeTo(settings.minPosition);
                        } else {
                            action.translate.easeTo(0);
                        }
                    }
                    cache.isDragging = false;
                    cache.startDragX = e.pageX;
                }
            },
            listen: function () {

                
                //utils.addEvent(settings.textarea, 'keypress', action.filter);
                
            }
        },
        init = function (opts) {

            if(opts.element){
            	utils.deepExtend(settings, opts);

                if(settings.draggable){
                    action.drag.listen();
                }

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
