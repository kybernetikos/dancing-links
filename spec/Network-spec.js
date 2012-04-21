var Network = require('../lib/Network.js');

describe("A Network,", function() {
	var network;
	function expectSolutions(actual, expected) {
		expect(actual.length).toEqual(expected.length);
		for (var i = 0; i < actual.length; ++i) {
			var aSolution = actual[i];
			aSolution.sort();
			expect(expected).toContain(aSolution);
		}
	};
	
	beforeEach(function() {
		network = new Network();
	});
	
	describe("provided with a single choice and a single constrant", function() {
		beforeEach(function() {
			network.add("piece1", "trick1");
		});
		
		it("will solve it, returning the single solution set.", function() {
			var solutions = network.solve();
			expectSolutions(solutions, [["piece1"]]);
		});
		
		it("when solveOnce is called will return the solution set.", function() {
			expect(network.solveOnce()).toEqual(["piece1"]);
		});
	});
	
	describe("provided with four choices that satisfy two constraints,", function() {
		beforeEach(function() {
			network.add("piece1", "trick1");
			network.add("piece2", "trick2");
			network.add("piece3", "trick1", "trick2");
			network.add("piece4");
		});
		
		it("can solve them, finding the two solution sets.", function() {
			var solutions = network.solve();
			expectSolutions(solutions,[["piece1", "piece2"], ["piece3"]] );
		});
		
		it("when solveOnce is called will return one of the two possible solutions.", function() {
			expect([["piece1", "piece2"], ["piece3"]]).toContain(network.solveOnce());
		});
	});
	
	describe("provided with a mutually incompatible set of choices,", function() {
		beforeEach(function() {
			network.add("piece1", "trick1", "trick4");
			network.add("piece2", "trick2");
			network.add("piece3", "trick1", "trick3");
			network.add("piece4", "trick1", "trick2", "trick3");
		});
		it("when solved will return an empty solution set.", function() {
			var solutions = network.solve();
			expect(solutions.length).toEqual(0);
		});
		it("when solveOnce is called will return undefined.", function() {
			expect(network.solveOnce()).toEqual(undefined);
		})
	});
	
	describe("provided with a set that would be mutually incompatible if one of the constraints were not optional,", function() {
		beforeEach(function() {
			network.add("piece1", "trick1", "trick4");
			network.add("piece2", "trick2");
			network.add("piece3", "trick1", "trick3");
			network.add("piece4", "trick1", "trick2", "trick3");
			network.makeOptional("trick4");
		});

		it("can solve it, finding the two solution sets.", function() {
			var solutions = network.solve();
			
			expectSolutions(solutions, [["piece2", "piece3"], ["piece4"]]);
		});
		
	});
});
