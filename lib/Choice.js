(function() {
	"use strict";
	
	var Utils = require('./Utils.js');
	
	/**
	 * A Choice represents an option that can be selected as part of a dancing-links optimization.
	 * <p>It is a TableNode, with a non enumerable row and column chain because it is intended to be used
	 * as a row header.<p>
	 * 
	 * @name Choice
	 * @augments TableNode
	 * @class
	 * @param description {Object} can be anything, but is associated with the choice.
	 */
	function Choice(description) {
		TableNode.call(this);
		this.actives = 0;
		this.description = description;
		
		this.rowChain.enumerable = false;
		this.colChain.enumerable = false;
	};
	Utils.extendModule(Choice, "./TableNode.js");
	
	/**
	 * Satisfies all constraints that this choice satisfies.
	 * Satisfying a constraint will hide all nodes linked to it as well as all nodes
	 * in all rows linked to it.  The hidden nodes will be added to the array passed in.
	 * @param hiddenNodes {Array} an array that all nodes hidden as part of this operation will be added to. May not be null.
	 */
	Choice.prototype.choose = function(hiddenNodes) {
		this.forEachCol(function(node) {
			node.data.columnHeader.satisfy(hiddenNodes);
		});
	};
	
	/**
	 * Removes all nodes in this row, indicating that this choice is no longer available to the algorithm.
	 * @param hiddenNodes {Array} an array that all nodes hidden as part of this operation will be added to. May not be null.
	 */
	Choice.prototype.remove = function(hiddenNodes) {
		hiddenNodes.push(this.colChain);
		this.colChain.hide();
		this.forEachColumn(function(data) {
			hiddenNodes.push(data.colChain);
			data.colChain.hide();
		});
	};
	
	Choice.prototype.toString = function() {
		return this.description + "?";
	};

	Utils.publisher(typeof module != 'undefined' ? module : undefined)("Choice", Choice);

})();