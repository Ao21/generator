module.exports = function() {
    var config = {};
    var wiredep = require('wiredep');
    var bowerFiles = wiredep({devDependencies: true,directory:'scripts'})['js'];
    config.path = {};
    config.styles = {};
    config.path.source = {};
    config.path.dest = {};
    config.path.bd = {};


    config.path.src = './src/';
    config.path.tmp = './.tmp/';
    config.path.dist = './dist/';
    config.path.build = './build/';
    
    config.path.report = './report/';

    config.path.client = config.path.src + 'client/';
    config.path.app = config.path.client + 'app/';


    config.path.source.images = config.path.client + 'images/**/*.*';
    config.path.source.html = config.path.client + '**/*.html';
    config.path.source.JS = config.path.client + '**/*.js';
    config.path.source.TS = config.path.client + '**/*.ts';
    config.path.typings = 'typings/**/*.ts';

    config.path.bd.ts = config.path.build + '**/*.js';
    config.path.bd.html = config.path.build + '**/*.html';

    config.jsOrdered = [
        config.path.build + '**/app.module.js',
        config.path.build + '**/*.module.js',
        config.path.build + '**/*.js'
    ];

    config.path.source.htmltemplates = config.path.app + '**/*.html';

    config.path.styles = config.path.client + 'app.scss';
    config.path.source.scss = config.path.client + '**/*.scss';
    config.path.source.styles = [config.path.src + '*.scss', config.path.src + 'styles/**/*.css'];


    config.path.vendors = './scripts/vendors/*.js';
    config.path.app = config.path.client + 'app/';
    config.path.appMain = config.path.client + 'index.html';


    config.path.server = config.path.src + 'server/app.js';

    config.specHelpers = [config.path.client + 'test-helpers/*.js'];
    config.specs = [config.path.client + '**/*.spec.js'];
    config.serverIntegrationSpecs = [config.path.client + '/tests/server-integration/**/*.spec.js'];

    config.karma = getKarmaOptions();

    config.plato = {js: config.path.build + '**/*.js'};

    config.templateCache = {
        file: 'templates.js',
        options: {
            module: 'app.core',
            root: 'app/',
            standalone: false
        }
    };

    config.styles.AUTOPREFIX = [
        'ie >= 10',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
    ];

    function getKarmaOptions() {
        var options = {
            files: [].concat(
                bowerFiles,
                config.specHelpers,
                config.path.build + '**/*.module.js',
                config.path.client + '**/*.js',
                config.path.build + '**/*.js',
                config.serverIntegrationSpecs
            ),
            exclude: [],
            coverage: {
                dir: config.path.report + 'coverage',
                reporters: [
                    // reporters not supporting the `file` property
                    {
                        type: 'html',
                        subdir: 'report-html'
                    }, {
                        type: 'lcov',
                        subdir: 'report-lcov'
                    }, {
                        type: 'text-summary'
                    } //, subdir: '.', file: 'text-summary.txt'}
                ]
            },
            preprocessors: {'**/*.ts': ['typescript']},
            typescriptPreprocessor: {
                  options: {
                    sourceMap: true,
                    target: 'ES5',
                    noResolve: false
                  },
                  transformPath: function(path) {
                    return path.replace(/\.ts$/, '.js');
                  }
                },
        };
        options.preprocessors[config.path.dist + '**/!(*.spec)+(.js)'] = ['coverage'];
        return options;
    }

    return config;
};
