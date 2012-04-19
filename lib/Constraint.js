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
	 * @param description {Object} can be anything, but is associated with this constraint.
	 */
	function Constraint(description) {
		var TableNode = require('./TableNode.js');
		TableNode.call(this);
		this.actives = 0;
		this.description = description;
		this.optional = false;
		
		// this is a column header, so it shouldn't show up when iterating over the column.
		this.colChain.enumerable = false;
	};
	
	Utils.extendModule(Constraint, "./TableNode.js", /** @lends Constraint */ {
		/**
		 * Indicates that this constraint has been satisfied, hiding it and all choices that would satisfy it (since
		 * it must be satisfied by exactly one choice according to the rules of exact cover).
		 * @param hiddenNodes {Array} an array that all nodes hidden as part of this operation will be added to. May not be null.
		 */
		satisfy: function satisfy(removedNodes) {
			this.hideFromRow(removedNodes);
			this.forEachSatisfyingChoice(function(choice) {
				choice.remove(removedNodes);
			});
		},
		
		/**
		 * Iterates over each choice that could satisfy this constraint.
		 * @param func {function} a function that will be called back with the choice that would satisfy this constraint
		 * 							and the TableNode that links this constraint to that choice.  Returning <tt>false</tt>
		 * 							will terminate the loop early.  May not be null.
		 */
		forEachSatisfyingChoice: function forEachSatisfyingChoice(func) {
			this.forEachRow(function(choiceLink){
				var choice = choiceLink.rowHeader;
				return func(choice, choiceLink);
			});
		},
		
		toString: function toString() {
			return this.description + "(" + this.actives + ")!";
		}
	});
	
	Utils.publisher(typeof module != 'undefined' ? module : undefined)("Constraint", Constraint);

})();