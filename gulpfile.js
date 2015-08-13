var gulp          = require('gulp'),
    del           = require('del'),
    bowerFiles    = require('main-bower-files'),
    runSequence   = require('run-sequence'),
    series        = require('stream-series')
    fabricator    = require('gulp-fabricator'),
    angularFilesort = require('gulp-angular-filesort'),
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
        .pipe($.changed(config.path.tmp, {
            extension: '.css'
        }))
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            precision: 10
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest(config.path.tmp))
        // Concatenate and minify styles
        .pipe($.if('*.css', $.minifyCss()))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(config.path.dist))
        .pipe(browserSync.stream())
        .pipe($.size({
            title: 'styles'
        }));
});


/**
 * Gulp: HTML
 */

gulp.task('html', function() {
  var assets = $.useref.assets({searchPath: '{.tmp,src/client}'});

  return gulp.src(config.path.allHtml)
    .pipe(assets)
    // Concatenate and minify styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.if('*.js', $.uglify()))
    .pipe(assets.restore())
    .pipe($.useref())

    // Minify any HTML
    .pipe($.if('*.html', $.minifyHtml()))
    // Output files
    .pipe(gulp.dest(config.path.dist))
    .pipe($.size({title: 'html'}));
});


/**
 * Gulp: Annotate
 */

gulp.task('ngAnnotate', function() {
  var appStream = gulp.src([config.path.allJS])
  .pipe($.ngAnnotate())
  .pipe(gulp.dest(config.path.client));
})


/**
 *  Gulp: Inject Typescript
 */

gulp.task('inject:ts',function() {
  var tsTarget = gulp.src('./typings/tsd.d.ts');
  var tsStream = gulp.src(config.path.allTS, {
      read: false
  });
  return tsTarget.pipe($.inject(tsStream, {relative: true})).pipe(gulp.dest('typings'))
})

/**
 *  Gulp: Inject SCSS
 */

gulp.task('inject:scss',function() {
  var scssStream = gulp.src([config.path.allSCSS,'!src/client/app.scss'], {
      read: false
  });
  var cssTarget = gulp.src(config.path.styles);
  return cssTarget.pipe($.inject(scssStream, {relative: true})).pipe(gulp.dest(config.path.client))
})


/**
 *  Gulp: Inject JS + Angular into Html
 */

gulp.task('inject:html', function() {
  
  // Vendor Files
  var vendorStream = gulp.src([config.path.scripts], {
      read: false
  });
  var appStream = gulp.src(['./.tmp/**/*.js']).pipe(angularFilesort());

  // Angular Files
  var target = gulp.src(config.path.appMain);
  return target.pipe($.inject(series(vendorStream, appStream), {relative: true}))
      .pipe($.inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower' ,relative: true}))
      .pipe(gulp.dest(config.path.client))
})

/**
 *  Gulp: Inject Everything
 */

gulp.task('inject:all',['inject:ts','inject:scss','inject:html']);



/**
 *  Gulp: Clean Task
 *  Remove Files from tmp, dist, ui-docs
 */

gulp.task('clean', function(cb) {
  del(['./.tmp', 'dist/*', 'ui-docs', '!dist/.git'], {
      dot: true
  }, cb)
})


/**
 *  Gulp: Transpile Typescript
 */

var tsProject = $.typescript.createProject({
    declarationFiles: true,
    noExternalResolve: true
});

gulp.task('typescript', function() {
  var tsResult = gulp.src([config.path.allTS,config.path.allTSD])
  .pipe($.sourcemaps.init())
  .pipe($.typescript(tsProject))
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest(config.path.dist))
  .pipe(browserSync.stream());

})

gulp.task('copy',function(){
  gulp.src(config.path.allHtml)
  .pipe(gulp.dest('dist'));
})

/**
 * Default Task Run Sequence
 */

gulp.task('default', ['clean'], function(cb) {
    runSequence(
        ['styles','ngAnnotate','typescript'],
        'inject:all',
        ['html'],
        cb
    );
});


gulp.task('browserSync',function(){
  browserSync.init({ 
      server: { 
          baseDir: [config.path.dist,'./.tmp','./scripts/'] 
      },
      rewriteRules: [
          {
              match: /..\/.tmp\/|..\/scripts\//g,
              fn: function (match) {
                  return '';
              }
          }
      ]
  });

  gulp.watch(config.path.allHtml,['copy']).on('change', browserSync.reload);
  gulp.watch(config.path.allTS, ['typescript']);
  gulp.watch(config.path.allSCSS, ['styles']);
})


/**
 *  Serve the Angular App
 *  Task: 'gulp serve'
 */

gulp.task('serve', function() {
    runSequence(
      'typescript',
      'inject:all',
      'styles',
      'copy',
      'browserSync'
    )
    
})


/**
 *  Generate KSS Objects
 *  Task: "gulp ui-kit-generator"
 *  Pull CSS Comments out of the scss files and into objects
 *  TODO: Decide what to do with these
 */
gulp.task('ui-kit-generator', function() {
    return gulp.src(config.path.allStyles)
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
        script: config.path.server,
        ext: 'js html',
        env: {
            'NODE_ENV': 'development'
        }
    })
})
