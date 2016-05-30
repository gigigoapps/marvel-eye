'use strict'

const $ = require('jquery')
const _ = require('lodash')

const formatters = require('../lib/formatters');
let self = module.exports = {}


self.__init = function(fn){
	var m = window.location.search.match(/[&\?]c=([^&]+)/);
	self._config_name = m && m[1] || 'default';

	$.getJSON('?json_config='+self._config_name,function(definition){
		$.extend(self,definition);
		applyFormatters();
		setTypes();
		setSources();
		delete self.__init;
		fn();
	})
	.fail(function(err){
		alert('Invalid definition')
	})
}

function setSources() {
    var source = self.source || '';

    if (_.isString(source)){
        source = {default : source};
    }

    self._sources = [];
    _.each(source,function(val,key){
    	self._sources.push({name:key,uri:val})
    });
}

function setTypes(){
	self._types = _.map(self.types,'name');
	self._typeGlues = {}
	_.each(self.types,function(item){
		if (_.isPlainObject(item.glue))
			self._typeGlues[item.name] = [item.glue];
		if (_.isArray(item.glue)) 
			self._typeGlues[item.name] = item.glue;
	});
}

function applyFormatters(){
	var cols = self.columns;
	for(var i in cols){
		var fmt = cols[i].formatter;
		if (fmt && formatters[fmt] && typeof formatters[fmt] == 'function'){
			cols[i].formatter = formatters[fmt];
		}else{
			delete cols[i].formatter;
		}	
	}
}