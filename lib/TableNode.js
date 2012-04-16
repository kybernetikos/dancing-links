(function() {
	"use strict";
	
	var Utils = require('./Utils.js');
	var CircularList = require('./CircularList.js');
	
	/**
	 */
	function TableNode(rowHeader, columnHeader) {
		this.rowHeader = rowHeader;
		this.columnHeader = columnHeader;
		var self = this;
		var listener = {
				onNodeHidden: function onNodeHidden(node) {
					if (node == this.rowChain) {
						if (self.rowHeader != null) self.rowHeader.actives--;
					} else if (node == this.colChain) {
						if (self.columnHeader != null) self.columnHeader.actives--;
					}
				},
				onNodeRestored: function onNodeRestored(node) {
					if (node == this.rowChain) {
						if (self.rowHeader != null) self.rowHeader.actives ++;
					} else if (node == this.colChain) {
						if (self.columnHeader != null) self.columnHeader.actives ++;
					}
				},
				onNodeSpliced: function(node) {this.onNodeHidden(node);}
		};
		this.rowChain = new CircularList(this, listener);
		this.colChain = new CircularList(this, listener);
	};
	
	TableNode.prototype.forEachColumn = function(func) {
		this.rowChain.forEach(func);
	};
	
	TableNode.prototype.forEachRow = function(func) {
		this.colChain.forEach(func);
	};
	
	TableNode.prototype.toString = function() {
		return "{" + this.rowHeader +" x " + this.columnHeader +"}"; 
	};
	
	Utils.publisher(typeof module != 'undefined' ? module : undefined)("TableNode", TableNode);

})();