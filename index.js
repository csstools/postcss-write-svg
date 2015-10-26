var parser  = require('postcss-value-parser');
var postcss = require('postcss');

function getVar(node, name) {
	return node.vars && node.vars[name] || node.parent && getVar(node.parent, name);
}

function escapeDoubleQuotes(string) {
	return string.replace(/(^|[^\\])"/g, '$1\\"');
}

function escapeWrappedQuotes(string) {
	return string.replace(/^(['"])(.+)\1$/g, '$2').replace(/</g, '&lt;');
}

function encodeUTF8(string) {
	return encodeURIComponent(
		string
		.replace(/[\n\r]/gmi, '')
		.replace(/\t/gmi, ' ')
		.replace(/<\!\-\-(.*(?=\-\->))\-\->/gmi, '')
		.replace(/'/gmi, '\\i')
		.replace(/&/g, '%26')
	)
	.replace(/\(/g, '%28')
	.replace(/\)/g, '%29')
	.replace(/%20/g, ' ')
	.replace(/%3D/g, '=')
	.replace(/%2F/g, '/')
	.replace(/%3A/g, ':');
}

function createXML(node, root) {
	var tagName    = root ? 'svg' : node.name;
	var attributes = root ? { xmlns: 'http://www.w3.org/2000/svg' } : {};
	var childNodes = node.nodes;
	var innerXML   = '';
	var outerXML   = '<' + tagName;

	if (childNodes) {
		for (var index = 0, childNode; childNode = childNodes[index]; ++index) {
			if (childNode.type === 'atrule') {
				innerXML += createXML(childNode);
			} else if (childNode.type === 'decl') {
				if (childNode.prop === 'content') {
					innerXML += escapeWrappedQuotes(childNode.value);
				} else {
					attributes[childNode.prop] = childNode.value;
				}
			}
		}
	}

	for (var name in attributes) {
		outerXML += ' ' + name + '="' + escapeDoubleQuotes(attributes[name]) + '"';
	}

	if (innerXML) {
		outerXML += '>' + innerXML + '</' + tagName + '>';
	} else {
		outerXML += '/>';
	}

	return outerXML;
}

module.exports = postcss.plugin('postcss-write-svg', function (opts) {
	var isBase64 = opts && opts.encoding === 'base64';

	return function (css) {
		// svg references
		var svgs = {};

		// walk all SVG at-rules
		css.walkAtRules('svg', function (atrule) {
			// add atrule to references
			svgs[atrule.params] = atrule;

			atrule.remove();
		});

		css.walkDecls(function (decl) {
			// skip unmatched declarations
			if (!/svg/.test(decl.value)) return;

			// update value
			decl.value = parser(decl.value).walk(function (node) {
				// skip non-svg functions
				if (node.type !== 'function' || node.value !== 'svg') return;

				// get matching svg
				var svg = svgs[node.nodes[0].value];

				// skip unmatched svg
				if (!svg) return;

				// rewrite svg as clone
				svg = svg.clone({
					vars: {}
				});

				// for each subnode param
				node.nodes.forEach(function (subnode) {
					// skip non-param nodes
					if (subnode.type !== 'function' || subnode.value !== 'param') return;

					// add var to svg
					svg.vars[subnode.nodes[0].value] = subnode.nodes[2].value;
				});

				// for each svg declaration
				svg.walkDecls(function (svgDecl) {
					// skip declarations without spec variables
					if (!/var\(\s*--/.test(svgDecl.value)) return;

					svgDecl.value = parser(svgDecl.value).walk(function (subnode) {
						// skip non-variable and non-spec variables
						if (subnode.type !== 'function' || subnode.value !== 'var' || !subnode.nodes[0] || !/^--.+/.test(subnode.nodes[0].value)) return;

						// get variable value
						var value = getVar(svg, subnode.nodes[0].value);

						// skip unmatched values
						if (!value) return;

						// replace variable reference with value
						subnode.type = 'word';
						subnode.value = value;
					}).toString();
				});

				// create XML string of SVG
				var xml = createXML(svg, true);

				// build data URI
				var uri = 'data:image/svg+xml;';

				uri += isBase64 ? 'base64,' : 'charset=utf-8,';

				uri += isBase64 ? new Buffer(xml).toString('base64') : encodeUTF8(xml);

				// replace SVG reference with data URI
				node.type  = 'word';
				node.value = 'url(\'' + uri + '\')';
			}).toString();
		});
	};
});
