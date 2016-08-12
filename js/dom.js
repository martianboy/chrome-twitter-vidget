$ = document.querySelectorAll.bind(document);
$$ = document.querySelector.bind(document);

var forEach = Array.prototype.forEach;
var slice = Array.prototype.slice;

function extend(obj) {
	slice.call(arguments, 1).forEach(function(source) {
		if (source) {
			for (var prop in source) {
				obj[prop] = source[prop];
			}
		}
	});
	return obj;
}

function El(tag, attrs, content) {
	var groups = tag.match(/(^\w+|\.[\w\-]+|#[\w\-]+|\[[\w\-\=]+\])/g);
	var el = document.createElement(groups[0]);

    if (arguments.length === 2) {
        content = attrs;
        attrs = undefined;
    }

	groups.slice(1).forEach(function(attr) {
		if (attr.startsWith('.'))
			el.classList.add(attr.slice(1));
		else if (attr.startsWith('#'))
			el.id = attr.slice(1);
		else if (attr.startsWith('[') && attr.endsWith(']'))
			el.setAttribute.apply(el, attr.slice(1, attr.length - 1).split('='));
	});

    if (attrs) {
        for (let k of Object.keys(attrs)) {
            el.setAttribute(k, attrs[k]);
        }
    }

	if (content) {
		if (typeof content == 'string')
			el.textContent = content;
		else if (typeof content == 'function')
			el.appendChild(content.call(null));
		else if (content instanceof HTMLElement)
			el.appendChild(content);
		else if (content && content.hasOwnProperty('length'))
			forEach.call(content, function(child) {
				el.appendChild(child);
			});
	}

	return el;
}

var View = {
	init: function(options) {
		this._initView(options);
	},
	_initView: function(options) {

		this.el = options.el;
		this.$ = this.el.querySelectorAll.bind(this.el);

		this.delegateEvents();
		this.createBindings();

		this.model = options.model || {};
		if (options.model)
			this.afterModelIsSet(this.model);
	},

	createBindings: function() {},
	afterModelIsSet: function(model) {},
	render: function() {
		if (this.template)
			this.el.appendChild(this.templateFn(this.model));
	},

	delegateEvents: function() {
		var delegateEventSplitter = /^(\S+)\s*(.*)$/;

		_forEach.call(this.events, function(value, key) {
			var pair = key.match(delegateEventSplitter).slice(1);
			var event = pair[0],
				selector = pair[1];

			if (typeof value === 'function') {
				this.el.addEventListener(event, function(e) {
					if (!selector || e.target.matches(selector))
						value.call(this, e);

				}.bind(this), true);
			}
		}.bind(this));
	},
	undelegateEvents: function() {
		var delegateEventSplitter = /^(\S+)\s*(.*)$/;

		_forEach.call(this.events, function(value, key) {
			var pair = key.match(delegateEventSplitter).slice(1);
			var event = pair[0],
				selector = pair[1];

			if (typeof value === 'function') {
				this.el.removeEventListener(event);
			}
		});
	},
	teardown: function() {
		this.undelegateEvents();
	},

	extend: function(props) {
		return extend(Object.create(View), props);
	},

	trigger: function(type, detail, options) {
		this.el.dispatchEvent(new CustomEvent(type, extend({
			bubbles: true,
			cancelable: true,
			detail: detail
		}, options || {})));
	},

	templateFn: function(model) {
		function createTemplate(template) {
			function resolve(keyPath) {
				if (keyPath.startsWith('{{') && keyPath.endsWith('}}')) {
					return keyPath
						.slice(2, keyPath.length - 2)
						.split('.')
						.reduce(function(val, attr) {
							return val[attr];
						}, model);
				}
				else
					return keyPath;
			}

			if (!template)
				return [];

			return Object.keys(template).map(function(key) {
				var value = template[key];
				if (typeof value === 'string')
					return El(key, resolve(value));
				else if (typeof value === 'function')
					return El(key, value.call(null, model).toString());
				else // if (typeof value === 'object')
					return El(key, createTemplate(value));
			});
		}

		return createTemplate(this.template);
	}
};
