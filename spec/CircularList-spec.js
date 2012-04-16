if (typeof require != 'undefined') {
	// For node.
	var CircularList = require('../lib/CircularList.js');
}

describe("A CircularList,", function() {
	var data, list;
	
	describe("when newly created without any data,", function() {
		beforeEach(function() {
			list = new CircularList();
		});
		
		it("is empty.", function() {
			expect(list.isEmpty()).toEqual(true);
		});
		
		describe("and a data item is pushed after it,", function() {
			var nextData;
			beforeEach(function() {
				nextData = "world";
				list.push(nextData);
			});
			
			it("toArray returns an array with only the new item.", function() {
				expect(list.toArray()).toEqual([ nextData ]);
			});
			it("is not empty.", function() {
				expect(list.isEmpty()).toEqual(false);
			});
		});
	});
	
	describe("when newly created with some data,", function() {
		beforeEach(function() {
			data = "Hello";
			list = new CircularList(data);
		});

		it("has a next and a previous of itself.", function() {
			expect(list.next).toEqual(list);
			expect(list.previous).toEqual(list);
		});
	
		it("toArray returns an array with only itself.", function() {
			expect(list.toArray()).toEqual([ data ]);
		});
		
		it("is not empty.", function() {
			expect(list.isEmpty()).toEqual(false);
		});
		
		describe("and a data item is pushed after it,", function() {
			var nextData;
			var newNode;
			
			beforeEach(function() {
				nextData = "world";
				newNode = list.push(nextData);
			});
			
			it("toArray returns an array with itself and the new item.", function() {
				expect(list.toArray()).toEqual([ data, nextData ]);
			});
			
			it("returning a node that contains the data item", function() {
				expect(newNode instanceof CircularList).toEqual(true);
				expect(newNode.data).toEqual(nextData);
			});
		});
	});
	
	describe("when created with an (empty) header node and 5 data items,", function() {
		var dataItems, thirdNode;
		
		beforeEach(function() {
			list = new CircularList();
			dataItems = ["item1", "item2", "item3", "item4", "item5"];
			for (var i = 0; i < dataItems.length; ++i) {
				var node = list.push(dataItems[i]);
				if (i == 2) thirdNode = node;
			}
		});
		it("forEach calls its callback for all items (and their nodes) until false is returned.", function() {
			var callbackItems = [];
			list.forEach(function(item, node) {
				callbackItems.push(item);
				if (node == thirdNode) return false;
			});
			expect(callbackItems).toEqual(dataItems.slice(0, 3));
		});
		describe("and the third node is hidden,", function() {
			var listener, callbacks;
			
			beforeEach(function() {
				callbacks = [];
				listener = {
						onNodeHidden: function(node) {callbacks.push(node)},
				}
				thirdNode.lifecycleListener = listener;
				thirdNode.hide();
			});
			
			it("toArray returns only the non hidden items.", function() {
				var expected = dataItems.slice();
				expected.splice(2, 1);
				expect(list.toArray()).toEqual(expected);
			});
			
			it("calls the onNodeHidden function on the listener", function() {
				expect(callbacks).toEqual([thirdNode]);
			});
			
			describe("then restored,", function() {
				beforeEach(function() {
					callbacks = [];
					listener.onNodeRestored = function(node) {
						callbacks.push(node);
					};
					thirdNode.restore();
				});
				
				it("toArray returns all the data items.", function() {
					expect(list.toArray()).toEqual(dataItems);
				});
				
				it("calls the onNodeRestored function on the listener", function() {
					expect(callbacks).toEqual([thirdNode]);
				});
			});
		});
		describe("and a two item chain is spliced into it after the third node,", function() {
			var newChain, newData;
			beforeEach(function() {
				newChain = new CircularList("new1");
				newChain.push("new2");
				newChain.spliceInto(thirdNode);
			});
			it("inserts the new chain into the right place.", function() {
				var expected = dataItems.slice();
				expected.splice(3,0,"new1", "new2");
				expect(list.toArray()).toEqual(expected);
			});
		});
	});
});