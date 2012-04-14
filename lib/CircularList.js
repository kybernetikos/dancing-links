(function(publish) {
	"use strict";
	
	/**
	 * A CircularList is a linked list where each end of the list wraps to the other end of the list.
	 * @name CircularList
	 * @constructor
	 * @param {object} data the data to be associated with the beginning of the list. This argument is optional and
	 * 						if it is not provided then this list node will be non enumerable.
	 */
	var CircularList = function CircularList(data) {
		this.next = this;
		this.previous = this;
		this.data = data;
		this.active = true;
		this.enumerable = data !== undefined ? true : false;
	}
	
	CircularList.prototype = {
			// Can be useful for debugging.
			CLASSNAME: 'CircularList',
			/**
			 * Iterates over each 'enumerable' item in this circular list once.
			 * Any item that is not enumerable will not appear.  The callback function receives the data item
			 * associated with the list node as its first argument and the the list node itself as the second
			 * argument.
			 * 
			 * @param {function} func a callback function that can optionally take (data, listnode) as its arguments.
			 * 							It will be called for each 'enumerable' item in the list. 
			 */
			forEach: function(func) {
				var nextNode = this;
				do {
					var result = nextNode.enumerable ? func(nextNode.data, nextNode) : true;
					if (result === false) break;
					nextNode = nextNode.next;
				} while (nextNode != this);
			},
			/**
			 * Uses forEach to construct an array of each enumerable item in this list, starting with the
			 * current list node.
			 */
			toArray: function() {
				var result = [];
				this.forEach(function(val){result.push(val);});
				return result;
			},
			add: function(data) {
				var node = new CircularList(data);
				this.addNextListNode(node);
			},
			isEmpty: function() {
				return (this.next == this && this.enumerable == false) || this.toArray().length == 0 ;
			},
			addNextListNode: function(node) {
				node.next = this.next;
				node.previous = this;
				node.next.previous = node;
				this.next = node;
			},
			addBefore: function(data) {
				var node = new CircularList(data);
				this.addPreviousListNode(node);
			},
			addPreviousListNode: function(node) {
				node.previous = this.previous;
				node.next = this;
				node.previous.next = node;
				this.previous = node;
			},
			remove: function() {
				if (this.active == true) {
					this.previous.next = this.next;
					this.next.previous = this.previous;
					if (this.header != null && this.header != this) this.header.data.activeCount--;
					this.active = false;
				}
			},
			restore: function() {
				if (this.active == false) {
					this.next.previous = this;
					this.previous.next = this;
					if (this.header != null && this.header != this) this.header.data.activeCount++;
					this.active = true;
				}
			}
	};
	
	publish(CircularList);
	
})((typeof module == 'undefined' || (typeof window != 'undefined' && this == window))
	? function(value) {this["CircularList"] = value;}
	: function(value) {module.exports = value;});