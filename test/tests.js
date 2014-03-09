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

            expect( data.state ).to.equal( 'left' );

            snapper.off('animated');
            done();
        });

        snapper.open('left');

    });


    it("It should open Right", function(done) {
        var snapper = _makeOne();

        snapper.on('animated', function(t){
            var data = snapper.state();

            expect( data.state ).to.equal( 'right' );

            snapper.off('animated');
            done();
        });

        snapper.open('right');

    });


    it("It should close", function(done) {
        var snapper = _makeOne();

        snapper.on('animated', function(t){
            var data = snapper.state();

            expect( data.state ).to.equal( 'closed' );

            snapper.off('animated');
            done();
        });

        snapper.close();

    });

});