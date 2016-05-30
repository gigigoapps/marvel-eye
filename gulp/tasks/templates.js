'use strict';

const gulp = require('gulp');
const ngHtml2Js = require('gulp-ng-html2js');
const rev = require('gulp-rev');
const inject = require('gulp-inject');
const del = require('del');
const concat = require('gulp-concat');
const copy = require('gulp-copy');

const config = require('../config')

gulp.task('del-templates-js', function() {
  return del(['./dist/bundle/templates*.js*'])
});
gulp.task('del-templates-html', function() {
  return del(['./dist/app/**/*.html'])
});
gulp.task('del-templates',['del-templates-html','del-templates-js']);


gulp.task('templates-js',['del-templates'],function(){
  var tplStream = gulp.src("./src/app/**/*.html")
    .pipe(ngHtml2Js({
      moduleName: "app",
      prefix: '/app/',
      declareModule : false
    }))
    .pipe(concat('templates.js'))
    .pipe(rev())
    .pipe(gulp.dest("./dist/bundle"));

  return gulp.src('./dist/index.html')
    .pipe(inject(tplStream,{
      ignorePath:'../dist/',
      relative:true,
      name : 'inject-js-templates'
    }))
    .pipe(gulp.dest('./dist'))
})

//Copy the html to their place
gulp.task('templates-copy',['del-templates'],function(){

  //Copy html files
  gulp.src(['./src/app/**/*.html'])
    .pipe(copy('./dist',{prefix:1}))

  //Clear injection
  return gulp.src('./dist/index.html')
    .pipe(inject( gulp.src(''),{
      name : 'inject-js-templates',
      empty:true
    }))
    .pipe(gulp.dest('./dist'))
})


gulp.task('templates-copy:watch', ['templates-copy'],function () {
    gulp.watch('./src/app/**/*.html',['templates-copy']) 
});
gulp.task('templates-js:watch', ['templates-js'],function () {
    gulp.watch('./src/app/**/*.html',['templates-js']) 
});