import _ from 'lodash';
import Atom from './Atom';

/**
* Contains the declaration for the {@link Component} class.
* @module Component
*/
const _events = ["click", "mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "keydown", "keyup"];
const _events_RE = new RegExp('^on\-(' + _events.join('|') + ')');
const args = function () { return arguments };

let _Component_serial_number = 0;

const argumentNames = (func) => {
    const names = func.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
        .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
        .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
};

const innerMethod = document.body.innerText 
    ? 'innerText' 
    : document.body.textContent
        ? 'textContent'
        : 'innerHTML';

class Component extends Atom {

    constructor(params = {}) {

        super(
              _.merge({
                template: '',
                _template: '',
                _a:[],
                _i:[],
                tag: 'div',
                classes: '',
                element: undefined,
                parent: null,
                components: [],
                on: {}
            }, params || {})
        );

        if (!_.isArray(this.template)) {
            this.template = [this.template];
        }

        _.each(this.template, (bit, index) => {
            if (!_.isFunction(bit)) {
                this.template[index] = bit.replace(/[\t\n\r]+/g,'').replace(/\s+/g, ' ');
            }
        });

        if (!this.name) {
            this.name = 'noname';
        }

        this._globalUID = (this.name || "noname") + ':' + _Component_serial_number++;
        antipode['_ap_global'][this._globalUID] = this;

        this.element = typeof this.element === 'string' 
            ? (this.$parent || document).querySelector(this.element) 
            : this.element;

        this.element.setAttribute("ap-component", this._globalUID);
        
        if (this.classes) {
            this.element.className = this.classes;
        }
        
        this.init();
        this.render();

        return this;
    }

    /**
    * @private
    */
    insertComponent (component, target) {

        if (typeof(component.kind) === "undefined") {
            component.kind = Component;
        }

        let componentInsertionPoint = target || this.element.querySelector('components');

        if (!componentInsertionPoint) {
            componentInsertionPoint = this.element.appendChild(
                document.createElement('components')
            );
        }

        let e = document.createElement(component.tag || this.tag);
        component.element = e;

        let c = new component.kind(component),
            n = c.name.replace(/_[0-9]+$/, ''),
            nn = n, 
            i = 0;

        while ( this.$[nn] ) {
            ++i;
            nn = n + '_' + i;
        };

        this.$[nn] = c;
        c.parent = this;

        componentInsertionPoint.appendChild(e);
        c.init();
        c.render();
    }

    /**
    * @private
    */
    removeComponent (component) {

        const components = _.isArray(component)
            ? component
            : [component];

        let p;

        for (let e in this.$) {
            if (~components.indexOf(this.$[e])) {
                p = this.$[e].element.parentNode;
                if (this.isComponent(p)) {
                    p.parentNode.removeChild(p);
                }
                delete this.$[e];
            }
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
            f = this._f = {},
            myRe = /{{[^\}\}]+\}\}/g,
            myArray = [],
            f_cnt = 0;

        !_.isArray(t) && (t = [t]);
        t = t.slice();

        for (var i = 0, cnt = t.length; i < cnt; ++i) {
            if (_.isFunction(t[i])) {
                const argsNames = argumentNames(t[i]);
                const fn = t[i];
                const tmpFunc = '[' + (f_cnt++) + '](' + argsNames + ')';

                f[tmpFunc] = function(data) {
                    data = data || this.data;
                    const data_args = argsNames.map((item) => {
                        return data[item];
                    });
                    return fn.apply(this, data_args)
                }.bind(this);

                t[i] = '{{' + tmpFunc + '}}';
            }
        };

        t = t.join('');

        this._i = [];

        while ((myArray = myRe.exec(t)) != null) {
            
            if ((sub = t.slice(s, myArray.index)) != '') {
                a.push(sub);
            }

            a.push(myArray[0]);

            let patt = myArray[0],
                refValue = myArray[0].replace(/\{\{|\}\}/g, ''),
                isFunction = /^\[[0-9]+\]/.test(refValue);

            let spotValue = {
                index: a.length - 1, 
                pattern: refValue,
                isFunction
            };

            if (isFunction) {
                let params = refValue.match(/\((.*)\)/);
                if (params) {
                    spotValue.params = params[1].split(',');
                }
            }

            this._i.push(spotValue);
            s = myRe.lastIndex; 
        };

        if (s < t.length - 1) {
            a.push(t.slice(s, t.length)); 
        }
    }

    getHtml () {
        return this._a.join('');
    }

    setValues () {
        this._i.forEach((item) => {
            if (/^\[[0-9]+\]/.test(item.pattern)) {
                this._a[item.index] = '<ap-data data-ap-source="' + item.pattern + '">' + this._f[item.pattern](this.data) + '</ap-data>';
            } else {
                this._a[item.index] = '<ap-data data-ap-source="' + item.pattern + '">' + this.get(item.pattern) + '</ap-data>';
            }
        });
    }

    dataUpdate (data) {
        const keys = Object.keys(data);
        keys.forEach((key) => {
            this.data[key] = data[key]
        });
        this.updateValues(keys);
    }

    updateValues (vals) {
        vals = vals || Object.keys(this.data);
        _.each(this._i, (spot) => {
            if (spot.isFunction) {
                if (_.intersection(spot.params, vals).length > 0) {
                    this.dataLink[spot.pattern].innerHTML = this._f[spot.pattern]();
                }
            } else if (vals.indexOf(spot.pattern) > -1) {
                this.dataLink[spot.pattern][innerMethod] = this.data[spot.pattern];
            }
        });
    }

    makeDataLink () {
        const 
            d = this.data,
            e = this.element,
            n = this._i.map((val) => val.pattern);

        this.dataLink = {};
        n.forEach((value) => {
            let el = e.querySelector('ap-data[data-ap-source="' + value + '"]');
            if (el) {
                this.dataLink[value] = el;
            }
        });
    }

    /**
    * @public
    */
    render () {
        let inner;
        this.setValues();

        const e = this.element;

        const  readAttrs = (node) => {

            var a, i, cnt,
                on_event, handler;

            if (node && (node = node.children).length) {

                _.toArray(node).forEach((n) => {
                    readAttrs(n);
                    a = n.attributes;

                    for (i = 0, cnt = a.length; i < cnt; ++i) {

                        if (on_event = a[i].localName.match(_events_RE)) {
                            handler = a[i].value;

                            var evnt = on_event[1],
                                hdr = handler.match(/^[^\(\s]*/)[0],
                                params = handler.slice(hdr.length);

                            if (this.on && this.on[hdr]) {

                                n.addEventListener(

                                    evnt,

                                    ((hdr, params) => {
                                        return () => {
                                            this.on[hdr].apply(this, eval("args" + params))
                                        }
                                    })(hdr, params),

                                    false
                                );
                            }
                        };
                    }
                });
            }
        }

        if (e) {
            e.innerHTML = this.getHtml();
            this.makeDataLink();
            readAttrs(e);

            if (this.components && this.components.length) {
                const allComponents = this.getComponents();
                this.components.forEach(function(c) {
                    this.insertComponent(
                        _.merge(c, {
                            element: this.element
                        })
                    );
                }.bind(this))
            };

            this.rendered();
        }

        return this;
    }

    rendered () {}

    hasNode () {
        return !!this.element;
    }

    isComponent (c) {
        return !!c.getAttributeNode('ap-component');
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
