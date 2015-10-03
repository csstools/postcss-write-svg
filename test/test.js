var expect        = require('chai').expect;
var path          = require('path');
var fs            = require('fs');
var postcss       = require('postcss');
var normalizeNewline = require('normalize-newline');


var plugin = require('../');

var encodingMethods = [
	'utf8',
	'base64'
];

function test(name, opts, done) {
	var fixtureDir = './test/fixtures/';
	var baseName   = name.split(':')[0];
	var testName   = name.split(':').join('.');

	var inputPath  = path.resolve(fixtureDir + baseName + '.css');
	var actualPath = path.resolve(fixtureDir + testName + '.actual.css');
	var expectPath = path.resolve(fixtureDir + testName + '.expect.css');

	var inputCSS  = fs.readFileSync(inputPath, 'utf8');
	var expectCSS = fs.readFileSync(expectPath, 'utf8');

	postcss([plugin(opts)]).process(inputCSS, {
		from: inputPath
	}).then(function (result) {
		var actualCSS = result.css;

		fs.writeFileSync(actualPath, actualCSS);

		expect(normalizeNewline(actualCSS)).to.eql(normalizeNewline(expectCSS));
		expect(result.warnings()).to.be.empty;

		done();
	}).catch(function (error) {
		done(error);
	});
}

describe('postcss-write-svg', function () {
	encodingMethods.forEach(function (encodingMethod) {
		var testWithEncoding = function (testName, testDescription) {
			it(encodingMethod + ': ' + testDescription, function (done) {
				test(testName + ':' + encodingMethod, {
					encoding: encodingMethod
				}, done);
			});
		};

		testWithEncoding('basic', 'inlines an svg');
		testWithEncoding('text', 'inlines an svg with text');
	});
});
