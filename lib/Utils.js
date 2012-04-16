(function() {
	"use strict";
	
	var Utils = {};
	
	/**
	 * Takes a string and interpolates the other arguments. The format expected
	 * for the string is that {0} indicates the first thing to be interpolated.
	 * 
	 * An example:
	 * <pre>interpolate("{0} world", "hello") == "hello world";</pre>
	 * 
	 * Will interpolate something into potentially many places in the string.
	 * 
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
	function publishToGlobal(name, publication) {
		this[name] = publication;
		publishCache[name] = publication;
		var subclasses = waitingToSubclass[name]; 
		delete waitingToSubclass[name];
		if (subclasses != null) {
			for (var i = 0; i < subclasses.length; ++i) {
				Utils.extend(subclasses[i], name);
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
	
	if (typeof require == 'undefined') {
		require = function(pathname) {
			return publishCache[moduleNameFromPath(pathname)];
		};
	}
	
	Utils.extend = function(subclass, modulePath) {
		var superclass = require(modulePath);
		if (superclass == null) {
			// we must be in the browser, and this module has not yet been included
			var moduleName = moduleNameFromPath(modulePath)
			var subclasses = waitingToSubclass[moduleName];
			if (subclasses == null) waitingToSubclass[moduleName] = subclasses = [];
			subclasses.push(subclass);
		} else {
			subclass.prototype = Object.create(superclass);
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