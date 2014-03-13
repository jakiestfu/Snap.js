var utils = {};
utils.extend = function(destination, source) {
    var property;
    for (property in source) {
        destination[property] = source[property];
    }
    return destination;
};

var _makeSnap = function(options) {
    var defaults = {
        element: document.getElementById('box-A')
    };
    return new Snap(utils.extend(defaults, options));
};

describe("Translations", function() {

    it("It should open Left", function(done) {

        var snapper = _makeSnap();

        snapper.open('left', function(t){
            var data = snapper.state();

            expect(data.state).to.equal('left');

            snapper.off('animated');
            done();
        });
    });

    it("It should open Right", function(done) {

        var snapper = _makeSnap();

        snapper.open('right', function(t){
            var data = snapper.state();

            expect(data.state).to.equal('right');

            snapper.off('animated');
            done();
        });
    });

    it("It should close", function(done) {

        var snapper = _makeSnap();

        snapper.close(function(t) {
            var data = snapper.state();

            expect(data.state).to.equal('closed');

            snapper.off('animated');
            done();
        });
    });
});

describe("Instances", function() {

    it('It should remain independent', function(done){

        async.series([
            function(cb){

                var snapperB = _makeSnap({
                    element: document.getElementById('box-B')
                });

                snapperB.open('right', function(t){
                    var data = snapperB.state();

                    expect(data.state).to.equal('right');

                    snapperB.off('animated');
                    console.log('F');
                    cb(null, 'completed');
                });
            },

            function(cb){

                var snapperC = _makeSnap({
                    element: document.getElementById('box-C'),
                    minPosition: -100,
                    maxPosition: 100
                });

                snapperC.open('left', function(t){
                    var data = snapperC.state();

                    expect(data.state).to.equal('left');

                    snapperC.off('animated');
                    cb(null, 'completed');
                });
            }
        ], done);
    })

});
