/*jshint -W030 */

'use strict';

const $ = require('jquery')
const pretty = require('../lib/pretty');
const config = require('../lib/config');
const debug = require('debug')('marvel:viewHelper:result');

let resultBoxes = {};

let hasBody = {};
let currentId;

exports.print = function(stack,flash){
	var id = stack && stack.id;
	// debug('printResult',id);
	
	//Print each resultBoxes based on stack log bodies
	for(var i=0; i < config._types.length ;i++){
		var type = config._types[i];
		var body = stack && stack.data[type];

		//Decide if needs to flash the box
		if (flash){
			if (id != currentId){
				body && resultBoxes[type].flash()
			}else{
				!hasBody[type] && body && resultBoxes[type].flash()
			}
		}
		hasBody[type] = !!body;

		//Prints the final html of pretty json
		resultBoxes[type].html(pretty(body));
	}
	currentId = id;
}





exports.init = function(){

	var $bottom = $('section.bottom');

	//Creates resultBoxes for each type
	for(var i in config.types){
		var name = config.types[i].name;
		var $elem = $(resultTemplate(name,name.toUpperCase()));
		$bottom.append($elem)
		resultBoxes[name] = $elem.find('.result');
	}
}


function resultTemplate(type,name){
	return `
		<section data-type="${type}">
			<section class="title">${name}</section>
			<section class="result">
				
			</section>
		</section>
		<div class="divider" data-dir="vertical"></div>
	`;
}



//Click on a attr of the result json
exports.bindAttrClick = function(fn){
	$('.result').each(function(){
		var resultBoxName = $(this).parent().data('type');
		$(this).on('click','.json-attr',function(){
			var $attr = $(this);
			var key =  getKeyName($attr);
			var value = getValue($attr)

			$attr.parents('.json-level').each(function(){
				var parentKey = getKeyName($(this))
				if (parentKey)
					key = parentKey+'.'+key;
			})

			key = resultBoxName + '.'+ key;
			
			fn(key,value)
		})
	})
}

function getKeyName($elem){
	return $elem.find('>.json-key').text();
}
function getValue($elem){
	return $elem.find('>.json-value,>.json-string').text();
}