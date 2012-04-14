var express = require('express');
var assetManager = require('connect-assetmanager');
var assetHandler = require('connect-assetmanager-handlers');
var stylus = require('stylus');
var fs = require('fs');
var jsdoc = require('./runjsdoc.js');

var os = require('os');

if (os.platform() == 'win32') {
	// change fs.watchFile so that it doesn't throw an error on windows.
	
	fs.watchFile = function(filepath, callbackfunc) {
		var old = fs.statSync(filepath);
		fs.watch(filepath, function() {
			fs.stat(filepath, function(err, newStat) {
				callbackfunc(old, newStat);
			});
		});
	};
}

var projectroot = __dirname+"/..";
var webroot = projectroot+"/public";
var port = process.env.C9_PORT || process.env.PORT || 7272;

function generateJSDoc(fileContent, path, index, isLast, callback) {
	jsdoc(projectroot+"/lib", {
		a: true,
		d: webroot+"/doc",
		r: true,
		v: true
	});
	callback(fileContent);
}

function processStylus(fileContent, path, index, isLast, callback) {
	stylus(fileContent).set('filename', path).render(function(err, result){callback(result);});
};

function storeInFile(file) {
	return function storeCachedVersion(fileContent, path, index, isLast, callback) {
		fs.writeFile(file, fileContent, function (err) {});
		callback(fileContent);
	};
};

var assetManagerGroups = {
	    'js': {
	        'route': /\/.*\.bundle\.js/,
	        'path': projectroot+'/lib/',
	        'dataType': 'javascript', 
	        'files': ['Utils.js', '*', 'Main.js'],
	        'postManipulate': {
	            '^': [
	                assetHandler.uglifyJsOptimize,
	                storeInFile(webroot+'/code.bundle.js'),
	                generateJSDoc
	            ]
	        }
	    },
	    'css': {
	   	 'route': /\/.*\.bundle\.css/,
	   	 'path': projectroot+'/style/',
	   	 'dataType': 'css',
	   	 'files': ['*'],
	   	 'preManipulate': {
	   		 '^': [processStylus]
	   	 },
	   	 'postManipulate': {
	   		 '^': [storeInFile(webroot+'/style.bundle.css')]
	   	 }
	    }
};

var app = express.createServer();
app.get('*.bundle.*', assetManager(assetManagerGroups));
app.use(express["static"](webroot));

console.log("Dev server serving "+webroot+" on port "+port+".");
app.listen(port);