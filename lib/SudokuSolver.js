(function() {
    "use strict";

	var Utils = require('./Utils.js');
	
	/**
	 * The definition objects for sudoku choices.
	 * A SudokuChoice represents choosing a specific number in a specific cell.
	 * They have the ability to be 'executed' to an array of cells which entails
	 * setting the value of the cell they represent to the value they represent.
	 * @constructor
	 * @private
	 */
	function SudokuChoice(val, cellNo) {
		this.val = val;
		this.cellNo = cellNo;
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

	SudokuChoice.prototype.toString = function() {
		return this.val + " in cell " + this.cellNo;
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
	 * @param {number} selection the value that is in fixed in the sudoku problem.  Must be 1-9.
	 * @param {number} cellNo the number of the cell that is fixed to this value. Must be 0-80.
	 * @param {CircularList[]} an array to which is added any nodes that were hidden during this fixing.
	 * 					this is so that a number of fixing operations can easily be reversed after
	 * 					solving this puzzle.
	 */
	SudokuSolver.prototype.fix = function(selection, cellNo, fixed) {
		var selectionIdx = this.possibleEntries.indexOf(selection);
		this.choices[cellNo][selectionIdx].choose(fixed);
	};

	/**
	 * Turns a string with extra characters into a simple string of numbers and .'s (to represent unfilled spaces).
	 * @private
	 */
	function parseSudoku(puzzle) {
		puzzle = puzzle.replace(illegalCharsRegex, "");
		if (puzzle.length > 81) {
			//assume space is a format character rather than a gap character
			puzzle = puzzle.replace(/ /g, "");
		}
		puzzle = puzzle.replace(gapRegex, ".");
		return puzzle;
	}
	
	var illegalCharsRegex = /[^0-9\. ]/g;
	var gapRegex = /[0 \.]/g;
	/**
	 * Solves a puzzle passed in in a string format, with ., 0 or space indicating unfilled squares.
	 * e.g.
	 * <pre>".6.3..8.4537.9.....4...63.7.9..51238.........71362..4.3.64...1.....6.5231.2..9.8."</pre>
	 * @param {String} puzzle a string representation of a sudoku puzzle.  May not be null.
	 * @param {number} [maxSolutions] the maximum number of solutions to find.  Will attempt to find all solutions if not set.
	 * @param {number} [maxTime] the maximum time in milliseconds to spend looking for solutions.  Will not have a time limit if not set. 
	 */
	SudokuSolver.prototype.solve = function(puzzle, maxSolutions, maxTime) {
		var deleted = [];
		puzzle = parseSudoku(puzzle);
		for ( var i = 0; i < puzzle.length; ++i) {
			var setting = puzzle.charAt(i);
			if (setting != '.')	{
				this.fix(setting, i, deleted);
			}
		}
		var results = this.network.solve(maxSolutions, maxTime);
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
	 * Adds line breaks and other characters into a string to show sudoku boards in a slightly nicer way.
	 * @param {String} str a string representation of a sudoku board.
	 */
	SudokuSolver.prototype.showBoard = function(str) {
		str = parseSudoku(str);
		var arr = str.split("");
		for ( var row = 0; row < 9 && (row * 9) <= arr.length; ++row) {
			var rowCharNo = row * 9;
			if (rowCharNo + 3 < arr.length) {
				arr[rowCharNo + 3] = " | "+arr[rowCharNo + 3];
			}
			if (rowCharNo + 6 < arr.length) {
				arr[rowCharNo + 6] = " | "+arr[rowCharNo + 6];
			}
			if (row > 0 && rowCharNo < arr.length) {
				arr[rowCharNo] = "\n" + arr[rowCharNo];
				if (row % 3 == 0) {
					arr[rowCharNo] = "\n----+-----+----"+arr[rowCharNo];
				}
			}
		}
		return arr.join("");
	};

	Utils.publisher(typeof module != 'undefined' ? module : undefined)("SudokuSolver", SudokuSolver);
})();
