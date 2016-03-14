'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    rigger = require('gulp-rigger'),
    compass = require('gulp-compass'),
    prefixer = require('gulp-autoprefixer'),
    cssmin = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    plumber = require("gulp-plumber"),
    reload = browserSync.reload;

var path = {
    build: {
        html: 'build/',
        js: 'build/',
        css: 'build/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/assets/js/*.js',
        style: 'src/assets/scss/main.scss',
        css: './src/assets/css/main.css',
        img: 'src/assets/img/**/*.*',
        fonts: 'src/assets/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/assets/js/**/*.js',
        style: 'src/assets/scss/**/*.scss',
        img: 'src/assets/img/**/*.*',
        fonts: 'src/assets/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};

gulp.task('html:build', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.src.js)
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('compass:build', function() {
    gulp.src(path.src.style)
        .pipe(plumber())
        .pipe(compass({
          css: 'src/assets/css',
          sass: 'src/assets/scss',
          image: 'src/assets/img'
        }))
        .on('error', function(error) {
        console.log(error);
        this.emit('end');
        });
});

gulp.task('css:build', function () {
    gulp.src(path.src.css)
        .pipe(plumber())
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('img:build', function () {
    gulp.src(path.src.img)
        .pipe(imagemin({ //Сожмем их
          progressive: true,
          svgoPlugins: [{removeViewBox: false}],
          use: [pngquant()],
          interlaced: true }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'compass:build',
    'css:build',
    'fonts:build'
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style, 'src/assets/scss/**/*.scss'], function(event, cb) {
        gulp.start('compass:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.src.css], function(event, cb) {
        gulp.start('css:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);
