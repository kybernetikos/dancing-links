// Fill some gaps (Object.create and console.log
if (!Object.create) {
	Object.create = function (o) {
		if (arguments.length > 1) {
			throw new Error('Object.create implementation only accepts the first parameter.');
		}
		function F() {}
		F.prototype = o;
		return new F();
	};
}
if (typeof print == 'function' && typeof console == 'undefined') {
	console = {log: print};
}

// Load the files
var dependencies = [
    'Utils',
    'CircularList',
    'TableNode',
    'Choice',
    'Constraint',
    'Network',
    'SudokuSolver'
];
var thisScript = arguments[0];
for (var i = 0; i < dependencies.length; ++i) {
	load(thisScript+"/../lib/"+dependencies[i]+".js");
}

// Use them to solve sudoku (warning, fairly slow on rhino - node is *much* faster).....
var problems = [
	".6.3..8.4537.9.....4...63.7.9..51238.........71362..4.3.64...1.....6.5231.2..9.8.",
	"..53.....8......2..7..1.5..4....53...1..7...6..32...8..6.5....9..4....3......97..", // http://www.mirror.co.uk/news/weird-news/worlds-hardest-sudoku-can-you-242294
	"...7..21.....59.43.....89..8.2......65..1..24......5.7..72.....91.58.....84..6...", // http://www.sudoku.ws/extreme-18.htm
	"4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......"  // http://norvig.com/sudoku.html
];

var sudokuSolver = new SudokuSolver();

for (var i = 0; i < problems.length; ++i) {
	var problem = problems[i];
	var startTime = new Date().getTime();
	var foundSolutions = sudokuSolver.solve(problem);
	var took = new Date().getTime() - startTime;

	for (var j = 0; j < foundSolutions.length; ++j) {
		console.log(sudokuSolver.showBoard(foundSolutions[j]));
	}
	console.log("\t"+foundSolutions.length+" solutions found in "+(took / 1000)+"s.");
}