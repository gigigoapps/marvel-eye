'use strict';

const $ = require('jquery');
const _ = require('lodash');

const debug = require('debug')('marvel:viewHelper:stack');
const FilterService = require('../services/FilterService')
const config = require('../lib/config');

const cols = config.columns;
let $tbody;
let $container;

exports.init = function(){
	$container = $('.table-container');
	$tbody = $container.find('table tbody');

	loadColumns();

	$(document).on('keydown',function(e){
		if(e.keyCode==38){
			getHighlighted().prev().click();
		}else 
		if (e.keyCode==40){
			getHighlighted().next().click();

		}
	})

	window.$container = $container;
}


function loadColumns(){
	var $tr = $container.find('thead tr');
	var trs = _.cloneDeep(cols);

	//Default columns
	if (config._sources.length>1)
		trs.unshift({name:'source'})
	trs.unshift({name:'created'})
	trs.unshift({name:'#'});

	//Iterate and create defined columns in table
	for(var i in trs){
		var name = trs[i].name;
		$tr.append(columnTemplate(name.toUpperCase()))
	}
}

function columnTemplate(name){
	return `<th><div class="inner">${name}</div></th>`
}


//Print a new row or update previous one
exports.print = function(stack){
	if (!stack || !stack.id)
		return false;

	var tpl = stackTemplate(stack);
	var tr = getStack(stack.id)

	if (tr){
		$(tr).replaceWith(tpl)
	}else{
		$tbody.append(tpl)
	}
}

//Fast aproach for printing batch stacks
exports.printBatch = function(batch){
	var str = '';
	for(var i =0;i<batch.length;i++){
		str += stackTemplate(batch[i])
	}
	$tbody[0].innerHTML = str;
}

//Remove a stack from table
exports.remove = function(stack){
	if (!stack || !stack.id)
		return false;
	var tr = getStack(stack.id)
	if (tr)
		$(tr).remove()
}

//Scrolls all the way down in table
exports.scrollToBottom = function(){
	$container.scrollTop($container[0].scrollHeight)
}

//Highlights a row
exports.highlight = function(id){
	var $stack = $(getStack(id))
	$tbody.find('.highlight').removeClass('highlight')
	$stack.addClass('highlight')
}

//Clear all rows from table
exports.clear = function(){
	$tbody[0].innerHTML = '';
}

//Get last row from table
exports.getLast = function(){
	var $last = $tbody.find('tr:last');
	return $last.length && $last[0].id.replace('stack_','')
}


//Binds a bubble event to rows
exports.bindRowClick = function(fn){
	$tbody.on('click','tr',function(){
		fn(this.id.replace('stack_',''));
	});
}

//Toggle an error message
exports.updateErrorState = function(msg){
	$('section.list').toggleClass('errored',!!msg);
	if (msg)
		$('section.list>.error').text(msg);
}

//Returns stack element
function getStack(id){
	return document.getElementById('stack_'+id)
}

//Returns highlighted row
function getHighlighted(){
	return $tbody.find('tr.highlight');
}

//Stack row template
function stackTemplate(stack){
	var str = '<tr id="stack_'+stack.id+'">';

	//Default columns
	str += '<td>'+stack.id+'</td>';
	str += '<td>'+(stack.created||'')+'</td>';

	if (config._sources.length>1)
		str += '<td>'+(stack.source||'')+'</td>';

	//Iterate over definition columns
	for(var i=0;i<cols.length;i++){

		//Find stack value
		var val = _.get(stack.data[cols[i].type],cols[i].prop,'');

		val = escapeHtml(val);

		if (!val)
			val = '<i>-</i>'

		//Apply formatter
		if (cols[i].formatter)
			val = cols[i].formatter(val);

		//Add to table html
		str += '<td>'+val+'</td>';
	}
	str += '</tr>';
	return str;
}


var entityMap = {
   "<": "&lt;",
   ">": "&gt;",
 };

function escapeHtml(str) {
	if (typeof str != 'string')
		return str;
	return str.replace(/[<>]/g, function (s) {
		return entityMap[s];
	});
}