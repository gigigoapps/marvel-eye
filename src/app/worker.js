/* global self */
'use strict';

const FilterService = require('./services/FilterService')
const debug = require('debug')('marvel:worker')

self.addEventListener('message',function(e){
	var query = e.data.query;
	var list = e.data.list;
	FilterService.setQuery(query)
	filterList(list);
})
self.postMessage('hola soy worker')



function filterList(list){

    console.time('worker filter')
    var viewList = [];

    var index = -1,
        length = list.length,
        resIndex = 0,
        pass,
        value,
        result = [];

    while (++index < length) {
        value = list[index];
        pass = FilterService.checkStack(value);
        if (pass===null){
            break;
        }
        if (pass){
            viewList[resIndex++] = value;
        }
    }
    console.timeEnd('worker filter')
    console.warn('worker result',viewList.length)
}