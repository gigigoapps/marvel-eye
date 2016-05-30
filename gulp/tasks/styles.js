'use strict';

const gulp = require('gulp');
const ngHtml2Js = require('gulp-ng-html2js');
const rev = require('gulp-rev');
const inject = require('gulp-inject');
const del = require('del');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const copy = require('gulp-copy');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const importCss = require('gulp-import-css');


const config = require('../config')

gulp.task('del-styles', function() {
  return del(['./dist/bundle/styles*css*'])
});
gulp.task('del-styles-imports', function() {
  return del(['./dist/bundle/imports*css*'])
});

gulp.task('styles',['del-styles'],function(){
  var stream = gulp.src('./src/app/styles/index.scss')
    // .pipe(rev())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('./'))
    .pipe(rename(function(path){
      path.basename = path.basename.replace('index','styles')
    }))
    .pipe(gulp.dest("./dist/bundle"));

  return gulp.src('./dist/index.html')
    .pipe(inject(stream,{
      ignorePath:'../dist/',
      relative:true,
      name : 'inject-css-custom'
    }))
    .pipe(gulp.dest('./dist'))
})

gulp.task('styles-imports',['del-styles-imports'],function(){
  var stream = gulp.src('./src/app/styles/imports.css')
    .pipe(importCss())
    // .pipe(rev())
    .pipe(gulp.dest("./dist/bundle"));

  return gulp.src('./dist/index.html')
    .pipe(inject(stream,{
      ignorePath:'../dist/',
      relative:true,
      name : 'inject-css-imports'
    }))
    .pipe(gulp.dest('./dist'))
})

gulp.task('styles:watch', ['styles'],function () {
    gulp.watch('./src/app/**/*.scss',['styles']) 
});
gulp.task('styles-imports:watch', ['styles-imports'],function () {
    gulp.watch('./src/app/styles/imports.css',['styles-imports']) 
});