(function() {
	"use strict";
	
	var glbl = Function("return this;")();
    
	/**
	 * Some utility functions, primarily around cooperating between node / browser and throwing errors.
	 * @public
	 * @name Utils
	 * @namespace
	 */
	var Utils = {};
	
	/**
	 * Takes a string and interpolates the other arguments. 
	 * <p>The format expected for the string is that {0} indicates the first thing to be interpolated, {1} the second, etc.</p>
	 * 
	 * <p>Will interpolate something into potentially many places in the string.</p>
	 * 
	 * @example 
	 * 		interpolate("{0} world", "hello") == "hello world";
	 * 
	 * @static @function
	 * @param {string} str The string into which values should be interpolated.  If null will return null.
	 * @returns {string} the string with values replaced.
	 */
	Utils.interpolate = function interpolate(str) {
		if (str == null) return null;
		for (var i = 1, len = arguments.length; i < len; ++i) {
			str = str.replace("{"+(i-1)+"}", (arguments[i] || "").toString());
		}
		return str;
	}
	
	/**
	 * Throws an Error with the provided message.  Will also interpolate the message with
	 * any additional parameters provided.
	 * 
	 * @param message {string} the message of the thrown error.
	 */
	Utils.error = function error(str) {
		throw new Error(str.interpolate(Array.prototype.slice.call(arguments, 1)));
	}

	var publishCache = {};
	var waitingToSubclass = {};
	var waitingToSubclassProtos = {};
	function publishToGlobal(name, publication) {
		glbl[name] = publication;
		publishCache[name] = publication;
		var subclasses = waitingToSubclass[name]; 
		var protos = waitingToSubclassProtos[name];
		delete waitingToSubclass[name];
		delete waitingToSubclassProtos[name];
		if (subclasses != null) {
			for (var i = 0; i < subclasses.length; ++i) {
				Utils.extendModule(subclasses[i], name, protos[i]);
			}
		}
	}
	
	var moduleNameFromPathRegEx = /([^\\\/]+)(?:\.js)$/;
	function moduleNameFromPath(path) {
		if (typeof path != 'string') throw new Error();
		var modulename = path;
		var matched = path.match(moduleNameFromPathRegEx);
		if (matched) {
			modulename = matched[1];
		}
		return modulename;
	};
	
	if (glbl.require == undefined) {
		/**
		 * In the browser, including Utils.js creates a global <tt>require</tt> function which
		 * loads items that have already been published out of its internal cache.  If
		 * something has not already been published it will return undefined rather than
		 * actually loading the file (as it would in nodejs) in the expectation that it will
		 * be published later on in the file.
		 * 
		 * @lends __global__
		 */
		glbl.require = function(pathname) {
			return publishCache[moduleNameFromPath(pathname)];
		};
	}
	
	/**
	 * Extends one class with another using Object.create.
	 * <p>The superclass is taken as a string to the module so that if (in the browser) the superclass
	 * is lower down in the concatenated file, then we can defer the extending operation until the superclass
	 * has been included too.  This is unnecessary in nodejs.
	 */
	Utils.extendModule = function(subclass, modulePath, protoMethods) {
		if (!protoMethods) throw new Error();
		var superclass = require(modulePath);
		if (superclass == null) {
			// we must be in the browser, and this module has not yet been included
			var moduleName = moduleNameFromPath(modulePath)
			var subclasses = waitingToSubclass[moduleName];
			var protos = waitingToSubclassProtos[moduleName];
			if (subclasses == null) {
				waitingToSubclass[moduleName] = subclasses = [];
				waitingToSubclassProtos[moduleName] = protos = [];
			}
			subclasses.push(subclass);
			protos.push(protoMethods || {});
		} else {
			subclass.prototype = Object.create(superclass.prototype);
			for (var attribute in protoMethods) {
				subclass.prototype[attribute] = protoMethods[attribute];
			}
		}
	}

	/**
	 * Either exports something to the global namespace or makes it available for use
	 * from a node require.
	 * 
	 * You have to use it like this to avoid type errors:
	 * 	<code>Utils.publish(typeof module != 'undefined' ? module : undefined, "ThingToExport", ThingToExport);</code>
	 */
	Utils.publisher = function publisher(module) {
		if (module == undefined || (typeof window != 'undefined' && window == window.window)) {
			return publishToGlobal;
		} else { 
			return function(name, publication) {
				module.exports = publication;
			};
		}
	};
	
	Utils.publisher(typeof module != 'undefined' ? module : undefined)("Utils", Utils);
})();