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

        snapper.open('left', function(data){
            expect(data.state).to.equal('left');
            done();
        });
    });

    it("It should open Right", function(done) {

        var snapper = _makeSnap();

        snapper.open('right', function(data){
            expect(data.state).to.equal('right');
            done();
        });
    });

    it("It should close", function(done) {

        var snapper = _makeSnap();

        snapper.close(function(data) {
            expect(data.state).to.equal('closed');
            done();
        });
    });
});

describe("Instances", function() {

    it('It should remain independent', function(done){

        // Increase the timeout
        this.timeout(10*1000);

        var snapperB = _makeSnap({
            element: document.getElementById('box-B')
        });
        var snapperC = _makeSnap({
            element: document.getElementById('box-C'),
            minPosition: -100,
            maxPosition: 100
        });
        async.series([

            // Open right
            function(cb){
                snapperB.open('right', function(data){
                    expect(data.state).to.equal('right');
                    cb(null, 'completed');
                });
            },

            // Open left
            function(cb){
                snapperC.open('left', function(data){
                    expect(data.state).to.equal('left');
                    cb(null, 'completed');
                });
            },

            // Close right
            function(cb){
                snapperB.close(function(data){
                    expect(data.state).to.equal('closed');
                    cb(null, 'completed');
                });
            },

            // Close left
            function(cb){
                snapperC.close(function(data){
                    expect(data.state).to.equal('closed');
                    cb(null, 'completed');
                });
            },
        ], done);
    })

});
