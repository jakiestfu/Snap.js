
/**
 * Opens the specified side menu
 * @param  {String} side Must be "left" or "right"
 */
Snap.prototype.open = function(side) {
    utils.dispatchEvent('open');
    utils.klass.remove(doc.body, 'snapjs-expand-left');
    utils.klass.remove(doc.body, 'snapjs-expand-right');

    if (side === 'left') {
        cache.simpleStates.opening = 'left';
        cache.simpleStates.towards = 'right';
        utils.klass.add(doc.body, 'snapjs-left');
        utils.klass.remove(doc.body, 'snapjs-right');
        action.translate.easeTo(settings.maxPosition);
    } else if (side === 'right') {
        cache.simpleStates.opening = 'right';
        cache.simpleStates.towards = 'left';
        utils.klass.remove(doc.body, 'snapjs-left');
        utils.klass.add(doc.body, 'snapjs-right');
        action.translate.easeTo(settings.minPosition);
    }
};

/**
 * Closes the pane
 */
Snap.prototype.close = function() {
    utils.dispatchEvent('close');
    action.translate.easeTo(0);
};

/**
 * Hides the content pane completely allowing for full menu visibility
 * @param  {String} side Must be "left" or "right"
 */
Snap.prototype.expand = function(side){
    var to = win.innerWidth || doc.documentElement.clientWidth;

    if(side==='left'){
        utils.dispatchEvent('expandLeft');
        utils.klass.add(doc.body, 'snapjs-expand-left');
        utils.klass.remove(doc.body, 'snapjs-expand-right');
    } else {
        utils.dispatchEvent('expandRight');
        utils.klass.add(doc.body, 'snapjs-expand-right');
        utils.klass.remove(doc.body, 'snapjs-expand-left');
        to *= -1;
    }
    action.translate.easeTo(to);
};

/**
 * Listen in to custom Snap events
 * @param  {String}   evt The snap event name
 * @param  {Function} fn  Callback function
 * @return {Object}       Snap instance
 */
Snap.prototype.on = function(evt, fn) {
    eventList[evt] = fn;
    return this;
};

/**
 * Stops listening to custom Snap events
 * @param  {String} evt The snap event name
 */
Snap.prototype.off = function(evt) {
    if (eventList[evt]) {
        eventList[evt] = false;
    }
};

/**
 * Enables Snap.js events
 */
Snap.prototype.enable = function() {
    utils.dispatchEvent('enable');
    action.drag.listen();
};

/**
 * Disables Snap.js events
 */
Snap.prototype.disable = function() {
    utils.dispatchEvent('disable');
    action.drag.stopListening();
};

/**
 * Updates the instances settings
 * @param  {Object} opts The Snap options to set
 */
Snap.prototype.settings = function(opts){
    utils.extend(settings, opts);
};

/**
 * Returns information about the state of the content pane
 * @return {Object} Information regarding the state of the pane
 */
Snap.prototype.state = function() {
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
};
