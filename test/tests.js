var _makeOne = function() {
    return new Snap({
        element: document.getElementById('content')
    });
};

describe("Translations", function() {
    it("It should open Left", function(done) {
        var snapper = _makeOne();

        snapper.on('animated', function(t){
            var data = snapper.state();

            expect(data.state).to.equal('left');

            snapper.off('animated');
            done();
        });

        snapper.open('left');
    });

    it("It should open Right", function(done) {
        var snapper = _makeOne();

        snapper.on('animated', function(t){
            var data = snapper.state();

            expect(data.state).to.equal('right');

            snapper.off('animated');
            done();
        });

        snapper.open('right');
    });

    it("It should close", function(done) {
        var snapper = _makeOne();

        snapper.on('animated', function(t) {
            var data = snapper.state();

            expect(data.state).to.equal('closed');

            snapper.off('animated');
            done();
        });

        snapper.close();
    });
});

// describe("utils.eventType", function() {
//     it("It should return 'touchstart' when touch is supported.", function(done) {
//         Snap.utils.hasTouch = true;
//         var down = Snap.utils.eventType('down');
//         expect(down).to.equal('touchstart');

//         done();
//     });

//     it("It should return 'mousedown' when touch isn't supported and settings.clickToDrag is enabled.", function(done) {
//         Snap.utils.hasTouch = false;
//         var down = Snap.utils.eventType('down');
//         expect(down).to.equal('mousedown');

//         done();
//     });

//     it("It should return '' when touch isn't supported and settings.clickToDrag is disabled.", function(done) {
//         Snap.utils.hasTouch = false;
//         Snap.settings.clickToDrag = false;
//         var down = Snap.utils.eventType('down');
//         expect(down).to.equal('');

//         Snap.settings.clickToDrag = true;
//         done();
//     });

//     it("It should return 'touchmove' when touch is supported.", function(done) {
//         Snap.utils.hasTouch = true;
//         var move = Snap.utils.eventType('move');
//         expect(move).to.equal('touchmove');

//         done();
//     });

//     it("It should return 'mousemove' when touch isn't supported and settings.clickToDrag is enabled.", function(done) {
//         Snap.utils.hasTouch = false;
//         var move = Snap.utils.eventType('move');
//         expect(move).to.equal('mousemove');

//         done();
//     });

//     it("It should return '' when touch isn't supported and settings.clickToDrag is disabled.", function(done) {
//         Snap.utils.hasTouch = false;
//         Snap.settings.clickToDrag = false;
//         var move = Snap.utils.eventType('move');
//         expect(move).to.equal('');

//         Snap.settings.clickToDrag = true;
//         done();
//     });

//     it("It should return 'touchend' when touch is supported.", function(done) {
//         Snap.utils.hasTouch = true;
//         var up = Snap.utils.eventType('up');
//         expect(up).to.equal('touchend');

//         done();
//     });

//     it("It should return 'mouseup' when touch isn't supported and settings.clickToDrag is enabled.", function(done) {
//         Snap.utils.hasTouch = false;
//         var up = Snap.utils.eventType('up');
//         expect(up).to.equal('mouseup');

//         done();
//     });

//     it("It should return '' when touch isn't supported and settings.clickToDrag is disabled.", function(done) {
//         Snap.utils.hasTouch = false;
//         Snap.settings.clickToDrag = false;
//         var up = Snap.utils.eventType('up');
//         expect(up).to.equal('');

//         Snap.settings.clickToDrag = true;
//         done();
//     });

//     it("It should return 'touchcancel' when touch is supported.", function(done) {
//         Snap.utils.hasTouch = true;
//         var out = Snap.utils.eventType('out');
//         expect(out).to.equal('touchcancel');

//         done();
//     });

//     it("It should return 'mouseout' when touch isn't supported and settings.clickToDrag is enabled.", function(done) {
//         Snap.utils.hasTouch = false;
//         var out = Snap.utils.eventType('out');
//         expect(out).to.equal('mouseout');

//         done();
//     });

//     it("It should return '' when touch isn't supported and settings.clickToDrag is disabled.", function(done) {
//         Snap.utils.hasTouch = false;
//         Snap.settings.clickToDrag = false;
//         var out = Snap.utils.eventType('out');
//         expect(out).to.equal('');

//         Snap.settings.clickToDrag = true;
//         done();
//     });
// });