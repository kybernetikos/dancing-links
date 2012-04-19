dancing-links
=============

This is the dancing-links project.  A project that implements [Donald Knuths](http://en.wikipedia.org/wiki/Donald_Knuth) [algorithm X](http://en.wikipedia.org/wiki/Knuth's_Algorithm_X) in javascript using the [dancing links](http://en.wikipedia.org/wiki/Dancing_Links) data structure.  The intention is that the code be [documented](http://dancing-links.herokuapp.com/doc/), readable, with tests (that can run on [cloud9](http://c9.io/kybernetikos/dancing-links)), and that it can work on node.js, in the browser or in Rhino.

You can run the project dev server yourself or you can access it on [heroku](http://dancing-links.herokuapp.com/).

Exact Cover Problem
-------------------

The Exact Cover Problem is an optimisation problem.  Given a set of constraints that must be satisfied and a set of choices, each of which satisfies one or more of the constraints, you need to select a subset of the possible choices that ensures that every constraint is satisfied once and only once.

Here's my favourite explanation:

 > Lets say, you're doing your exam for your piano grade. Lets think of the columns not as columns, but as a precise list of tricks you must show to the examiner that you are able to do before he/she can give you the pass. The examiner is also very easily bored, and will immediately fail you if you do the same trick twice. 
 > Now, think of the rows not as rows, but as an exact song list you can choose from to play to the examiner. You may choose one or more songs from your list of songs. You can choose to play all the songs in your list.
 > Songs can show the examiner different tricks, so she/he can mark you off for them.
 > You must pick a set of songs such that every trick on the examiner's list is fufilled exactly once.
 > 
 > -- [Xi Chen](http://cgi.cse.unsw.edu.au/~xche635/dlx_sodoku/)

As it turns out, a number of well known problems can be represented as Exact Cover problems, such as Sudoku, Pentonimos, N-Queens.
 
Getting Started
---------------
 
Check the code out with git from the [github repository](https://github.com/kybernetikos/dancing-links): git://github.com/kybernetikos/dancing-links.git
 
You can run the tests by using 
 
 	npm test
 
inside the project, or you can run them with build\runtests.cmd (I have been developing in eclipse on windows).
 
Within eclipse you can use 'debug as rhino' on the rhino-index.js file to see some sudoku solved (very slow - node is much faster).
 
You can run the devserver after getting the dependencies with 
 
 	npm install 
 	npm start
 	
Which will start up a web server that serves the bundled js file containing all the code so you can access the files from the browser.  It will also automatically rebuild and serve the jsdoc too.