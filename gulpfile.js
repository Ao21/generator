var gulp          = require('gulp'),
    del           = require('del'),
    runSequence   = require('run-sequence'),
    series        = require('stream-series')
    fabricator    = require('gulp-fabricator'),
    browserSync   = require('browser-sync').create(),
    config        = require('./config/grunt.config'),
    $             = require('gulp-load-plugins')();


/**
 *  Gulp: Styles Task
 *  Preprocess Styles, create sources maps, concat & minify and output to dist
 */
gulp.task('styles', function() {
    var AUTOPREFIXER_BROWSERS = config.AUTOPREFIX;

    // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src(config.path.styles)
        .pipe($.changed('.tmp/styles', {
            extension: '.css'
        }))
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            precision: 10
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest('.tmp'))
        // Concatenate and minify styles
        .pipe($.if('*.css', $.minifyCss()))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('dist'))
        .pipe($.size({
            title: 'styles'
        }));
});

// Scan your HTML for assets & optimize them
gulp.task('html', function() {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/**/*.html')

    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.minifyCss()))
    .pipe(assets.restore())
    .pipe($.useref())

    // Minify any HTML
    .pipe($.if('*.html', $.minifyHtml()))
    // Output files
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});


/**
 *  Gulp: Inject
 */
gulp.task('inject', function() {
  // Vendor Files
  var vendorStream = gulp.src(['./scripts/vendors/*.js'], {
      read: false
  })
  var appStream = gulp.src(['./app/**/*.js'], {
      read: false
  });
  // Angular Files
  var target = gulp.src('./app/index.html');
  return target.pipe($.inject(series(vendorStream, appStream)))
      .pipe(gulp.dest('dist'))
})

/**
 *  Gulp: Clean Task
 *  Remove Files from tmp, dist, ui-docs
 */
gulp.task('clean', function(cb) {
  del(['.tmp', 'dist/*', 'ui-docs', '!dist/.git'], {
      dot: true
  }, cb)
})


/**
 * Default Task Run Sequence
 */
gulp.task('default', ['clean'], function(cb) {
    runSequence(
        'styles',
        ['html','scripts'],
        cb
    );
});


/**
 *  Serve the Angular App
 *  Task: 'gulp serve'
 */
gulp.task('serve', ['default'], function() {
    browserSync.init({
        server: {
            baseDir: "./app/"
        }
    });
})


/**
 *  Generate KSS Objects
 *  Task: "gulp ui-kit-generator"
 *  Pull CSS Comments out of the scss files and into objects
 *  TODO: Decide what to do with these
 */
gulp.task('ui-kit-generator', function() {
    return gulp.src('app/**/*.{sass,scss}')
        .pipe(fabricator({
            output: 'index.html'
        }))
        .pipe(gulp.dest('ui-docs'));
})


/**
 *  Start the Node Server
 *  Task: 'gulp api'
 */
gulp.task('api', function() {
    $.nodemon({
        script: 'server/app.js',
        ext: 'js html',
        env: {
            'NODE_ENV': 'development'
        }
    })
})
