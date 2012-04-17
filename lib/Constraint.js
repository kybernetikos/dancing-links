(function() {
	"use strict";
	
	var Utils = require('./Utils.js');
	
	/**
	 * A Constraint represents a property that must be satisfied once and only once by any set of choices. 
	 * <p>It is a TableNode, with a non enumerable row and column chain because it is intended to be used
	 * as a column header.<p>
	 * 
	 * @name Constraint
	 * @augments TableNode
	 * @class
	 * @param description {Object} can be anything, but is associated with the choice.
	 */
	function Constraint(description) {
		TableNode.call(this);
		this.actives = 0;
		this.description = description;
		this.optional = false;
		
		this.rowChain.enumerable = false;
		this.colChain.enumerable = false;
	};
	Utils.extendModule(Constraint, "./TableNode.js");
	
	Constraint.prototype.toString = function() {
		return this.description + "(" + this.actives + ")!";
	};
	
	/**
	 * Indicates that this constraint has been satisfied, hiding it and all choices that would satisfy it (since
	 * it can only be satisfied by one choice).
	 * @param hiddenNodes {Array} an array that all nodes hidden as part of this operation will be added to. May not be null.
	 */
	Constraint.prototype.satisfy = function(removedNodes) {
		removedNodes.push(this.rowChain);
		this.rowChain.remove();
		this.forEachRow(function(data) {
			var choice = data.rowHeader;
			choice.remove(removedNodes);
		});
	};
	
	Utils.publisher(typeof module != 'undefined' ? module : undefined)("Constraint", Constraint);

})();