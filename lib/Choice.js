(function() {
	"use strict";
	
	var Utils = require('./Utils.js');
	
	function Choice(description) {
		TableNode.call(this);
		this.actives = 0;
		this.description = description;
		
		this.rowChain.enumerable = false;
		this.colChain.enumerable = false;
	};
	Utils.extend(Choice, "./TableNode.js");
	
	Choice.prototype.toString = function() {
		return this.description + "?";
	};
	
	Choice.prototype.choose = function(removedNodes) {
		this.forEachCol(function(node) {
			node.data.columnHeader.satisfy(removedNodes);
		});
	};
	
	Choice.prototype.remove = function(removedNodes) {
		removedNodes.push(this.colChain);
		this.colChain.hide();
		this.forEachColumn(function(data) {
			removedNodes.push(data.colChain);
			data.colChain.hide();
		});
	};
	
	Utils.publisher(typeof module != 'undefined' ? module : undefined)("Choice", Choice);

})();