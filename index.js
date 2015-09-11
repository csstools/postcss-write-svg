var extend  = require('util')._extend;
var postcss = require('postcss');

module.exports = postcss.plugin('postcss-write-svg', function (opts) {
	opts = opts || {};

	var elements = {
		svg: {
			xmlns: 'http://www.w3.org/2000/svg'
		}
	};

	function escapeQuotes(string) {
		return string.replace(/([^\\])"/g, '$1\\"');
	}

	function createElement(node) {
		var nodeName   = (node.selector || 'svg').toLowerCase();
		var markup     = '<' + nodeName;
		var attributes = extend({}, elements[nodeName]);
		var children   = [];

		if (node.nodes) {
			node.nodes.forEach(function (childNode) {
				if (childNode.type === 'rule') {
					children.push(createElement(childNode));
				} else if (childNode.type === 'decl') {
					attributes[childNode.prop] = childNode.value;
				}
			});

			Object.keys(attributes).forEach(function (name) {
				markup += ' ' + name + '="' + escapeQuotes(attributes[name]) + '"';
			});
		}

		return markup + (children.length ? '>' + children.join('') + '</' + nodeName + '>' : '/>');
	}

	function addSVG(atrule) {
		atrule.parent.append(postcss.decl({
			prop:  'background-image',
			value: 'url(data:image/svg+xml;utf8,' + encodeURIComponent(createElement(atrule)) + ')'
		}));

		atrule.remove();
	}

	return function (css) {
		return new Promise(function (resolve) {
			css.walkAtRules('svg', addSVG);

			resolve();
		});
	};
});
