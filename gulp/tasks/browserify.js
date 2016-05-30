'use strict'

const gulp = require('gulp');
const gulpif = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const rev = require('gulp-rev');
const del = require('del');
const runSequence = require('run-sequence');
const jshint = require('gulp-jshint');
const config = require('../config')
const inject = require('gulp-inject');

function compile(config,watch) {
  var bundler = browserify({
    entries: config.entries,
    basedir: config.basedir,
    debug: config.sourceMaps,
    paths: config.paths,
    cache:{},
    packageCache : {}
  })

  bundler.transform(babelify, {
    presets: ['es2015']
  });

  if (watch) {
    bundler = watchify(bundler);
    bundler.on('update', function() {
      console.log('--> bundling...');
      rebundle();
    })
    .on('log', function(msg) {
      console.log(msg);
    })
  }

  function rebundle() {
    gulp.src(config.src)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));

    //Start browserify pipe
    var jsStream = bundler.bundle()
      .on('error', function(err) {
        console.error(err.message);
        this.emit('end');
      })

      .pipe(source(config.destFile))
      .pipe(buffer())
      // .pipe(gulpif(config.revision,rev()))

      .pipe(gulpif(config.sourceMaps && !config.inlineSourceMaps,sourcemaps.init({ 
        loadMaps: true 
      })))
      .pipe(gulpif(config.compress,uglify({
        mangle: false,
      })))
      .pipe(gulpif(config.sourceMaps && !config.inlineSourceMaps,sourcemaps.write('./')))

      .pipe(gulp.dest(config.destFolder))

      if (config.inject){
        //Inject the filename to index.html
        return gulp.src('./dist/index.html')
          .pipe(inject(jsStream,{
            ignorePath:'../dist/',
            relative:true,
            name : 'inject-js-bundle'
          }))
          .pipe(gulp.dest('./dist'))
      }

  }


  rebundle();
}




gulp.task('browserify',function() {
  config.browserify.forEach(c=>compile(c))
});
gulp.task('browserify:watch', function() {
  config.browserify.forEach(c=>compile(c,true))
});