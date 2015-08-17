var gulp          = require('gulp'),
    del           = require('del'),
    bowerFiles    = require('main-bower-files'),
    runSequence   = require('run-sequence'),
    series        = require('stream-series'),
    glob          = require('glob'),
    fabricator    = require('gulp-fabricator'),
    browserSync   = require('browser-sync').create(),
    config        = require('./gulp.config')(),
    stylish       = require('gulp-tslint-stylish'),
    $             = require('gulp-load-plugins')({lazy: true});


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
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            precision: 10
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest(config.path.tmp))
        // Concatenate and minify styles
        .pipe($.if('*.css', $.minifyCss()))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(config.path.build))
        .pipe(browserSync.stream())
        .pipe($.size({
            title: 'styles'
        }));
});


/**
 * Gulp: HTML
 * 
 */

gulp.task('html', function() {
  var assets = $.useref.assets({searchPath: '{.tmp,src/client}'});

  return gulp.src(config.path.bd.html)
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
 * 
 */

gulp.task('ngAnnotate', function() {
  var appStream = gulp.src([config.path.source.JS])
  .pipe($.plumber())
  .pipe($.ngAnnotate())
  .pipe(gulp.dest(config.path.client));
});


/**
 *  Gulp: Inject Typescript
 *  
 */

gulp.task('inject:ts',function() {
  var tsTarget = gulp.src('./typings/tsd.d.ts');
  var tsStream = gulp.src(config.path.source.TS, {
      read: false
  });
  return tsTarget.pipe($.inject(tsStream, {relative: true})).pipe(gulp.dest('typings'))
});

/**
 *  Gulp: Inject SCSS
 *  
 */

gulp.task('inject:scss',function() {
  var scssStream = gulp.src([config.path.source.scss,'!src/client/app.scss'], {
      read: false
  });
  var cssTarget = gulp.src(config.path.styles);
  return cssTarget.pipe($.inject(scssStream, {relative: true})).pipe(gulp.dest(config.path.client))
});


/**
 *  Gulp: Inject JS + Angular into Html
 *  
 */

gulp.task('inject:html', function() {
  // Vendor Files
  var vendorStream = gulp.src([config.path.vendors], {
      read: false
  });
  var appStream = gulp.src(config.jsOrdered);

  // Angular Files
  var target = gulp.src(config.path.appMain);
  return target.pipe($.inject(series(vendorStream, appStream), {ignorePath: 'build'} ))
      .pipe($.inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower' ,relative: true}))
      .pipe(gulp.dest(config.path.client))
});

/**
 *  Gulp: Inject Everything
 *  
 */

gulp.task('inject:all',['inject:ts','inject:scss','inject:html']);


/**
 *  Generate TemplateCache
 *  
 */

gulp.task('templatecache', ['clean-code'], function() {
    return gulp
        .src(config.path.source.htmltemplates)
        .pipe($.minifyHtml({empty: true}))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.path.tmp));
});


/**
 *  Gulp: Clean Task
 *  Remove Files from tmp, dist, ui-docs
 *  
 */

gulp.task('clean', function(cb) {
  del(['./.tmp', 'build/*', 'ui-docs', '!build/.git'], {
      dot: true
  }, cb)
});

/**
 * Remove all images from the build folder
 * 
 */
gulp.task('clean-images', function(done) {
    del(config.path.build + 'images/**/*.*', done);
});


/**
 *  Gulp: Transpile Typescript
 *  
 */

var tsProject = $.typescript.createProject({
    declarationFiles: true,
    noExternalResolve: true,
    module: 'amd'
});

gulp.task('typescript', function() {
  gulp.src([config.path.source.TS,config.path.typings])
  .pipe($.sourcemaps.init())
  .pipe($.typescript(tsProject))
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest(config.path.build))
  .pipe(browserSync.stream());
});


/**
 * Copy over remaining files 
 * Build Version
 */

gulp.task('copy:build', function(){
  gulp.src(config.path.source.html)
  .pipe(gulp.dest(config.path.build));
});

/**
 *  Copy over remaining files 
 *   Dist Version
 */

gulp.task('copy:dist', function(){
  gulp.src(config.path.build + '**/*.html')
  .pipe(gulp.dest(config.path.dist));
});

/**
 * Compress images
 * 
 */

gulp.task('images', ['clean-images'], function() {
    return gulp
        .src(config.path.source.images)
        .pipe($.imagemin({optimizationLevel: 4}))
        .pipe(gulp.dest(config.build + 'images'));
});


/**
 * Default Task Run Sequence
 * 
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
          baseDir: [config.path.build,'./.tmp','./scripts/'] 
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

  gulp.watch(config.path.source.html,['copy:build']).on('change', browserSync.reload);
  gulp.watch(config.path.source.TS, ['typescript']);
  gulp.watch(config.path.source.scss, ['styles']);
});


/**
 *  Vet
 *  
 */

gulp.task('vet',function(){
  gulp.src(config.path.source.TS)
    .pipe($.tslint())
    .pipe($.tslint.report(stylish, {
        emitError: false,
        sort: true,
        bell: true
      }));
});


/**
 *  Serve the Angular App
 *  Task: 'gulp serve'
 */

gulp.task('serve', function() {
    runSequence(
        'clean',
        'typescript',
        'inject:all',
        'styles',
        'images',
        'copy:build',
        'browserSync'
    )
});

/**
 *  Serve the Angular App
 *  Task: 'gulp serve'
 */

gulp.task('build', function() {
    runSequence(
        'clean',
        'typescript',
        'inject:all',
        'styles',
        'images',
        'copy:build',
        'html'
    )
});


/**
 *  Generate KSS Objects
 *  Task: "gulp ui-kit-generator"
 *  Pull CSS Comments out of the scss files and into objects
 *  TODO: Decide what to do with these
 */
gulp.task('ui-kit-generator', function() {
    return gulp.src(config.path.source.styles)
        .pipe(fabricator({
            output: 'index.html'
        }))
        .pipe(gulp.dest('ui-docs'));
});


/**
 * Create a visualizer report
 * 
 */
gulp.task('plato', function(done) {
    console.log('Analyzing source with Plato');
    console.log('Browse to /report/plato/index.html to see Plato results');

    startPlatoVisualizer(done);
});


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
});


/**
 * Start Plato inspector and visualizer
 * 
 */

function startPlatoVisualizer(done) {
    console.log('Running Plato');

    var files = glob.sync(config.plato.js);
    var excludeFiles = /.*\.spec\.js/;
    var plato = require('plato');

    var options = {
        title: 'Plato Inspections Report',
        exclude: excludeFiles
    };
    var outputDir = config.path.report + '/plato';

    plato.inspect(files, outputDir, options, platoCompleted);

    function platoCompleted(report) {
        var overview = plato.getOverviewReport(report);
        if (done) { done(); }
    }
};
