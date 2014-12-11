/*
 * crafter
 * https://github.com/parroit/crafter
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

'use strict';

var crafter = require('./lib/crafter');
var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('craft', function () {
  return gulp.src('./node_modules/concat-stream/index.js')
    .pipe(crafter.bundle({
      target: 'concat.js',
      exports: {
        'index.js': null
      }
    }))
    .pipe(gulp.dest('./test/assets'));
});

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
