(function(){
    "use strict";
	
	var Utils = require('./Utils.js');
	
	function restoreAll(hidden) {
		for (var i = 0; i < hidden.length; ++i) {
			hidden[i].restore();
		}
	}
	
	function solve(network, maxSolutions, solutions, tryingChoices, latestTime) {
		if (latestTime != null && latestTime < new Date().getTime()) return solutions;
		// Find the constraint with the fewest choices that could satisfy it.
		// (This heuristic should reduce the maximum branching).
		var constraint = network.minConstraint();
		if (constraint == null) {
			// there are no constraints left - it's a solution
			solutions.push(tryingChoices);
		} else if (constraint.actives == 0) {
			// there are no choices that will satisfy a constraint, we have to give up this line of inquiry.
		} else {
			// no solution yet - search for one...
			constraint.forEachSatisfyingChoice(function(choiceToTry) {
				var trying = tryingChoices.slice();
				if (choiceToTry.description != null) trying.push(choiceToTry.description);
				var hidden = [];
				choiceToTry.choose(hidden);
				solve(network, maxSolutions, solutions, trying);
				restoreAll(hidden);
				if (maxSolutions != null && solutions.length >= maxSolutions) return false;
			});
		}
		return solutions;
	}
	
	/**
	 * A network of constraints and choices.
	 * @class
	 * @name Network
	 */
	function Network() {
		var TableNode = require('./TableNode.js');
		TableNode.call(this);
		this.rowChain.enumerable = false;
		this.colChain.enumerable = false;
		this.constraints = {};
	}
	Utils.extendModule(Network, "./TableNode.js", /** @lends Network */ {
		/**
		 * Makes a constraint optional.
		 * It does this by adding a special choice that only satisfies this one constraint, so there will always be a choice
		 * that could satisfy this constraint and won't interfere with other solutions.  The special choice is internal and does
		 * not appear in solutions unlike users constraints.
		 * 
		 * @param {String} constraintName a string identifying a constraint.  May not be null.
		 */
		makeOptional: function makeOptional(constraintName) {
			var constraint = this.ensureConstraint(constraintName);
			if (constraint.optional == false) {
				constraint.optional = true;
				this.add(null, constraintName);
			}
		},
		
		/**
		 * Adds a choice with any constraints it satisfies to the network.
		 * @param {Object} choiceDescription something that describes / defines the choice to be taken.
		 * @param {String} [constraintDescription...] potentially many constraint descriptions that would be satisfied by this choice. 
		 * 						 May not be null or undefined.
		 */
		add: function add(choiceDescription, constraintDescription) {
			var Choice = require('./Choice.js');
			var Constraint = require('./Constraint.js');
			var choice = new Choice(choiceDescription);
			choice.colChain.spliceInto(this.colChain.previous);
			var TableNode = require('./TableNode.js');
			for (var i=1; i<arguments.length; ++i) {
				var constraint = arguments[i];
				if (constraint == null) throw new Error('constraint may not be null');
				if (constraint instanceof Constraint == false) {
					constraint = this.ensureConstraint(constraint);
				}
				choice.satisfies(constraint);
			}
			return choice;
		},
		
		/**
		 * @returns the <tt>Constraint</tt> object that matches the passed constraintName.
		 */
		ensureConstraint: function ensureConstraint(constraintName) {
			var Constraint = require('./Constraint.js');
			var constraint = this.constraints[constraintName];
			if (constraint == undefined) {
				constraint = new Constraint(constraintName);
				this.constraints[constraintName] = constraint;
				constraint.rowChain.spliceInto(this.rowChain.previous);
			}
			return constraint;
		},
		
		/**
		 * @returns true if this network currently represents a problem with no outstanding constraints.
		 */
		isSolved: function isSolved() {
			return this.rowChain.next == this.rowChain;
		},
		
		/**
		 * @returns {Constraint} the <tt>Constraint</tt> that has the fewest ways to be satisfied or null if there are no Constraints left in this network.
		 */
		minConstraint: function() {
			var minConstraint = null;
			var count = null;
			this.forEachColumn(function(constraint) {
				if (count == null || count > constraint.actives) {
					minConstraint = constraint;
					count = minConstraint.actives;
				}
			});
			return minConstraint;
		}, 
		
		/**
		 * @returns {Array} an array of all solutions, where a solution is an array of choice description objects.
		 */
		solve: function(maxRunTime) {
			return solve(this, null, [], [], maxRunTime ? new Date().getTime() + maxRunTime : undefined);
		},
		
		/**
		 * @returns {Array} the first solution found, where a solution is an array of choice description objects.
		 */
		solveOnce: function(maxRunTime) {
			return solve(this, 1, [], [], maxRunTime ? new Date().getTime() + maxRunTime : undefined)[0];
		},
		
		toString: function() {
			var result = "";
			this.forEachRow(function(rowHeader) {
				result += rowHeader.toString();
				rowHeader.forEachColumn(function(node) {
					result+="\t"+node.toString();
				});
				result+="\n";
			});
			return result;
		}
	});

	Utils.publisher(typeof module != 'undefined' ? module : undefined)("Network", Network);
})();