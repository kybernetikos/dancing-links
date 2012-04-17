(function() {
	"use strict";
	
	var Utils = require('./Utils.js');
	
	/**
	 * A CircularList is a doubly-linked list consisting of a single cycle with every item appearing once.
	 * <p>While conceptually it has no start or end, it is useful to be able to iterate over the list segment
	 * starting with one item and covering all of the items once.</p>
	 * @name CircularList
	 * @constructor
	 * @param {object} data the data to be associated with the beginning of the list. This argument is optional and
	 * 						if it is not provided then this list node will be non enumerable. May be <tt>null</tt>, but
	 * 						<tt>undefined</tt> is the same as not providing the argument.
	 * @param {object} lifecycleListener see the description of the lifecycleListener property.
	 */
	var CircularList = function CircularList(data, lifecycleListener) {
		/**
		 * Whether this node is hidden from its list.
		 * @type boolean
		 * @private
		 */
		this.hidden = false;
		
		/**
		 * @type CircularList
		 */
		this.next = this;
		
		/**
		 * @type CircularList
		 */
		this.previous = this;
		
		/**
		 * An object that has the functions <tt>onNodeSpliced</tt>, <tt>onNodeHidden</tt>
		 * and <tt>onNodeRestored</tt>.  All functions are called with the node the even happened
		 * to as the first argument.  <tt>onNodeSpliced</tt> is also passed the node that was previous
		 * to this node before the splice operation.  May be null.
		 */
		this.lifecycleListener = lifecycleListener;
		
		/**
		 * The data associated with this list node.
		 */
		this.data = data;

		/**
		 * Whether or not the data for this node should show up during a <tt>forEach</tt> iteration
		 * of this CircularList.
		 * @type boolean
		 */
		this.enumerable = data !== undefined ? true : false;
	}
	
	var ERROR_MESSAGES = {
			"undefined": "{0}: Bad argument: parameter '{1}' must not be undefined.",
			"notFunc": "{0}: Bad argument: parameter '{1}' must be a function. Was '{2}' (type {3}).",
			"hidden": "{0}: Illegal State: this function may not be called from a hidden node."
	};
	
	CircularList.prototype = {
			// Can be useful for debugging.
			CLASSNAME: 'CircularList',
			/**
			 * This is exposed only for testing purposes.
			 * @private
			 */
			ERROR_MESSAGES: ERROR_MESSAGES,
			
			/**
			 * Iterates over each 'enumerable' item in this circular list once.
			 * Any item that is not enumerable will not appear.  The callback function receives the data item
			 * associated with the list node as its first argument and the the list node itself as the second
			 * argument.
			 * 
			 * <p>May not be called from a 'hidden' node.</p>
			 * 
			 * <p>This function assumes a regular topology - i.e. that the list contains a single cycle, and that
			 * all nodes are in that cycle. It is possible to end up with irregular topologies, in which case this
			 * method could loop forever.  If you expect to call this method on an irregular topology, you should
			 * keep track of all nodes you've visited and terminate by returning <tt>false</tt> when you hit
			 * a node you've already visited.</p>
			 * 
			 * @param {function} func a callback function that can optionally take (data, listnode) as its arguments.
			 * 							It will be called for each 'enumerable' item in the list. If it returns the
			 * 							boolean <tt>false</tt> the iteration will terminate early. May not be null.
			 */
			forEach: function forEach(func) {
				if (typeof func != 'function') Utils.error(ERROR_MESSAGES["notFunc"], "forEach", "func", func, typeof func);
				if (this.hidden !== false) Utils.error(ERROR_MESSAGES["hidden"], "forEach");
				var nextNode = this;
				do {
					var result = nextNode.enumerable ? func(nextNode.data, nextNode) : true;
					if (result === false) break;
					nextNode = nextNode.next;
				} while (nextNode != this);
			},
			
			/**
			 * @returns {Array} an array containing each data item in this list.  Will never be null.  May not be called from a 'hidden' node.
			 */
			toArray: function toArray() {
				var result = [];
				this.forEach(function(val){result.push(val);});
				return result;
			},
			
			/**
			 * Adds this CircularList (potentially consisting of one item referring to itself) into another
			 * CircularList where the splice point is immediately after the 'newPrevious' node.
			 * 
			 * <p>For example: 
			 * <pre>    a → b → c → d → {wraps back to a}
			 *     x → y → z → {wraps back to x}
			 * </pre>
			 * if spliceInto is called with <tt>x.spliceInto(b)</tt> you will end up with a circular list
			 * <pre>    a → b → x → y → z → c → d → {wraps back to a}</pre>
			 * 
			 * @param {CircularList} newPrevious the CircularList node that this CircularList will be inserted after.
			 */
			spliceInto: function spliceInto(newPrevious) {
				var oldPrevious = this.previous;
				this.previous.next = newPrevious.next;
				this.previous = newPrevious;
				newPrevious.next.previous = this;
				newPrevious.next = this;
				if (this.lifecycleListener != null) {
					this.lifecycleListener.onNodeSpliced(this, oldPrevious);
				}
			},
			
			/**
			 * Adds some data to a new node immediately before this node in the circular list.
			 * <p>The fact that it adds it before may seem weird, but that's because I want a CircuclarList to behave
			 * a lot like a normal list, and when you call <tt>push</tt> on a normal list you expect it to add to the end.
			 * In a CircularList, adding before a node is the same as adding to the end of the list segment that starts
			 * with the current node and covers all the nodes in the list.</p> 
			 * 
			 * @param {Object} data the data to be added to the list. May not be <tt>undefined</tt> but may be <tt>null</tt>.
			 * @param {Object} lifecycleListener an optional listener to be notified of changes to the node created to hold this data.
			 * @returns {CircularList} the node containing the newly pushed data.
			 */
			push: function push(data, lifecycleListener) {
				if (data === undefined) Utils.error(ERROR_MESSAGES["undefined"], "add", "data");
				var node = new CircularList(data, lifecycleListener);
				node.spliceInto(this.previous);
				return node;
			},
			
			/**
			 * @returns {boolean} true if this list contains no enumerable items, false otherwise.
			 */
			isEmpty: function isEmpty() {
				if (this.next == this && this.enumerable == false) return true;
				var result = true;
				this.forEach(function() {
					result = false;
					return false;
				});
				return result;
			},
			
			/**
			 * Hides a node from the CircularList it is in.  
			 * <p>While hidden, the CircularList it was in will no longer see it, but it can
			 * be easily <tt>restore</tt>d. Hidden nodes cannot be iterated from.
			 * <p>Hiding creates a CircularList segment (consisting of this node) with an irregular topology.</p>
			 * <p>It is safe to do if either:
			 * <ol><li>No modifications are done to the list it was hidden from other while this node is hidden</li>
			 * <li>The only modifications are to hide other nodes, and when this node is restored, all other
			 * hidden nodes will also be restored. (The usecase of the dancing-links algorithm)</li></ol>
			 * Calling <tt>hide</tt> on a node already hidden does nothing.
			 */
			hide: function hide() {
				if (this.hidden === false) {
					this.hidden = true;
					this.next.previous = this.previous;
					this.previous.next = this.next;
					if (this.lifecycleListener != null) {
						this.lifecycleListener.onNodeHidden(this)
					}
				}
			},
			
			/**
			 * The inverse operation of 'hide'.  
			 * Will restore a node into the same position in an earlier circular list.
			 * This operation overwrites the links of the nodes
			 * surrounding it, so it may corrupt the topology of the original circular list
			 * if it has been changed while this node has been hidden.  See <tt>hide</tt> for more details.
			 * <p>Calling <tt>restore</tt> on a node that isn't hidden will not do anything.
			 */
			restore: function restore() {
				if (this.hidden === true) {
					this.hidden = false;
					this.next.previous = this;
					this.previous.next = this;
					if (this.lifecycleListener != null) {
						this.lifecycleListener.onNodeRestored(this)
					}
				}
			}
	};

	Utils.publisher(typeof module != 'undefined' ? module : undefined)("CircularList", CircularList);

})();