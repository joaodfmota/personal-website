var browserSync = require('browser-sync').create();
var gulp = require('gulp');
var nunjucksRender = require('gulp-nunjucks-render');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');

var config = {
  source: 'source/',
  dist: 'dist/'
};

// ### Clean
// `gulp clean` - Deletes the build folder entirely.
gulp.task('clean', require('del').bind(null, [config.dist]));

// ### Styles
// `gulp styles` - Compiles, combines, and optimizes project CSS.
// By default this task will only log a warning if a precompiler error is
// raised. If the `--production` flag is set: this task will fail outright.
gulp.task('styles', function () {
  return gulp.src(config.source + 'assets/styles/**/*.+(scss|sass)')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError)) // Using gulp-sass
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.dist + 'assets/styles'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// ### Watch
// `gulp watch` - Use BrowserSync to proxy your dev server and synchronize code
// changes across devices. Specify the hostname of your dev server at
// `manifest.config.devUrl`. When a modification is made to an asset, run the
// build step for that asset and inject the changes into the page.
// See: http://www.browsersync.io
gulp.task('watch', function () {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  gulp.watch('source/**/*.+(html|njk)', ['nunjucks']);
  gulp.watch([config.source + 'assets/styles/**/*'], ['styles']);
});

// ### Nunjucks
// `gulp nunjucks` - Run the nunjuck function.
gulp.task('nunjucks', function () {
  // Gets .html and .nunjucks files in pages
  return gulp.src('source/pages/**/*.+(html|njk)')
    .pipe(plumber())
    // Renders template with nunjucks
    .pipe(nunjucksRender({
      path: ['source/templates']
    }))
    // output files in app folder
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// ### Build
// `gulp build` - Run all the build tasks but don't clean up beforehand.
// Generally you should be running `gulp` instead of `gulp build`.
gulp.task('build', function (callback) {
  runSequence('styles',
    'nunjucks',
    callback);
});

// ### Gulp
// `gulp` - Run a complete build. To compile for production run `gulp --production`.
gulp.task('default', ['clean'], function () {
  gulp.start('build');
});