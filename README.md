# Write SVG [![Build Status][ci-img]][ci]

<img align="right" width="135" height="95" src="http://postcss.github.io/postcss/logo-leftp.png" title="Philosopher’s stone, logo of PostCSS">

[Write SVG] is a [PostCSS] plugin to write SVGs directly in CSS.

```css
/* before */

.arrow {
    @svg {
        polygon {
            fill: green;
            points: 50,100 0,0 0,100;
        }
    }
}

/* after */

.arrow {
    background-image: url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpolygon%20fill%3D%22green%22%20points%3D%2250%2C100%200%2C0%200%2C100%22%2F%3E%3C%2Fsvg%3E)
}
```

## Usage

Follow these steps to use [Write SVG].

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

## Options

#### encoding

Change the encoding/charset of the SVG.

 - Defaults to `utf8`
 - Possible values: `utf8`, `base64`

*Note:* In IE, SVG's need to be `base64` encoded and will fail otherwise.



[ci]: https://travis-ci.org/jonathantneal/postcss-write-svg
[ci-img]: https://travis-ci.org/jonathantneal/postcss-write-svg.svg
[Gulp PostCSS]: https://github.com/postcss/gulp-postcss
[Grunt PostCSS]: https://github.com/nDmitry/grunt-postcss
[PostCSS]: https://github.com/postcss/postcss
[Write SVG]: https://github.com/jonathantneal/postcss-write-svg
