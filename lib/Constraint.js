(function() {
	"use strict";
	
	var Utils = require('./Utils.js');
	
	function Constraint(description) {
		TableNode.call(this);
		this.actives = 0;
		this.description = description;
		this.optional = false;
		
		this.rowChain.enumerable = false;
		this.colChain.enumerable = false;
	};
	Utils.extend(Constraint, "./TableNode.js");
	
	Constraint.prototype.toString = function() {
		return this.description + "(" + this.actives + ")!";
	};
	
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