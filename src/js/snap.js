
'use strict';

// window object
var self = this;

/**
 * Our Snap global that initializes our instance
 * @param {Object} opts The custom Snap.js options
 */
var Snap = function( opts ) {
    if (opts.element) {
        Snap.utils.extend(Snap.settings, opts);
        Snap.cache.vendor = Snap.utils.vendor();
        Snap.cache.canTransform = Snap.utils.canTransform();
        Snap.action.drag.listen();
    }
};

/**
 * Our default settings for a Snap instance
 * @type {Object}
 */
var settings = Snap.settings = {
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
var cache = Snap.cache = {
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

self.Snap = Snap;
