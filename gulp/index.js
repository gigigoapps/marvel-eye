'use strict';

const fs = require('fs');
const gulp = require('gulp');

fs.readdirSync('./gulp/tasks/').forEach((task) => {
  require('./tasks/' + task);
});

gulp.task('default',['prepare:watch'])