'use strict';

var port = process.env.PORT || 5505;

var express = require('express')
var glob = require('glob')
var path = require('path')
var nunjucks = require('nunjucks')
var app = express()


//Templating options
let nunjucksEnv = nunjucks.configure(__dirname+'/views',{
	express : app,
	watch:true
});
app.set('view engine', 'html');
app.engine('html', nunjucksEnv.render);


//Config selector
app.get('/',function(req,res,next){

	if (req.query.c){
		return next()
	}

	if (req.query.json_config){
		return res.sendFile(__dirname+'/configs/'+req.query.json_config+'.json');
	}

	glob('configs/*.json',function(err,files){
		var configs = files.map(function(file){
			return path.basename(file,'.json');
		})
		res.render('config_selector',{configs:configs})
	})
})

app.use('/',express.static(__dirname+'/dist'))

app.listen(port,function(){
	console.log('listening on '+port);
})