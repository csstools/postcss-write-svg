# Write SVG [![Build Status][ci-img]][ci] [![NPM Version][npm-img]][npm]

<img align="right" width="135" height="95" src="http://postcss.github.io/postcss/logo-leftp.png" title="Philosopher’s stone, logo of PostCSS">

[Write SVG] lets you write SVGs directly in CSS.

```css
/* before */

@svg square {
	@rect {
		fill: var(--color, black);
		width: 100%;
		height: 100%;
	}
}

.example {
	background: white svg(square param(--color #00b1ff)) cover;
}

/* after */

.example {
	background: white url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect fill=%22%2300b1ff%22 width=%22100%25%22 height=%22100%25%22/%3E%3C/svg%3E') cover;
}
```

## Usage

Add [Write SVG] to your build tool:

```bash
npm install postcss-write-svg --save-dev
```

#### Node

```js
require('postcss-write-svg')({ /* options */ }).process(YOUR_CSS);
```

#### PostCSS

Add [PostCSS] to your build tool:

```bash
npm install postcss --save-dev
```

Load [Write SVG] as a PostCSS plugin:

```js
postcss([
	require('postcss-write-svg')({ /* options */ })
]);
```

#### Gulp

Add [Gulp PostCSS] to your build tool:

```bash
npm install gulp-postcss --save-dev
```

Enable [Write SVG] within your Gulpfile:

```js
var postcss = require('gulp-postcss');

gulp.task('css', function () {
	return gulp.src('./css/src/*.css').pipe(
		postcss([
			require('postcss-write-svg')({ /* options */ })
		])
	).pipe(
		gulp.dest('./css')
	);
});
```

#### Grunt

Add [Grunt PostCSS] to your build tool:

```bash
npm install grunt-postcss --save-dev
```

Enable [Write SVG] within your Gruntfile:

```js
grunt.loadNpmTasks('grunt-postcss');

grunt.initConfig({
	postcss: {
		options: {
			processors: [
				require('postcss-write-svg')({ /* options */ })
			]
		},
		dist: {
			src: 'css/*.css'
		}
	}
});
```

### Options

#### `encoding`

Type: `String`  
Default: `utf-8`  
Possible Values: `utf-8`, `base64`

Allows you to define the encoding of an SVG.

```css
/* before { encoding: 'base64' } */

@svg square {
	@rect {
		fill: var(--color, black);
		width: 100%;
		height: 100%;
	}
}

.example {
	background: white svg(square param(--color #00b1ff)) cover;
}

/* after */

.example {
	background: white url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IGZpbGw9IiMwMGIxZmYiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=') cover;
}
```

[ci]:      https://travis-ci.org/jonathantneal/postcss-write-svg
[ci-img]:  https://travis-ci.org/jonathantneal/postcss-write-svg.svg
[npm]:     https://www.npmjs.com/package/postcss-write-svg
[npm-img]: https://badge.fury.io/js/postcss-write-svg.svg

[Gulp PostCSS]:  https://github.com/postcss/gulp-postcss
[Grunt PostCSS]: https://github.com/nDmitry/grunt-postcss
[PostCSS]:       https://github.com/postcss/postcss
[Write SVG]:     https://github.com/jonathantneal/postcss-write-svg
