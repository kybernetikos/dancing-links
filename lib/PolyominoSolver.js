(function() {
    "use strict";

	var Utils = require('./Utils.js');
	
	function inBounds(x, y, boundX, boundY) {
		return x >= 0 && x < boundX && y >= 0 && y < boundY;
	};

	/**
	 * A shape that takes part in a Polyomino puzzle.
	 */
	function Shape(color, fills) {
		this.color = color;
		this.fills = fills;
	}
	Shape.prototype.overflows = function(placedX, placedY, boundX, boundY) {
		for (var i = 0; i < this.fills.length; ++i) {
			var checkX = placedX + this.fills[i].x;
			var checkY = placedY + this.fills[i].y;
			if ( ! inBounds(checkX, checkY, boundX, boundY)) return true;
		}
		return false;
	};
	Shape.prototype.paint = function(g, x, y, sqWidth, sqHeight) {
		for (var i = 0; i < this.fills.length; ++i) {
			var sq = this.fills[i];
			g.fillStyle = this.color;
			g.fillRect(x + sq.x * sqWidth, y + sq.y * sqHeight, sqWidth, sqHeight);
			g.strokeRect(x + sq.x * sqWidth, y + sq.y * sqHeight, sqWidth, sqHeight);
		}
	};

	/**
	 * PolyominoSolver
	 */
	function PolyominoSolver(boardWidth, boardHeight, shapes) {	
		var Network = require("./Network.js");
		this.network = new Network();
		this.x = boardWidth;
		this.y = boardHeight;
		this.shapes = shapes;
		this.cellConstraints = [];
		this.shapeConstraints = [];
		this.setUpCellConstraints();
		this.setUpShapeConstraints();
		this.setUpChoices();
	};
	
	/** @private */
	PolyominoSolver.prototype.setUpCellConstraints = function() {
		for (var i = 0; i < this.x * this.y; ++i) {
			this.cellConstraints[i] = this.network.ensureConstraint("cell "+i+" must be filled"); 
		}
	};
	
	/** @private */
	PolyominoSolver.prototype.setUpShapeConstraints = function() {
		for (var i = 0; i < this.shapes.length; ++i) {
			this.shapeConstraints[i] = this.network.ensureConstraint("shape "+i+" must be placed");
		}
	};
	
	function ShapeChoice(idx, shape, posx, posy) {
		this.idx = idx;
		this.shape = shape;
		this.x = posx;
		this.y = posy;
	}
	ShapeChoice.prototype.toString = function() {
		return "Shape "+this.idx+" can be placed at ("+this.x+", "+this.y+")";
	};
	ShapeChoice.prototype.paint = function(g, xStart, yStart, sqWidth, sqHeight) {
		this.shape.paint(g, this.x * sqWidth + xStart, this.y * sqHeight + yStart, sqWidth, sqHeight);
	};
	
	/** @private */
	PolyominoSolver.prototype.setUpChoices = function() {
		for (var shapeIdx = 0; shapeIdx < this.shapes.length; ++shapeIdx) {
			var shape = this.shapes[shapeIdx];
			for (var cell = 0; cell < this.x * this.y; ++cell) {
				var placedX = cell % this.x;
				var placedY = Math.floor(cell / this.y);
				if (shape.overflows(placedX, placedY, this.x, this.y) == false) {
					// this shape can be placed at this location.
					// work out what constraints it fills.
					// one for each cell it covers;
					var addArg = [new ShapeChoice(shapeIdx, this.shapes[shapeIdx], placedX, placedY), this.shapeConstraints[shapeIdx]];
					for (var pointIdx = 0; pointIdx < shape.fills.length; ++pointIdx) {
						var p = shape.fills[pointIdx];
						var cellNo = (p.x + placedX) + (p.y + placedY) * this.x;
						addArg.push(this.cellConstraints[cellNo]);
					}
					this.network.add.apply(this.network, addArg);
				}
			}
		}
	};
	
	PolyominoSolver.prototype.solve = function() {
		var solutions = this.network.solve();
		return solutions;
	};
	
	PolyominoSolver.Shape = Shape;
	
	Utils.publisher(typeof module != 'undefined' ? module : undefined)("PolyominoSolver", PolyominoSolver);
})();