// tooling
const postcss = require('postcss');
const parser  = require('postcss-value-parser');

// plugin
module.exports = postcss.plugin('postcss-place', ({
	utf8 = true
} = {}) => (root) => {
	// all extracted @svg at-rules by name
	const svgs = extractSVGReferences(root);

	// walk declarations
	root.walkDecls((decl) => {
		// whether the declaration has an svg() function
		if (hasSVGFunction(decl)) {
			// replace all svg() functions with url() functions
			decl.value = transformSVGFunctions(decl.value, svgs, utf8);
		}
	});
});

// override plugin#process
module.exports.process = function (cssString, pluginOptions, processOptions) {
	return postcss([
		0 in arguments ? module.exports(pluginOptions) : module.exports()
	]).process(cssString, processOptions);
};

// all extracted @svg at-rules by name
const extractSVGReferences = (root) => {
	// svg at-rules by name
	const svgs = {};

	// walk @svg at-rules
	root.walkAtRules('svg', (atrule) => {
		// add the extracted @svg at-rule by name
		svgs[atrule.params] = atrule.remove();
	});

	return svgs;
};

// whether the declaration has an svg() function
const hasSVGFunction = (decl) => (/svg\(.+\)/).test(decl.value);

// all svg() functions replaced with url() functions
const transformSVGFunctions = (value, svgs, utf8) => parser(value).walk((node) => {
	// whether the node is an svg() function with a first-child
	if (node.type === 'function' && node.value === 'svg' && node.nodes && node.nodes[0]) {
		// matched @svg at-rule by first-child
		const atRule = svgs[node.nodes[0].value];

		// whether the @svg at-rule was matched
		if (atRule) {
			// xml string from the @svg at-rule which honors param() variables
			const xml = generateXML(atRule.clone(), generateParams(node), true);

			// transform the svg() function into a url() function
			node.type  = 'word';
			node.value = generateURL(xml, utf8);
		}
	}
}).toString();

// create an xml string from an @svg at-rule which honors param() variables
const generateXML = (atRule, params, isSVG) => {
	// name of the xml tag
	const tagName = isSVG ? 'svg' : atRule.name;

	// attributes
	const attributes = isSVG ? {
		xmlns: 'http://www.w3.org/2000/svg'
	} : {};

	// stringified xml
	let innerXML = '';
	let outerXML = `<${ tagName }`;

	// for each child of the at-rule
	atRule.nodes.forEach((childNode) => {
		// whether the child is an at-rule
		if (childNode.type === 'atrule') {
			innerXML += generateXML(childNode, params);
		} else if (childNode.type === 'decl') {
			// whether the child is a content property
			if (childNode.prop === 'content') {
				innerXML += escapeWrappedQuotes(childNode.value);
			} else {
				// add an attribute that honors param() variables
				attributes[childNode.prop] = parser(childNode.value).walk((node) => {
					// whether the node is a non-empty var() function
					if (isVarFunction(node)) {
						// whether the var() function was matched
						if (node.nodes[0].value in params) {
							// use the value from the matching param(name value)
							node.type  = 'word';
							node.value = params[node.nodes[0].value];
						} else if (node.nodes[2]) {
							// if possible, use the fallback from var(name, fallback)
							node.type  = 'word';
							node.value = node.nodes[2].value;
						}
					}
				}).toString();
			}
		}
	});

	// for each attribute
	for (let name in attributes) {
		// name="value"
		outerXML += ` ${ name }="${ escapeDoubleQuotes(attributes[name]) }"`;
	}

	// close outerHTML as <tag attributes>content</tag> or <tag attributes/>
	outerXML += innerXML ? `>${ innerXML }</${ tagName }>` : '/>';

	return outerXML;
};

// generate a param object from param(name value) functions
const generateParams = (node) => node.nodes.filter(
	// match only param(name value) functions
	(subnode) => subnode.type === 'function' && subnode.value === 'param' && subnode.nodes && subnode.nodes.length === 3 && subnode.nodes[0].type === 'word' && node.nodes[1].type === 'space'
).reduce(
	// transform all param(name value) functions into an { name: value, ... } object
	(params, param) => Object.assign(params, {
		[param.nodes[0].value]: param.nodes[2].value
	}),
	{}
);

// create a url() from an xml string
const generateURL = (xml, utf8) => `url("data:image/svg+xml;${ utf8 ? `charset=utf-8,${ encodeUTF8(xml) }` : `base64,${ new Buffer(xml).toString('base64') }` }")`;

// escape double quotes
const escapeDoubleQuotes = (string) => string.replace(/(^|[^\\])"/g, '$1\\"');

// escape wrapped quotes and inner <
const escapeWrappedQuotes = (string) => string.replace(/^(['"])(.+)\1$/g, '$2').replace(/</g, '&lt;');

// whether the node is a non-empty var() function
const isVarFunction = (node) => node.type === 'function' && node.value === 'var' && node.nodes && node.nodes.length >= 1;

// encode the string as utf-8
const encodeUTF8 = (string) => encodeURIComponent(
	string
	// collapse whitespace
	.replace(/[\n\r\s\t]+/g, ' ')
	// remove comments
	.replace(/<\!--([\W\w]*(?=-->))-->/g, '')
	// pre-encode ampersands
	.replace(/&/g, '%26')
)
// escape commas
.replace(/'/g, '\\\'')
// un-encode compatible characters
.replace(/%20/g, ' ')
.replace(/%22/g, '\'')
.replace(/%2F/g, '/')
.replace(/%3A/g, ':')
.replace(/%3D/g, '=')
// encode additional incompatible characters
.replace(/\(/g, '%28')
.replace(/\)/g, '%29');
