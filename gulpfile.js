var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var jshint = require('gulp-jshint'),
    guppy = require('git-guppy')(gulp),
    gulpFilter = require('gulp-filter');

var bundlesPath = 'www/bundles';

var paths = {
  sass: ['./scss/**/*.scss', 'www/js/**/*.js', '!www/js/*.bundle.js'],
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass', 'app']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
/**
 * Check all javascript files and create js report
**/
gulp.task('jshint', function () {
    gutil.log('*****************+JS HINT***************');
    // Watch all javascript files 
    return gulp.src(['www/js/**/*.js', '!www/js/*.bundle.js']).
    pipe(jshint()).
    pipe(jshint.reporter('jshint-stylish'));
});
/**
 * Truncate all javascript files from www/js/controllers into controllersBundle
 **/
gulp.task('controllers', ['jshint'], function () {
    return gulp.src('www/js/controllers/*.js')
        .pipe(concat('controllers.bundle.js'))
        .pipe(gulp.dest(bundlesPath));
});
gulp.task('services', ['jshint'], function () {
    return gulp.src('www/js/services/*.js')
        .pipe(concat('services.bundle.js'))
        .pipe(gulp.dest(bundlesPath));
});
gulp.task('directives', ['jshint'], function () {
    return gulp.src('www/js/directives/*.js')
        .pipe(concat('directives.bundle.js'))
        .pipe(gulp.dest(bundlesPath));
});
gulp.task('filters', ['jshint'], function () {
    return gulp.src('www/js/filters/*.js')
        .pipe(concat('filters.bundle.js'))
        .pipe(gulp.dest(bundlesPath));
});
gulp.task('app', ['controllers', 'services', 'directives', 'filters'], function () {
    return gulp.src(['www/js/app.js', bundlesPath + '/*.bundle.js', '!www/bundles/app.bundle.js'])
        .pipe(concat('app.bundle.js'))
        .pipe(gulp.dest(bundlesPath));
});
//TODO uglify bundles
