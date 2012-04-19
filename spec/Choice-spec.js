var Choice = require('../lib/Choice.js');
var TableNode = require('../lib/TableNode.js');

describe("A Choice,", function() {
	var choice;
	beforeEach(function() {
		choice = new Choice();
	});
	describe("linked to a number of TableNodes,", function() {
		var tableNodes;
		beforeEach(function() {
			tableNodes = [];
			for (var i = 0; i < 5; ++i) {
				var node = new TableNode(choice, null);
				tableNodes.push(node);
				node.rowChain.spliceInto(choice.rowChain);
			}
		});
		
		it("hides each of them and itself when it is removed.", function() {
			var hidden = [];
			choice.remove(hidden);
			
			for (var i = 0; i < hidden.length; ++i) {
				expect(hidden[i].hidden).toEqual(true);
			}
			
			for (var i = 0; i < tableNodes.length; ++i) {
				expect(tableNodes[i].colChain.hidden).toEqual(true);
			}
			
			expect(choice.colChain.hidden).toEqual(true);
		});
	});
});