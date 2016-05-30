'use strict';

const $ = require('jquery');
const _ = require('lodash');
const debug = require('debug')('marvel:viewHelper:filter');

let $input,$form,$apply,$clear;
let lastVal = '';
exports.init = function(){
	$form = $('.header .filter');
	$input = $form.find('input');
	$clear = $form.find('.clear');
	$apply = $form.find('.apply');
}

//Input user change event
exports.bindFilterApply = function(fn){
	$form.on('submit',function(e){
		var val = $input.val();
		lastVal = val;
		updateButtonsState();
		fn(val);
		e.preventDefault();
	})
	$clear.on('click',function(e){
		lastVal = '';
		$input.val('');
		updateButtonsState();
		fn('');
		e.preventDefault();
	})
	$input.on('change keyup keydown',function(){
		var val = $(this).val();
		updateButtonsState();
	})
}

function updateButtonsState(){
	var val = $input.val();
	$apply.toggleClass('active',val != lastVal);
	$clear.toggleClass('active',!!lastVal);
	$input.toggleClass('active',val!='' && val == lastVal);
}

//Sets input value
exports.setFilterValue = function(val,initial){
	if (initial===true)
		lastVal = val;
	$input.val(val);
	updateButtonsState();
}


exports.getCurrentVal = function(){
	return $input.val();
}



