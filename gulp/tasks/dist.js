'use strict';

const gulp = require('gulp');
const copy = require('gulp-copy');
const del = require('del');

const config = require('../config')

gulp.task('del-dist', function() {
  return del(['./dist'])
});

gulp.task('assets',['del-dist'],function(){
	return gulp.src(['./src/assets/**/*'])
		.pipe(copy('./dist',{prefix:1}))
})

gulp.task('dist',['assets'],function(){
	return gulp.src(['./src/index.html'])
		.pipe(copy('./dist',{prefix:1}))
})

gulp.task('dist:watch', ['dist'],function () {
    gulp.watch(['./src/assets/**/*','./src/index.html'],['prepare']) 
});