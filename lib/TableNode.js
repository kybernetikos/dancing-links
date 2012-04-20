(function() {
	"use strict";
	
	var Utils = require('./Utils.js');
	
	/**
	 * A TableNode is a cell in a table which is linked into a row and a column.
	 * <p>The rows and columns are circularly linked {@see CircularList}, so it's a bit like a table
	 * on an doughnut.</p>
	 * <p>Here's an example of a fully linked TableNode:
	 * <pre>
	 *         col1 →  col2 →  col3 → {wraps to col1}
	 *          ↓       ↓       ↓
	 * row1  →  a   →   b   →   c   → {wraps to row1}
	 *  ↓       ↓       ↓       ↓
	 * row2  →  d   →   e   →   f   → {wraps to row2}
	 *  ↓       ↓       ↓       ↓
	 * {to     {to     {to     {to
	 *  row1}   col1}   col2}   col3}
	 * </pre>
	 * It's also possible for the table to be sparse, in which case there are no nodes linking rows with
	 * columns that have no data.</p>
	 * <pre>
	 *         col1 →  col2 →  col3 → {wraps to col1}
	 *          ↓       ↓       ↓
	 * row1  →  a   →           c   → {wraps to row1}
	 *  ↓       ↓               ↓
	 * row2  →          e   →         {wraps to row2}
	 *  ↓               ↓       
	 * {to     {to     {to     {to
	 *  row1}   col1}   col2}   col3}
	 * </pre>
	 * Headers have a property updated when an item is spliced in or hidden or restored, and their <tt>toString()</tt> is
	 * called to determine string represetnation of this node.
	 * 
	 * @param rowHeader {Object} an object with a property <tt>actives</tt> that gets incremented or decremented as this
	 * 								node is spliced into a row, hidden or restored from a row.  Usually a subclass of TableNode.
	 * @param columnHeader {Object} an object with a property <tt>actives</tt> that gets incremented or decremented as this
	 * 								node is spliced into a column, hidden or restored from a column.  Usually a subclass of TableNode.
	 * @class
	 * @name TableNode
	 */
	function TableNode(rowHeader, columnHeader) {
		this.rowHeader = rowHeader;
		this.columnHeader = columnHeader;
		var self = this;
		var listener = {
				onNodeHidden: function onNodeHidden(node) {
					if (node == self.rowChain) {
						if (self.rowHeader != null) self.rowHeader.actives--;
					} else if (node == self.colChain) {
						if (self.columnHeader != null) self.columnHeader.actives--;
					}
				},
				onNodeRestored: function onNodeRestored(node) {
					if (node == self.rowChain) {
						if (self.rowHeader != null) self.rowHeader.actives ++;
					} else if (node == self.colChain) {
						if (self.columnHeader != null) self.columnHeader.actives ++;
					}
				},
				onNodeSpliced: function(node) {this.onNodeRestored(node);}
		};
        var CircularList = require('./CircularList.js');
		this.rowChain = new CircularList(this, listener);
		this.colChain = new CircularList(this, listener);
	};
	
	/**
	 * Iterate over each of the cells linking this node to other columns.
	 * <p>Perhaps counter intuitively, this involves iterating over the row chain.</p>
	 * @see CircularList#forEach
	 * @param func {function} a function that will be called with each data item linking this node's row with a column.
	 */
	TableNode.prototype.forEachColumn = function(func) {
		this.rowChain.forEach(func);
	};
	
	/**
	 * Usually the headers specified in the constructor will be TableNodes in their own right.
	 * If this is the case, you can add a node to the row and columns its headers represent by
	 * calling this function.
	 */
	TableNode.prototype.addToHeadersChains = function() {
		if (this.rowHeader != null) {
			this.rowChain.spliceInto(this.rowHeader.rowChain.previous);
		}
		if (this.columnHeader != null) {
			this.colChain.spliceInto(this.columnHeader.colChain.previous);
		}
	}
	
	/**
	 * Iterate over each of the cells linking this node to other rows.
	 * <p>Perhaps counter intuitively, this involves iterating over the column chain.</p>
	 * @see CircularList#forEach
	 * @param func {function} a function that will be called with each data item linking this node's column with a row.
	 */
	TableNode.prototype.forEachRow = function(func) {
		this.colChain.forEach(func);
	};

	/** 
	 * Hides this TableNode from the column it's in.
	 * @param {CircularList[]} hiddenNodes an array into which the column node will be added.  May not be null.
	 */
	TableNode.prototype.hideFromColumn = function(hiddenNodes) {
		hiddenNodes.push(this.colChain);
		this.colChain.hide();
	};
	
	/**
 	 * Hides this TableNode from the row it's in.
	 * @param {CircularList[]} hiddenNodes an array into which the row node will be added.  May not be null.
	 */
	TableNode.prototype.hideFromRow = function(hiddenNodes) {
		hiddenNodes.push(this.rowChain);
		this.rowChain.hide();
	};
	
	TableNode.prototype.toString = function() {
		return "{" + this.rowHeader +" x " + this.columnHeader +"}"; 
	};
	
	Utils.publisher(typeof module != 'undefined' ? module : undefined)("TableNode", TableNode);

})();