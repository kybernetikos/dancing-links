var TableNode = require('../lib/TableNode.js');
var CircularList = require('../lib/CircularList.js');

describe("A TableNode,", function() {
	var tableNode, mockRowHeader, mockColHeader;
	
	beforeEach(function() {
		mockRowHeader = { actives: 0 };
		mockColHeader = { actives: 0 };
		tableNode = new TableNode(mockRowHeader, mockColHeader);
	});
	
	it("has two CircularLists (rowChain and colChain) corresponding to rows and columns.", function() {
		expect(tableNode.rowChain instanceof CircularList).toEqual(true);
		expect(tableNode.colChain instanceof CircularList).toEqual(true);
	});
	
	describe("when added into a new row,", function() {
		var otherTableNode, oldRowActivesCount;
		beforeEach(function() {
			oldRowActivesCount = mockRowHeader.actives;
			otherTableNode = new TableNode();
			tableNode.rowChain.spliceInto(otherTableNode.rowChain);
		})
		
		it("triggers an increment to the row header actives count.", function() {
			expect(mockRowHeader.actives).toEqual(oldRowActivesCount + 1); 
		});
	});
	
	describe("when added into a new column,", function() {
		var otherTableNode, oldColActivesCount;
		beforeEach(function() {
			oldColActivesCount = mockColHeader.actives;
			otherTableNode = new TableNode();
			tableNode.colChain.spliceInto(otherTableNode.colChain);
		})
		
		it("triggers an increment to the col header actives count.", function() {
			expect(mockColHeader.actives).toEqual(oldColActivesCount + 1); 
		});
	});
	
});

