# Write SVG <a href="https://github.com/postcss/postcss"><img src="https://postcss.github.io/postcss/logo.svg" alt="PostCSS Logo" width="90" height="90" align="right"></a>

[![NPM Version][npm-img]][npm-url]
[![Build Status][cli-img]][cli-url]
[![Licensing][lic-image]][lic-url]
[![Changelog][log-image]][log-url]
[![Gitter Chat][git-image]][git-url]

[Write SVG] lets you write SVGs directly in CSS.

```css
/* before */

@svg square {
	@rect {
		fill: var(--color, black);
		width: var(--size);
		height: var(--size);
	}
}

.example {
	background: svg(square param(--color green) param(--size 100%)) center / cover;
}

/* after */

.example {
	background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='green' width='100%25' height='100%25'/%3E%3C/svg%3E") center / cover;
}
```

`@svg` at-rules generate SVG elements available to CSS. Within an `@svg`, descendant at-rules (like `@rect`) are interpreted as elements, while declarations (like `width`) are interpreted as attributes.

The `svg()` function renders an `@svg` as a data `url()`. `var()` functions within an `@svg` honor the variables passed in through `param()` functions.

## Options

#### `utf8`

Type: `Boolean`  
Default: `true`

Allows you to define whether UTF-8 or base64 encoding will be used.

```css
/* before { utf8: false } */

@svg square {
	@rect {
		fill: black;
		width: 100%;
		height: 100%;
	}
}

.example {
	background: svg(square);
}

/* after */

.example {
	background: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IGZpbGw9ImJsYWNrIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+");
}
```

## Usage

Add [Write SVG] to your build tool:

```bash
npm install jonathantneal/postcss-write-svg --save-dev
```

#### Node

```js
require('postcss-write-svg').process(YOUR_CSS, { /* options */ });
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
]).process(YOUR_CSS, /* options */);
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
	return gulp.src('./src/*.css').pipe(
		postcss([
			require('postcss-write-svg')({ /* options */ })
		])
	).pipe(
		gulp.dest('.')
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
			use: [
				require('postcss-write-svg')({ /* options */ })
			]
		},
		dist: {
			src: '*.css'
		}
	}
});
```

[npm-url]: https://www.npmjs.com/package/postcss-write-svg
[npm-img]: https://img.shields.io/npm/v/postcss-write-svg.svg
[cli-url]: https://travis-ci.org/jonathantneal/postcss-write-svg
[cli-img]: https://img.shields.io/travis/jonathantneal/postcss-write-svg.svg
[lic-url]: LICENSE.md
[lic-image]: https://img.shields.io/npm/l/postcss-write-svg.svg
[log-url]: CHANGELOG.md
[log-image]: https://img.shields.io/badge/changelog-md-blue.svg
[git-url]: https://gitter.im/postcss/postcss
[git-image]: https://img.shields.io/badge/chat-gitter-blue.svg

[Write SVG]: https://github.com/jonathantneal/postcss-write-svg
[PostCSS]: https://github.com/postcss/postcss
[Gulp PostCSS]: https://github.com/postcss/gulp-postcss
[Grunt PostCSS]: https://github.com/nDmitry/grunt-postcss
