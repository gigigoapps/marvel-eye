'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');

const config = require('../config')

gulp.task('prepare',function(){
  runSequence('dist','styles','styles-imports','browserify');
})

gulp.task('prepare:watch',function(){
  runSequence('dist:watch','styles:watch','styles-imports:watch','browserify:watch');
})
