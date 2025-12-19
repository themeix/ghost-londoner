(function() {

  'use strict';

  // Include Gulp & Plugins
  var gulp         = require('gulp'),
      sass         = require('gulp-sass')(require('sass')),
      rtlcss       = require('gulp-rtlcss'),
      cleanCSS     = require('gulp-clean-css'),
      autoprefixer = require('gulp-autoprefixer'),
      concat       = require('gulp-concat'),
      rename       = require('gulp-rename'),
      uglify       = require('gulp-uglify'),
      jshint       = require('gulp-jshint'),
      replace      = require('gulp-replace'),
      zip          = require('gulp-zip'),
      fs           = require('fs');

  // SASS
  gulp.task('sass', function (done) {
    return gulp.src('./assets/sass/*.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(rename({suffix: '-min'}))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./assets/css'))
    .pipe(rtlcss())                     // Convert to RTL
    .pipe(rename({ suffix: '-rtl' }))   // Rename style.css to 'style-rtl.css'
    .pipe(gulp.dest('./assets/css'))    // Output RTL stylesheets
    done();
  });

  // inlineCSS
  gulp.task('inlinecss', function(done) {
    return gulp.src(['partials/css/style.hbs'])
    .pipe(replace('@@compiled_css', fs.readFileSync('assets/css/style-min.css', 'utf8')))
    .pipe(gulp.dest('partials/css/dist'))
    .on('end', done);
  });

  // inlineCSS-RTL
  gulp.task('inlinecss-rtl', function(done) {
    return gulp.src(['partials/css/style-rtl.hbs'])
    .pipe(replace('@@compiled_css_rtl', fs.readFileSync('assets/css/style-min-rtl.css', 'utf8')))
    .pipe(gulp.dest('partials/css/dist'))
    .on('end', done);
  });

  // JavaScript
  gulp.task('js', function(done) {
    return gulp.src([
      './bower_components/jquery/dist/jquery.js',
      './bower_components/fitvids/jquery.fitvids.js',
      './node_modules/tocbot/dist/tocbot.min.js',
      './node_modules/evil-icons/assets/evil-icons.min.js',
      './node_modules/prismjs/prism.js',
      './node_modules/fslightbox/index.js',
      './assets/js/app.js'])
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(concat('app.js'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest('./assets/js'))
      done();
  });

  // Watch
  gulp.task('watch', function() {
    gulp.watch('assets/sass/**/*.scss', gulp.series('build_css'));
    gulp.watch('./assets/js/app.js', gulp.series('js'));
  });

  gulp.task(
    'build_css',
    gulp.series('sass', 'inlinecss', 'inlinecss-rtl')
  );

  gulp.task(
    'build',
    gulp.series('build_css', 'js')
  );

  gulp.task('zip', function () {
    return gulp.src([
      './**',
      '!node_modules/**',
      '!bower_components/**',
      '!.git/**',
      '!.DS_Store',
      '!bun.lockb',
      '!package-lock.json'
    ], { dot: true })
    .pipe(zip('tripoli.zip'))
    .pipe(gulp.dest('../'))
    done();
  });

  gulp.task(
    'default',
    gulp.series('build', 'watch')
  );

})();