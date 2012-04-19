(function() {
    "use strict";

	var Utils = require('./Utils.js');
	
	function SudokuChoice(val, cellNo) {
		this.val = val;
		this.cellNo = cellNo;
	};
	
	SudokuChoice.prototype.toString = function() {
		return this.val + " in cell " + this.cellNo;
	};
	
	SudokuChoice.prototype.execute = function(cells) {
		cells[this.cellNo] = this.val;
	};
	
	SudokuChoice.prototype.getRowNo = function() {
		return Math.floor(this.cellNo / 9);
	};
	
	SudokuChoice.prototype.getColNo = function() {
		return this.cellNo % 9;
	};
	
	SudokuChoice.prototype.getRegionNo = function() {
		var colDiv3 = Math.floor((this.cellNo % 9) / 3);
		var rowDiv3 = Math.floor(this.cellNo / 27);
		return colDiv3 + rowDiv3 * 3;
	};

	/**
	 * Applies the dancing-links network to solve Sudoku problems.
	 * @class
	 * @name SudokuSolver
	 */
	function SudokuSolver() {
		var Network = require("./Network.js");
		this.network = new Network();
		this.rowConstraints = [];
		this.colConstraints = [];
		this.regionConstraints = [];
		this.cellConstraints = [];
		this.choices = [];
		this.possibleEntries = [ "1", "2", "3", "4", "5", "6", "7", "8", "9" ];
		this.setUpConstraints(9, 9, 9, this.possibleEntries);
		this.setUpChoices(9 * 9, this.possibleEntries);
	}

	/** @private */
	SudokuSolver.prototype.setUpChoices = function(cells, possibleEntries) {
		for ( var i = 0; i < cells; ++i) {
			this.choices[i] = [];
			for ( var j = 0; j < possibleEntries.length; ++j) {
				var c = new SudokuChoice(possibleEntries[j], i);
				this.choices[i][j] = this.network.add(c,
						this.rowConstraints[c.getRowNo()][j],
						this.colConstraints[c.getColNo()][j],
						this.regionConstraints[c.getRegionNo()][j],
						this.cellConstraints[c.cellNo]
				);
			}
		}
	};

	/** @private */
	SudokuSolver.prototype.setUpConstraints = function(rows, cols, regions, possibleEntries) {
		var rows = 9;
		var cols = 9;
		var cells = rows * cols;
		var regions = 9;
		var possibleEntries = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
		for ( var i = 0; i < rows; ++i) {
			this.rowConstraints[i] = [];
			for ( var j = 0; j < possibleEntries.length; ++j) {
				this.rowConstraints[i][j] = this.network.ensureConstraint(possibleEntries[j] + " in row " + i);
			}
		}
		for ( var i = 0; i < cols; ++i) {
			this.colConstraints[i] = [];
			for ( var j = 0; j < possibleEntries.length; ++j) {
				this.colConstraints[i][j] = this.network.ensureConstraint(possibleEntries[j] + " in col " + i);
			}
		}
		for ( var i = 0; i < regions; ++i) {
			this.regionConstraints[i] = [];
			for ( var j = 0; j < possibleEntries.length; ++j) {
				this.regionConstraints[i][j] = this.network.ensureConstraint(possibleEntries[j] + " in region "	+ i);
			}
		}
		for ( var i = 0; i < cells; ++i) {
			this.cellConstraints[i] = this.network.ensureConstraint("entry in cell " + i);
		}
	};

	/**
	 * Sets some numbers in a sudoku grid to be fixed.
	 */
	SudokuSolver.prototype.fix = function(selection, cellNo, deleted) {
		var selectionIdx = this.possibleEntries.indexOf(selection);
		this.choices[cellNo][selectionIdx].choose(deleted);
	};

	/**
	 * Solves a puzzle passed in in a string format, with . indicating unfilled squares and no white space (the whole puzzle is on one line).
	 * e.g.
	 * <pre>".6.3..8.4537.9.....4...63.7.9..51238.........71362..4.3.64...1.....6.5231.2..9.8."</pre>
	 */
	SudokuSolver.prototype.solve = function(puzzle, maxTime) {
		var deleted = [];
		for ( var i = 0; i < puzzle.length; ++i) {
			var setting = puzzle[i];
			if (setting != ".")
				this.fix(setting, i, deleted);
		}
		var results = this.network.solve(maxTime);
		for ( var i = 0; i < deleted.length; ++i) {
			deleted[i].restore();
		}
		var formattedResults = [];
		for ( var i = 0; i < results.length; ++i) {
			var reportArr = puzzle.split("");
			var thisResult = results[i];
			for ( var i = 0; i < thisResult.length; ++i) {
				thisResult[i].execute(reportArr);
			}
			formattedResults.push(reportArr.join(""));
		}
		return formattedResults;
	};

	/**
	 * Adds line breaks into a string to show sudoku boards in a slightly nicer way.
	 */
	SudokuSolver.prototype.showBoard = function(str) {
		var arr = str.split("");
		for ( var row = 1; row < 9; ++row) {
			arr[row * 9] = "\n" + arr[row * 9];
		}
		return arr.join("");
	};

	Utils.publisher(typeof module != 'undefined' ? module : undefined)("SudokuSolver", SudokuSolver);
})();