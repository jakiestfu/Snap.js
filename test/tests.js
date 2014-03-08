var snapper = new Snap({
	element: document.getElementById('content')
});

describe("Translations", function() {

	it("It should open Left", function(done) {

		snapper.on('animated', function(t){
			var data = snapper.state();

			expect( data.state ).to.equal( 'left' );

			snapper.off('animated');
			done();
		});

		snapper.open('left');

	});


	it("It should open Right", function(done) {

		snapper.on('animated', function(t){
			var data = snapper.state();

			expect( data.state ).to.equal( 'right' );

			snapper.off('animated');
			done();
		});

		snapper.open('right');

	});


	it("It should close", function(done) {

		snapper.on('animated', function(t){
			var data = snapper.state();

			expect( data.state ).to.equal( 'closed' );

			snapper.off('animated');
			done();
		});

		snapper.close();

	});

});
