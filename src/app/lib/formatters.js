'use strict'

exports.removeHostname = function(str){
	return str.replace(/^https?:\/\/[^\/]+/,'')
}