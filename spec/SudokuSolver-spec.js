var SudokuSolver = require('../lib/SudokuSolver.js');

describe("A SudokuSolver,", function() {
	var sudokuSolver;
	
	beforeEach(function() {
		sudokuSolver = new SudokuSolver();
	});
	
	it("finds the expected solution to some simple sudoku problems.", function() {
		var problems = [
			".6.3..8.4537.9.....4...63.7.9..51238.........71362..4.3.64...1.....6.5231.2..9.8.",
			"...7..21.....59.43.....89..8.2......65..1..24......5.7..72.....91.58.....84..6...", // http://www.sudoku.ws/extreme-18.htm
			"4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......", // http://norvig.com/sudoku.html
			"..53.....8......2..7..1.5..4....53...1..7...6..32...8..6.5....9..4....3......97.." // http://www.mirror.co.uk/news/weird-news/worlds-hardest-sudoku-can-you-242294
		];
		
		var expectedSolutions = [
			["261375894537894162948216357694751238825943671713628945356482719489167523172539486"],
			["495763218728159643361428975872645391653917824149832567537291486916584732284376159"],
			["417369825632158947958724316825437169791586432346912758289643571573291684164875293"],
			["145327698839654127672918543496185372218473956753296481367542819984761235521839764"]
	    ]
		
		for (var i = 0; i < problems.length; ++i) {
			var problem = problems[i];
			var startTime = new Date().getTime();
			var foundSolutions = sudokuSolver.solve(problem);
			var took = new Date().getTime() - startTime;

			expect(foundSolutions).toEqual(expectedSolutions[i])

			// NON FUNCTIONAL: PERFORMANCE: should solve these puzzles in less than 10 seconds.
			expect(took < 10000).toEqual(true);
		}
	
	});
});