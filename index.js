var postcss = require('postcss');

module.exports = postcss.plugin('postcss-write-svg', function () {
	function escapeQuotes(string) {
		return string.replace(/(^|[^\\])"/g, '$1\\"');
	}

	function escapeURI(string) {
		return encodeURIComponent(string.replace(/&/g, '%26')).replace(/%3C/g, '<').replace(/%3E/g, '>').replace(/%22/g, '"').replace(/[()'"]/g, '\\$&');
	}

	function escapeContent(string) {
		return string.replace(/^(['"])(.+)\1$/g, '$2').replace(/</g, '&lt;');
	}

	function createXML(node) {
		var selector   = node.selector;
		var tagName    = selector ? selector : 'svg';
		var attributes = selector ? {} : { xmlns: 'http://www.w3.org/2000/svg' };
		var childNodes = node.nodes;
		var innerXML   = '';
		var outerXML   = '<' + tagName;

		if (childNodes) {
			for (var index = 0, childNode; childNode = childNodes[index]; ++index) {
				if (childNode.type === 'rule') {
					innerXML += createXML(childNode);
				} else if (childNode.type === 'decl') {
					if (childNode.prop === 'content') {
						innerXML += escapeContent(childNode.value);
					} else {
						attributes[childNode.prop] = childNode.value;
					}
				}
			}
		}

		for (var name in attributes) {
			outerXML += ' ' + name + '="' + escapeQuotes(attributes[name]) + '"';
		}

		if (innerXML) {
			outerXML += '>' + innerXML + '</' + tagName + '>';
		} else {
			outerXML += '/>';
		}

		return outerXML;
	}

	function addSVG(atrule) {
		var value  = 'url("data:image/svg+xml;charset=utf8,' + escapeURI(createXML(atrule)) + '")';

		atrule.parent.insertBefore(atrule, postcss.decl({
			prop:  'background-image',
			value: value
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
