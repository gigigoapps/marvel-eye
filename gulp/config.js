'use strict';


module.exports = {
  scripts: {
    src: 'src/app/**/*.js',
    entry : 'src/app/index.js',
    dest: 'src/bundle/app.js'
  },
  	browserify : [
		{
			sourceMaps : true,
			inlineSourceMaps : false,
			compress : false,
			src : [
				'./src/app/**/*.js'
			],

			basedir: './src',
			entries: ['./app/index.js'],
			paths: './',

			destFolder : './dist/bundle',
			destFile : 'app.js',
			inject:true,
			revision:true
		},
		// {
		// 	sourceMaps : true,
		// 	inlineSourceMaps : false,
		// 	compress : false,
		// 	src : [
		// 		'./src/app/worker.js'
		// 	],

		// 	basedir: './src',
		// 	entries: ['./app/worker.js'],
		// 	paths: './',

		// 	destFolder : './dist/bundle',
		// 	destFile : 'worker.js',
		// 	inject:false,
		// 	revision:false
		// }
	],
}