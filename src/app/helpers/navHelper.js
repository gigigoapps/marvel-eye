'use strict';

const $ = require('jquery');

let $countTotal,$countVisible,$autoFocus,$sources;

exports.init = function(){
	$countTotal = $('.nav .count_total b');
	$countVisible = $('.nav .count_visible b');
	$autoFocus = $('.nav .auto_focus');
	$sources = $('.nav .sources');
}

//Clear button blick
exports.bindClear = function(fn){
	$('.nav .clear').click(fn);
}

//Fetch buttons click
exports.bindFetch = function(fn){
	$('.nav .fetch').click(function(){
		var data = $(this).data();
		fn(data.num,data.step)
	});
}

//Fetch buttons click
exports.setCountVisible = function(fn){
	$('.nav .fetch').click(function(){
		var data = $(this).data();
		fn(data.num,data.step)
	});
}

exports.setCountTotal = function(n){
	$countTotal.text(n);
}
exports.setCountVisible = function(n){
	$countVisible.text(n);
}

exports.bindAutoFocus = function(fn){
	$autoFocus.click(function(){
		fn()
	});
}

exports.setAutoFocus = function(bool){
	$autoFocus.find('b').text(bool?'On':'Off');
}

exports.bindPauseSource = function(fn){
	$sources.on('click','.pause',function(){
		fn($(this).data('source'));
	});
}

exports.setSources = function(sources){
	var html = '';
	var cc = 0;
	for(var i in sources){
		var s = sources[i];
		var pauseText = s.paused ? '<b>Resume</b> receiving logs' : '<b>Pause</b> receiving logs';
		var status = s.connected ? (s.paused ? 'Paused' : 'Connected') : 'Disconnected';
		if (s.connected && !s.paused)
			cc++;
		html += '<li>';
		html += 	'<span>';
		html += 		s.name
		html += 		'<br>';
		html += 		'<b>'+status+'</b>';
		html += 		'<br>';
		html += 		s.uri;
		html += 	'</span>';

		if (s.connected){
			html += 	'<ul>';
			html += 		'<li class="pause" data-source="'+s.name+'">';
			html += 			'<a>'+pauseText+'</a>';
			html += 		'</li>';
			html += 	'</ul>';
		}
		html += '</li>';
	}
	var sourcesStatus = cc == sources.length ? 'green' : ( cc === 0 ? 'red' : 'orange');
	$sources.find('> span').attr('class',sourcesStatus);
	$sources.find('> ul').html(html);
}


exports.setConfigName = function(name){
	$('.header h1>i').text(name);
	$('title').text(name+' | marvel eye');
}