const {src, dest, parallel, watch, lastRun, series} = require('gulp');

const cp = require('child_process');
const del = require('del');
const changed = require('gulp-changed');
const concat = require('gulp-concat');
const emptyPipe = require("gulp-empty-pipe");

const connect = require('gulp-connect');

const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');

const babel = require('gulp-babel');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const eslint = require('gulp-eslint');

const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sass = require('gulp-sass');
const minifyCSS = require('postcss-clean');
const stylelint = require('gulp-stylelint');

const pug = require('gulp-pug');
const htmlmin = require('gulp-htmlmin');
const posthtml = require('gulp-posthtml');
const validateHTML = require('posthtml-w3c');

// Configuring paths and options for different environments
const env = process.env.NODE_ENV || 'dev';

// Config
const config = require('./gulpfile.config.json');

const webpackStreamConfig = {
    output: {
        filename: 'app.js',
    },
    optimization: {
        minimize: env !== 'dev'
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env']
                }
            },
        ]
    },
};

/*System functions*/

// Return only arr of func needed for production build
function getEnvDepPlugins({prodPlugins, devPlugins}) {
    if (env !== 'dev' && typeof prodPlugins !== 'undefined') return prodPlugins;
    if (env === 'dev' && typeof devPlugins !== 'undefined' ) return devPlugins;
    return [];
}

/* / System functions*/

// Clean
function clean() {
    return del(config.paths.dest);
}

// Views
function buildViews() {
    return src(config.paths.views.src)
        .pipe(changed(config.paths.views.dest))
        .pipe(pug(config.options.pug))
        .pipe((env !== 'dev') ? htmlmin(config.options.htmlmin) : emptyPipe())
        .pipe(dest(config.paths.views.dest))
        .pipe(connect.reload());
}

// Vendor styles
function vendorStyles() {
    return src(config.paths.vendorStyles.src)
        .pipe(concat(config.paths.vendorStyles.concat))
        .pipe(postcss(getEnvDepPlugins({
            devPlugins: [minifyCSS()],
            prodPlugins: [minifyCSS()]
        })))
        .pipe(dest(config.paths.vendorStyles.dest));
}

// Styles
function buildStyles() {
    return src(config.paths.styles.src)
        .pipe(sass(config.options.sass))
        .pipe(postcss(getEnvDepPlugins({
            prodPlugins: [autoprefixer(), minifyCSS()],
            devPlugins: [autoprefixer()]
        })))
        .pipe(dest(config.paths.styles.dest))
        .pipe(connect.reload());
}

// Scripts
function buildScripts() {
    return src(config.paths.scripts.src)
        .pipe(webpackStream(webpackStreamConfig))
        .on('error', function handleError() {
            this.emit('end');
        })
        .pipe(dest(config.paths.scripts.dest))
        .pipe(connect.reload());
}

// Vendor fonts
function vendorFonts() {
    return src(config.paths.vendorFonts.src)
        .pipe(dest(config.paths.vendorFonts.dest));
}

// Fonts
function copyFonts() {
    return src(config.paths.fonts.src, {since: lastRun(copyFonts)})
        .pipe(dest(config.paths.fonts.dest))
        .pipe(connect.reload());
}

// Images
function optimizeImages() {
    return src(config.paths.images.src, {since: lastRun(optimizeImages)})
        .pipe(imagemin([
            imagemin.gifsicle(config.options.imagemin.gifsicle),
            imagemin.jpegtran(config.options.imagemin.jpegtran),
            imagemin.optipng(config.options.imagemin.optipng),
        ]))
        .pipe(dest(config.paths.images.dest))
        .pipe(connect.reload());
}

// Create sprite
function buildSvgSprite() {
    return src(config.paths.svg.src)
        .pipe(svgSprite(config.options.svgSprite))
        .pipe(dest(config.paths.svg.dest));
}

// Files
function copyFiles() {
    return src(config.paths.files.src, {since: lastRun(copyFiles)})
        .pipe(dest(config.paths.files.dest))
        .pipe(connect.reload());
}

// Server
function connectServer() {
    return connect.server(config.options.connect);
}

// Watch
function watchChanges () {
    watch(config.paths.views.watch, buildViews);
    watch(config.paths.styles.watch, buildStyles);
    watch(config.paths.scripts.watch, buildScripts);
    watch(config.paths.fonts.src, copyFonts);
    watch(config.paths.images.src, optimizeImages);
    watch(config.paths.svg.src, buildSvgSprite);
    watch(config.paths.files.src, copyFiles);
}

// Lint views
function lintViews() {
    return src('dist/!*.html')
        .pipe(posthtml([
            validateHTML()
        ]));
}

// Lint styles
function lintStyles() {
    return src('dist/css/application.css')
        .pipe(stylelint(config.options.stylelint))
        .pipe(dest(config.paths.styles.dest));
}

// Lint scripts
function lintScripts() {
    return src('dist/js/application.js')
        .pipe(eslint(config.options.eslint))
        .pipe(eslint.format())
        .pipe(dest(config.paths.scripts.dest));
}


// Tasks
exports.default = parallel(connectServer, watchChanges);

exports.lint = parallel(lintViews, lintStyles, lintScripts);

exports.build = series(clean, parallel(buildViews, vendorStyles, buildStyles, buildScripts, vendorFonts, copyFonts, optimizeImages, buildSvgSprite, copyFiles));

exports.images = optimizeImages;

exports.copy = copyFiles;

exports.scripts = buildScripts;

exports.sprite = buildSvgSprite;