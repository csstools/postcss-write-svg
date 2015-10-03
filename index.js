var postcss = require('postcss');
var objectAssign = require('object-assign');

var encoderMap = {
	utf8: function(string) {
		return encodeURIComponent(string.replace(/&/g, '%26')).replace(/%3C/g, '<').replace(/%3E/g, '>').replace(/%22/g, '"').replace(/[()'"]/g, '\\$&');
	},
	base64: function(string) {
		return new Buffer(string).toString('base64');
	}
};

var escapeQuotes = function(string) {
	return string.replace(/(^|[^\\])"/g, '$1\\"');
};

var escapeContent = function(string) {
	return string.replace(/^(['"])(.+)\1$/g, '$2')
		.replace(/</g, '&lt;')
		.replace(/&/g, '&amp;');
};

var createXML = function(node) {
	var selector   = node.selector;
	var tagName    = selector ? selector.toLowerCase() : 'svg';
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
};

var addSVG = function(atrule, opts) {
	var encoding = opts.encoding.toLowerCase();
	var encoder = encoderMap[encoding];

	var valueEncoding = 'charset=' + encoding;
	if(encoding === 'base64') {
		valueEncoding = 'base64';
	}
	var value  = 'url("data:image/svg+xml;' + valueEncoding + ',' + encoder(createXML(atrule)) + '")';

	atrule.parent.insertBefore(atrule, postcss.decl({
		prop:  'background-image',
		value: value
	}));

	atrule.remove();
};

var defaults = {
	encoding: 'utf8'
};

module.exports = postcss.plugin('postcss-write-svg', function (options) {
	var opts = objectAssign({}, defaults, options);

	return function (css) {
		return new Promise(function (resolve) {
			css.walkAtRules('svg', function(atrule) {
				addSVG(atrule, opts);
			});

			resolve();
		});
	};
});
