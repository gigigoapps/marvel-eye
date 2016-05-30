/* globals document */
'use strict';

const debug = require('debug')('marvel:main')
debug('init');

const $ = require('jquery');

require('./lib/flash-plugin');

var config = require('./lib/config')

$(function(){
    debug('ready');
    config.__init(bootstrap);
});


function bootstrap(){
	const SocketService = require('./services/SocketService');
	const StackService = require('./services/StackService');

	const MainController = require('./controllers/MainController');

	new MainController();
}
