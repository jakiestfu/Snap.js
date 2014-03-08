(function(win, doc) {

    'use strict';

    var Snap = function( userOpts ) {
        return Snap.init( userOpts );
    };

    Snap.settings = {
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
        slideIntent: 40, // degrees
        minDragDistance: 5
    };

    Snap.cache = {
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

    Snap.init = function(opts) {
        if (opts.element) {
            Snap.utils.extend(Snap.settings, opts);
            Snap.cache.vendor = Snap.utils.vendor();
            Snap.action.drag.listen();
        }
    };

    this.Snap = Snap;

}).call(this, window, document);
