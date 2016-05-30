'use strict';

const SocketService = require('../services/SocketService');
const StackService = require('../services/StackService');
const FilterService = require('../services/FilterService');

const stackHelper = require('../helpers/stackHelper')
const resultHelper = require('../helpers/resultHelper')
const navHelper = require('../helpers/navHelper')
const filterHelper = require('../helpers/filterHelper')

const config = require('../lib/config')

let autoFocus = true;

module.exports = class MainController{
	constructor(){
		
		stackHelper.init();
		resultHelper.init();
		filterHelper.init();
		navHelper.init();


		navHelper.setConfigName(config._config_name);


		//Prints a new stack in list
		StackService.on('stackUpdated',function(e,stack){
		    stackHelper.print(stack)
		})

		StackService.on('stackBatch',function(e,batch){
		    stackHelper.printBatch(batch)
		})
		//Removes a stack from list
		StackService.on('stackRemoved',function(e,stack){
		    stackHelper.remove(stack)
		})

		//Clear oll rows
		StackService.on('listCleared',function(e,stack){
		    stackHelper.clear(stack)
		})
		
		//Show last stack result on any list change 
		StackService.on('listUpdated',function(e,passed){
			
		    navHelper.setCountVisible(StackService.viewList.length);
		    navHelper.setCountTotal(StackService.list.length);

			if (!autoFocus || passed===false || passed===null)
				return;
			
		    var stackId = stackHelper.getLast();
		    var stack = StackService.findStackById(stackId);

		    stackHelper.scrollToBottom();
		    stackHelper.highlight(stackId);
			resultHelper.print(stack,true);
		})

		//Highlight a row and print his result
		stackHelper.bindRowClick(function(stackId){
			var stack = StackService.findStackById(stackId);
			
		    stackHelper.highlight(stackId);
			resultHelper.print(stack);
		})

		//Clear the stack list
		navHelper.bindClear(function(){
			StackService.clearList();
		})

		//Click on a result prop
		resultHelper.bindAttrClick(function(prop,value){
			var query = filterHelper.getCurrentVal();
			var q = FilterService.add(prop,value,query);
			filterHelper.setFilterValue(q)
		})

		//Filter data binding
		filterHelper.bindFilterApply(function(val){
			FilterService.setQuery(val);
		})
		filterHelper.setFilterValue(FilterService.getQuery(),true)

		//Redraw the list on any filter change
		FilterService.on('queryChange',function(e,query){
			StackService.printList(true);
		})

		//Ask for stack history
		navHelper.bindFetch(function(num,step){
			StackService.clearList();
			SocketService.fetchHistory(num,step)
		})

		StackService.on('filterResult',function(e,err){
			stackHelper.updateErrorState(err)
		})


		//Ask for stack history
		navHelper.bindAutoFocus(function(status){
			autoFocus = !autoFocus;
			navHelper.setAutoFocus(autoFocus)
		})

		//Pause/resume source logs
		navHelper.bindPauseSource(function(source){
			SocketService.togglePause(source);
		})

		//Source connections
		SocketService.on('connectionsStatusChanged',function(e,sources){
			navHelper.setSources(sources);
		})
		navHelper.setSources(SocketService.getConnections());

		StackService.initList();
		
	}
}