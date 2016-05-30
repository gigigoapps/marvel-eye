'use strict';

const gulp = require('gulp');
const jshint = require('gulp-jshint');

const config = require('../config')

gulp.task('lint', function() {
  return gulp.src(config.scripts.src)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});