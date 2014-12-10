/*
 * crafter
 * https://github.com/parroit/crafter
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

'use strict';

var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function () {
  return gulp.src('./test/*.js')
    .pipe(mocha({
      ui: 'bdd',
      reporter: 'spec'
    }));
});

gulp.task('only', function () {
  return gulp.src('./test/*.js')
    .pipe(mocha({
      ui: 'bdd',
      reporter: 'spec',
      grep: '@only'
    }));
});


gulp.task('quality', function () {
  return gulp.src('./test/*.js')
    .pipe(mocha({
      ui: 'bdd',
      reporter: 'spec',
      grep: '@quality'
    }));
});

gulp.task('watch', function () {
  gulp.watch(['./lib/**/*.js', './test/**/*.js'], ['test']);
});

gulp.task('default', ['test', 'watch']);
