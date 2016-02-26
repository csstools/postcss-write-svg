var tests = {
	'postcss-write-svg': {
		'basic': {
			message: 'supports basic usage'
		},
		'basic:base64': {
			message: 'supports { encoding: base64" } usage',
			options: {
				encoding: 'base64'
			}
		},
		'text': {
			message: 'supports text in SVG'
		},
		'1px-border': {
			message: 'transform 1px border'
		},
		'g': {
			message: 'supports g tag'
		},
		'path': {
			message: 'supports path tag'
		},
		'variables': {
			message: 'supports variable fallbacks'
		}
	}
};

var dir   = './test/';

var fs      = require('fs');
var path    = require('path');
var plugin  = require('./');
var test    = require('tape');

Object.keys(tests).forEach(function (name) {
	var parts = tests[name];

	test(name, function (t) {
		var fixtures = Object.keys(parts);

		t.plan(fixtures.length * 2);

		fixtures.forEach(function (fixture) {
			var message    = parts[fixture].message;
			var options    = Object(parts[fixture].options);
			var warning    = parts[fixture].warning || 0;
			var warningMsg = message + ' (# of warnings)';

			var baseName   = fixture.split(':')[0];

			var inputPath  = path.resolve(dir + baseName + '.css');

			options.from = inputPath;

			var inputCSS = '';
			var expectCSS = '';

			try {
				inputCSS = expectCSS = fs.readFileSync(inputPath,  'utf8');
			} catch (error) {
				fs.writeFileSync(inputPath, inputCSS);
			}

			plugin.process(inputCSS, options).then(function (result) {
				var actualCSS = result.css;

				t.equal(actualCSS, expectCSS, message);

				t.equal(result.warnings().length, warning, warningMsg);
			});
		});
	});
});
