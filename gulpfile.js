"use strict";

var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var svgstore = require('gulp-svgstore');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');
var del = require('del');
var server = require('browser-sync').create();
var htmlmin = require('gulp-htmlmin');
const minify = require('gulp-minify');
const jsInclude = require("gulp-include");
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const zip = require('gulp-zip');
var replace = require('gulp-replace');
var brotli = require('gulp-brotli');
var gzip = require('gulp-gzip');

gulp.task('gzip', function () {
  return gulp.src('build/**/*.{html,js,css,svg}')
    .pipe(gzip())
    .pipe(gulp.dest('build/'));
});

gulp.task('brotli', function() {
  return gulp.src('build/**/*.{html,js,css,svg}')
    .pipe(brotli.compress())
    .pipe(gulp.dest('build/'));
});

function getDateTime() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  if (month.toString().length == 1) { var month = '0' + month; }
  if (day.toString().length == 1) { var day = '0' + day; }
  if (hour.toString().length == 1) { var hour = '0' + hour; }
  if (minute.toString().length == 1) { var minute = '0' + minute; }
  if (second.toString().length == 1) { var second = '0' + second; }
  var dateTime = year + month + day + hour + minute + second;
  return dateTime;
}

gulp.task('addHash', function () {
  return gulp.src('build/*.html')
    .pipe(replace('/css/style.min.css', '/css/style.min.css?' + getDateTime()))
    .pipe(replace('/js/app.min.js', '/js/app.min.js?' + getDateTime()))
    .pipe(gulp.dest('build/'));
});

gulp.task('arch', function() {
    return gulp.src('build/**')
      .pipe(zip('build-' + getDateTime() + '.zip'))
      .pipe(gulp.dest('build-zip'))
  }
);

gulp.task('js', function() {
  return gulp.src('source/js/*.js')
    .pipe(jsInclude())
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('app.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'))
    .pipe(minify({
      ext: {
        min: '.min.js'
      }
    }))
    .pipe(gulp.dest('build/js'))
});

// gulp.task('compressjs', function () {
//   return gulp.src(['build/js/*.js'])
//     .pipe(minify())
//     .pipe(gulp.dest('build'))
// });

// gulp.task('js', gulp.series('main-js', 'compressjs'));

gulp.task('minifyhtml', function () {
  return gulp.src('build/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
});

gulp.task('images', function () {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      // imagemin.optipng({optimizationLevel: 3}),
      // imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
  .pipe(gulp.dest('source/img'));
});

gulp.task('webp', function () {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(webp({quality: 85}))
    .pipe(gulp.dest('source/img'));
});

gulp.task('sprite', function () {
  return gulp.src('source/img/icon-*.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('icon-sprite.svg'))
    .pipe(gulp.dest('build/img'));
});

gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest('build'));
});

// 'source/fonts/**/*.{woff,woff2}',
gulp.task('copy', function () {
  return gulp.src([
      'source/fonts/**/*',
      'source/img/**',
      'source/js/**',
    ], {
      base: 'source'
    })
    .pipe(gulp.dest('build'));
});


gulp.task('clean', function () {
 return del('build');
});

gulp.task('clean-zip', function () {
  return del('build-zip');
});

gulp.task('css', function () {
  return gulp.src('source/sass/style.scss')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass({includePaths: require('node-normalize-scss').includePaths}))
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest('build/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

gulp.task('server', function () {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series("css"));
  gulp.watch('source/js/*.js', gulp.series('js', 'html', 'addHash', 'minifyhtml', 'refresh'));
  gulp.watch('source/img/*.svg', gulp.series('sprite', 'html', 'addHash', 'minifyhtml', 'refresh'));
  gulp.watch('source/*.html', gulp.series('html', 'addHash', 'minifyhtml', 'refresh'));
});

gulp.task('refresh', function (done) {
  server.reload();
  done();
});

// gulp.task('img', gulp.series('images', 'webp', 'sprite', 'copy'));
gulp.task('img', gulp.series('images', 'sprite', 'copy'));
gulp.task('compress', gulp.series('gzip', 'brotli'));
//gulp.task('build', gulp.series('clean', 'copy', 'css', 'sprite', 'js', 'html', 'minifyhtml', 'clean_wp', 'copy_wp'));
gulp.task('build', gulp.series('clean', 'copy', 'css', 'sprite', 'js', 'html', 'addHash', 'minifyhtml', 'clean-zip', 'arch', 'compress'));
//gulp.task('deploy', gulp.series('build', 'publish'));
gulp.task('start', gulp.series('build', 'server'));
