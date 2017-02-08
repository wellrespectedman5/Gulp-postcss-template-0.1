'use strict';
// Gulp
var gulp = require('gulp'),
    gulpwatcher = require('gulp-watch'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    notify = require("gulp-notify"),
    rigger = require('gulp-rigger'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    jshint = require("gulp-jshint"),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

//postCSS
var postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('cssnano'),
    postcssNested = require('postcss-nested'),
    simpleVars = require('postcss-simple-vars'),
    atImport = require('postcss-import'),
    lostGrid = require('lost'), 
    cssUnused = require('postcss-discard-unused'),
    fontpath = require('postcss-fontpath'),
    preCss = require('precss');

var path = {
    build: {
        html: './dist',
        js: './dist/assets/js',
        style: './dist/assets/css',
        img: './dist/images'
    },
    src: {
        html: './src/html/**/*.html',
        js: './src/js/*.js',
        style: './src/css/styles.css',
        img: './src/images/**/*.*'
    },
    watch: {
        html: './src/html/**/*.html',
        js: './src/js/*.js',
        style: './src/css/**/*.css',
        img: './src/images/**/*.*'
    }
};

// Browser Sync
var config = {
    server: {
        baseDir: 'dist'
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: 'Frontend-drugs'
};

gulp.task('webserver', function () {
    browserSync(config);
});

// HTML
gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

//postCss
gulp.task('style:build', function () {
    var processors = [
        preCss({}),
        lostGrid,
        simpleVars,
        postcssNested,
        atImport,
        cssUnused,
        fontpath({checkPath: false}),
        autoprefixer({browsers: ['last 4 version']}),
        cssnano()
    ];
    return gulp.src(path.src.style)
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.style))
        .pipe(reload({stream: true}));
});

// JS
gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

//Images / svg
gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});

//Task build all
gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'image:build'
]);

gulp.task('notify', function () {
    gulp.src(path.src.style)
        .pipe(notify("LET's CODE !!!"));
});

// Watch for changes
gulp.task('watch', function () {
    gulpwatcher([path.watch.html], function (event, cb) {
        gulp.start('html:build');
    });
    gulpwatcher([path.watch.style], function (event, cb) {
        gulp.start('style:build');
    });
    gulpwatcher([path.watch.js], function (event, cb) {
        gulp.start('js:build');
    });
    gulpwatcher([path.watch.img], function (event, cb) {
        gulp.start('image:build');
    });
});

gulp.task('default', ['build', 'webserver', 'watch']);