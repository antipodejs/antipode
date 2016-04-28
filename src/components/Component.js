import _ from 'lodash';
import Atom from './Atom';

/**
* Contains the declaration for the {@link Component} class.
* @module Component
*/
const _events = ["click", "mousedown", "mouseup", "mousemove"];
const _events_RE = new RegExp('^on\-(' + _events.join('|') + ')');

let _Component_serial_number = 0;

class Component extends Atom {

	constructor(params = {}) {
		super(
		      _.assignIn({
				template: '',
				_template: '',
				_a:[],
				_i:[],
				element: undefined,
				directive: undefined,
				on: {}
			}, params || {})
		);

		var e = this.element || this.directive;
		this.$parent = e && document.querySelector(e);

		this._globalUID = (this.name || "noname") + ':' + _Component_serial_number++;
		antipode['_ap_global'][this._globalUID] = this;
		
		this.init();
		return this;
	}

	/**
	* @private
	*/
	insertComponent (component, target) {

		var c = new component.kind(component),
			n = c.name.replace(/_[0-9]+$/, ''),
			nn = n, 
			i = 0;

		while(this.$[nn]) {
			++i;
			nn = n + '_' + i;
		};

		this.$[nn] = c;
		c.parent = this;

		if (this.$parent) {
			var e = document.createElement('c');

			target 
				? target.appendChild(e) 
				: this.$parent.querySelector('components').appendChild(e);

			c.init();
			c.element = e;
			c.render();
		}
	}

	/**
	* @public
	*/
	getComponents () {

	   return _.toArray(this.$);
	}

	/**
	* @public
	*/
	$emit (event, data) {

		let c = this, buble;
		while (c && !c[event]) {
			c = c.parent;
		};

		c && (buble = c[event](data));

		if (c && buble !== true) {
			c.parent && c.parent.$emit(event, data);
		}
	}

	/**
	* @private
	*/
	parse (t, i, it) {

		var s = 0, sub, 	
			a = [],
			nd = [],
			myRe = /{{[^\}\}]+\}\}/g,
			found = [];

		while ((found = myRe.exec(t)) != null) {
			
			if ((sub = t.slice(s, found.index)) != '') {
				a.push(sub);
			}

			a.push(found[0]);
			nd.push({
				index: a.length - 1, 
				pattern: found[0].replace(/\{\{|\}\}/g, '')
			});

			s = myRe.lastIndex; 
		};

		if (s < t.length - 1) {
			a.push(t.slice(s, t.length)); 
		}

		return {
			_a: a,
			_i: nd,
			render: function() {
				nd.forEach(function(item) {
					a[item.index] = this.get(item.pattern.replace(/\[.*\]$/,''), i);
				}.bind(this));
				return a.join('')
			}.bind(this)
		}
	}

	/**
	* @private
	*/
	init () {

		var s = 0, sub, 
			t = this.template, 
			a = this._a = [],
			myRe = /{{[^\}\}]+\}\}/g,
			myArray = [];

		!_.isArray(t) && (t=[t]);
		t = t.slice();

		for (var i = 0, cnt = t.length; i < cnt; ++i) {
			if (_.isFunction(t[i])) {
				t[i] = t[i].bind(this)()();
			}
		};

		t = t.join('');

		this._i = [];

		while ((myArray = myRe.exec(t)) != null) {
			
			if ((sub = t.slice(s, myArray.index)) != '') {
				a.push(sub);
			}

			a.push(myArray[0]);
			this._i.push({
				index: a.length - 1, 
				pattern: myArray[0].replace(/\{\{|\}\}/g, '')
			});

			s = myRe.lastIndex; 
		};

		if (s < t.length - 1) {
			a.push(t.slice(s, t.length - 1)); 
		}
	}

	/**
	* @public
	*/
	render () {

		let inner, e;

		this._i.forEach(function(item) {
			this._a[item.index] = this.get(item.pattern);
		}.bind(this));
		
		if (this.element) {
			e = (typeof (this.element) == 'string') 
				? document.querySelector(this.element) 
				: this.element;
		} 
		else if (this.directive) {
			e = document.querySelector(this.directive);
		}

		if (e) {
			inner = this._a.join('');
			e.innerHTML = inner;
			this.$element = e.children[0];
			e.setAttribute("ap-component", this._globalUID);

			var node = e, 
				a, i, cnt, 
				on_event, handler;

			if (node = node.children) {
				_.toArray(node).forEach(function(n) {
					a = n.attributes;
					
					for (i = 0, cnt = a.length; i < cnt; ++i) {
						if (on_event = a[i].localName.match(_events_RE)) {
							handler = a[i].value;
							if (this.on && this.on[handler]) {
								n.addEventListener(on_event[1], this.on[handler], false);
							}
						};
					}	
				}.bind(this));
			}
			this.rendered();
		}

		return this;
	}

	/**
	* @private
	*/
	rendered () {

		if (this.components && this.components.length) {
			this.components.forEach(function(c) {
				this.insertComponent(c);
			}.bind(this))
		};
	}

	/**
	* @private
	*/
	j (str) {
	
		let _stat = str.match(/^(.*) in (.*)$/),
			iterator = _stat[1],
			ar = eval(_stat[2]),
			i = 0;

		return {
			reset: function() {
				i = 0; 
				return ar[i]
			}, 
			next: function() {
				++i; 
				return (i < ar.length - 1) ? ar[i] : null;
			},
			hasNext: function() {
				return i < ar.length - 1;
			}
		}
	}

	/**
	* @private
	*/
	_for (it, o, t) {

		return function() {

			var r = [], arr = this.get(o);

			!_.isArray(t) && (t = [t]);

			for (var i = 0, cnt = arr.length; i < cnt; ++i) {
				t.forEach(function(item) {
					if (_.isFunction(item)) {
						throw new Error('sub loop!! Right now it is not works.');
					}
				});
				
				var j = this.parse(t.join(''), i, it);
				r.push(j.render());
			}

			return r.join('');
			
		}.bind(this)
	}
}


window.antipode = 
	
	typeof(antipode) == "object" && antipode._ap_global
		? antipode 
		: {
			_ap_global: {},

			get: (n) => {
				return antipode['_ap_global'][n]
			},

			'in': (e) => {
				let node = e, c;
				while (!(c = node.getAttributeNode('ap-component'))) {
					node = node.parentNode;
				}
				return c && antipode.get(c.value);
			} 
		};

export default Component;