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
		var TableNode = require('./TableNode.js');
		TableNode.call(this);
		this.actives = 0;
		this.description = description;
		
		this.rowChain.enumerable = false;
	};
	
	Utils.extendModule(Choice, "./TableNode.js", /** @lends Choice */ {
		
		/**
		 * Satisfies all constraints that this choice satisfies.
		 * Satisfying a constraint will hide all nodes linked to it as well as all nodes
		 * in all rows linked to it.  The hidden nodes will be added to the array passed in.
		 * @param hiddenNodes {Array} an array that all nodes hidden as part of this operation will be added to. May not be null.
		 */
		choose: function choose(hiddenNodes) {
			this.forEachSatisfiedConstraint(function(constraint) {
				constraint.satisfy(hiddenNodes);
			});
		},
		
		/**
		 * Removes all nodes in this row from their associated Constraints, indicating that this choice is no longer available to the algorithm.
		 * The pointers holding the row together are maintained, so that only the links into the column structure need to be restored.
		 * @param hiddenNodes {Array} an array that all nodes hidden as part of this operation will be added to. May not be null.
		 */
		remove: function remove(hiddenNodes) {
			this.hideFromColumn(hiddenNodes);
			this.forEachSatisfiedConstraint(function(constraint, constraintLink) {
				constraintLink.hideFromColumn(hiddenNodes);
			});
		},

		/**
		 * Creates a linkage between this Choice and a constraint.
		 * @param constraint {Constraint} a constraint that selecting this choice will satisfy.  May not be null.
		 * @returns {TableNode} the <tt>TableNode</tt> linking this Choice with the constraint.
		 */
		satisfies: function satisfies(constraint) {
			var TableNode = require('./TableNode.js');
			var node = new TableNode(this, constraint);
			node.addToHeadersChains();
			return node;
		},

		/**
		 * Iterates over each of the constraints that would be satisfied by this choice.
		 * @param func {function} a function that is called back with a constraint that would be satisfied by this choice and
		 * 							the TableNode that links this Choice to that Constraint.  Returning <tt>false</tt> will 
		 * 							terminate the loop early. May not be null.
		 */
		forEachSatisfiedConstraint: function forEachSatisfiedConstraint(func) {
			this.forEachColumn(function(constraintLink) {
				var constraint = constraintLink.columnHeader;
				return func(constraint, constraintLink);
			});
		},
		
		toString: function toString() {
			return this.description + "?";
		}
	});

	Utils.publisher(typeof module != 'undefined' ? module : undefined)("Choice", Choice);

})();