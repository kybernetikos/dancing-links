if (typeof require != 'undefined') {
	// For node.
	var CircularList = require('../lib/CircularList.js');
}

describe("A CircularList,", function() {
	var data, list;
	
	beforeEach(function() {
		data = "Hello";
		list = new CircularList(data);
	});

	describe("when newly created with some data,", function() {
		it("has a next and a previous of itself.", function() {
			expect(list.next).toEqual(list);
			expect(list.previous).toEqual(list);
		});
	
		it("iterating with forEach will only fire for itself.", function() {
			var items = [];
			list.forEach(function(item) {
				items.push(item);
			});
			expect(items).toEqual([ data ]);
		});
		
		it("is not empty.", function() {
			expect(list.isEmpty()).toEqual(false);
		});
	});
	
	describe("when an item is added after it,", function() {
		var nextData;
		
		beforeEach(function() {
			nextData = "world";
			list.add(nextData);
		});
		
		it("iterating with forEach will fire for itself and the new item.", function() {
			var items = [];
			list.forEach(function(item) {
				items.push(item);
			});
			expect(items).toEqual([ data, nextData ]);
		});
	});
});