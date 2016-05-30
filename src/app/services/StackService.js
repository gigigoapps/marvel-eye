/* globals window */
'use strict'

const debug = require('debug')('marvel:stack');

const _ = require('lodash')
const EventEmitter = require('../lib/EventEmitter')
const config = require('../lib/config')
const FilterService = require('./FilterService')

class StackService extends EventEmitter{

    constructor(){
        super();
        this.lastId=0;
        this.storageKey = 'stackList_cache_'+config._config_name;
    }

    initList(){
        try{
            this.list = JSON.parse(window.sessionStorage.getItem(this.storageKey));
            debug('stackList from storage',this.list && this.list.length)
            //Instances all as StackModels
        }catch(e){
            debug('sessionStorage error',e);
        }
        this.viewList = [];
        this.list = _.isArray(this.list) ? this.list : [];

        this.printList(true)

        let last = this.list[this.list.length-1];
        this.lastId = last && last.id || 0;
    }

    printList(noSave){
        debug('printList')
        this.filterList();
        debug('filtered')

        this.emit('listCleared');
        this.emit('stackBatch',[this.viewList])
        debug('printed')
        this.emit('listUpdated')
        
        if (noSave !== true)
            this.saveList();
    }

    clearList(){
        this.lastId = 0;
        this.list.splice(0);
        this.viewList.splice(0);
        this.emit('listCleared')
        this.emit('listUpdated')
        this.saveList();
    }


    getList(){
        return this.list;
    }

    //Return stack in list
    findStackById(id){
        for(var i = this.list.length;i--;i){
            if (this.list[i] && this.list[i].id == id)
                return this.list[i];
        }
        return null;
    }
    //Return stack index in viewlist
    findStackInViewList(id){
        for(var i = this.viewList.length;i--;i){
            if (this.viewList[i] && this.viewList[i].id == id)
                return i;
        }
        return -1;
    }

    //Return stack index in list
    findStackInList(id){
        for(var i = this.list.length;i--;i){
            if (this.list[i] && this.list[i].id == id)
                return i;
        }
        return -1;
    }

    //Filter a list and saves it to viewList
    filterList(){
        this.viewList.splice(0);

        var index = -1,
            length = this.list.length,
            resIndex = 0,
            pass,
            value,
            result = [];

        while (++index < length) {
            value = this.list[index];
            pass = FilterService.checkStack(value);
            if (pass===null){
                break;
            }
            if (pass){
                this.viewList[resIndex++] = value;
            }
        }

        this.emit('filterResult',FilterService.evalError)
    }
    
    //Saves to localStorage
    saveList(){
        try{
            window.sessionStorage.setItem(this.storageKey,JSON.stringify(this.list.slice(-1000)));
            // debug('saved')
        }catch(e){
            debug('sessionStorage error',e);
        }
    }

    //Multiple log adding
    addLogs(source,logs){
        // this.clearList();
        if (!logs)
            return
        for(var i=0;i<logs.length;i++){
            this.addLog(source,logs[i],true)
        }
        this.printList();
    }

    //Add a log to list
    addLog(source,log,fast){
        //Check type validity
        if (!log || !~config._types.indexOf(log.type)){
            debug('wrong type',log.type)
            return;
        }

        var stack = this._applyLogToStack(source,log);

        //Useful for batch adding
        if (fast!==true){
            
            //Checks if it shoud add/update an stack or removes it depending or filter passing
            var passed = FilterService.checkStack(stack);
            if (passed){
                this._updateStack(stack)
            }
            else{
                this._removeStack(stack)
            }
            this.emit('listUpdated',passed)
            this.saveList();
        }
    }

    //Push a stack to viewlist if it doesn't exists
    _updateStack(stack){
        //Viewlist add
        var index = this.findStackInViewList(stack.id);
        if (!~index)
            this.viewList.push(stack)

        this.emit('stackUpdated',stack);
    }

    //Remove a stack from viewlist and/or list
    _removeStack(stack,alsoList){
        //Viewlist remove
        var index = this.findStackInViewList(stack.id);
        if (~index)
            this.viewList.splice(index,1)

        //List remove
        if (alsoList===true){
            index = this.findStackInList(stack.id);
            if (~index)
                this.list.splice(index,1)
        }

        this.emit('stackRemoved',stack)
    }

    //Find applicable stack or create a new one, then applys the log body
    _applyLogToStack(source,log){
        var stacks = this._findStacksByGlue(log);
        var len = stacks.length;
        var stack;

        //No stack find by glue
        if (!stacks.length){
            stack = this._createStack(source);
        }else{
            //1 stack found
            if (stacks.length == 1){
                stack = stacks[0]
            }
            //+2 stack found
            else{
                stack = this._mergeStacks(stacks);
            }
        }

        //Append body data
        stack.data[log.type] = log.body;

        return stack;
    }

    //Creates a stack and pushes to list
    _createStack(source){

        let stack = {
            id : ++this.lastId,
            data : {},
            source : source,
            created : this._getDate()
        }
        this.list.push(stack)
        return stack;
    }

    //Merge 2 or more stacks, the first is returned, the rest removed from list and viewlist
    _mergeStacks(stacks){
        var primary = stacks.splice(0,1)[0];
        for(var i=0;i< stacks.length;i++){
            _.extend(primary.data,stacks[i].data);
            this._removeStack(stacks[i],true);
        }
        return primary;
    }

    //Find the stacks in list that match Glues properties
    _findStacksByGlue({type,body}){
        // debug('glue',glue);
        
        var glues = config._typeGlues[type];
        if (!glues)
            return [];
        var suited = [];
        var suited_ids = [];

        //Iterate over glues
        for(var g=0;g<glues.length;g++){
            var glue = glues[g];
            //Value to compare
            var val = _.get(body,glue.this_prop);
            if (val){
                //Iterate over list
                var i = this.list.length;
                while(i--){
                    var stack = this.list[i];
                    var that_body = stack.data[glue.that_type];
                    //Compare values
                    if (_.get(that_body,glue.that_prop) == val && !~suited_ids.indexOf(stack.id)){
                        suited.push(stack);
                        suited_ids.push(stack.id);
                    }
                }
            }
        }
        return suited;
    }


    _getDate(){
        var now = new Date();
        var date = '';
        var t;
        date += now.getFullYear()+'-'; 

        t = now.getMonth();
        date += (t<10 ? "0"+t : t)+'-'; 

        t = now.getDate();
        date += (t<10 ? "0"+t : t)+' '; 

        t = now.getHours();
        date += (t<10 ? "0"+t : t)+':'; 

        t = now.getMinutes();
        date += (t<10 ? "0"+t : t)+':'; 

        t = now.getSeconds();
        date += (t<10 ? "0"+t : t)+'.'; 

        t = now.getMilliseconds();
        date += (t<10 ? "00"+t : ( t<100 ? "0"+t : t ) );

        return date; 
    }
}

module.exports = new StackService();