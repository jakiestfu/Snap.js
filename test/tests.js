var utils = {};
utils.extend = function(destination, source) {
    var property;
    for (property in source) {
        destination[property] = source[property];
    }
    return destination;
};

var _makeOne = function(options) {
    var defaults = {
        element: document.getElementById('content')
    };
    return new Snap(utils.extend(defaults, options));
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
