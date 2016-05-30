'use strict';

var level = '<span class="json-level">';
var attr = '<span class="json-attr">';
var key = '<span class=json-key>';
var val = '<span class=json-value>';
var str = '<span class=json-string>';

var jsonFormat = {
    replacer: function(match, pIndent, pKey, pVal, pStart,pEnd,comma) {
        var r = pIndent || '';

        if (pStart)
            r = r + level;
        if (pKey) r = r + (pVal ? attr : '') + key + pKey.replace(/[": ]/g, '') + '</span>: ';
        if (pVal) r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>'+(pKey ? '</span>':'');
        if (pEnd)
            r = r + '</span>';

        // console.log('pIndent:'+pIndent+ 'pKey:'+pKey+ 'pVal:'+pVal+ 'pStart:'+pStart+ 'pEnd:'+pEnd);

        return r + (pStart || '')+(pEnd || '')+(comma || '');
    },
    prettyPrint: function(obj) {
        if (obj === undefined)
            return '';
        
        var jsonLine = /^( *)("[\w-\$]+": )?("[^"]*"|[\w.+-]*)?([\[{]+)?([\]}]+)?(,)?$/mg;
        // obj.test = [1,2,3];
        // obj.test2 = [{algo:1},{algo2:['test','test3']}]
        return JSON.stringify(obj, null, 3)
	        .replace(/&/g, '&amp;')
	        .replace(/\\"/g, '&quot;')
	        .replace(/</g, '&lt;')
	        .replace(/>/g, '&gt;')
	        .replace(jsonLine, jsonFormat.replacer);
    }
};

module.exports = jsonFormat.prettyPrint;