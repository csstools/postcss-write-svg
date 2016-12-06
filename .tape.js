module.exports = {
	'postcss-write-svg': {
		'basic': {
			message: 'supports basic usage'
		},
		'basic:base64': {
			message: 'supports { utf8: false } usage',
			options: {
				utf8: false
			}
		},
		'border-image': {
			message: 'supports SVG border-image'
		},
		'g': {
			message: 'supports g tag'
		},
		'path': {
			message: 'supports path tag'
		},
		'text': {
			message: 'supports text in SVG'
		}
	}
};
