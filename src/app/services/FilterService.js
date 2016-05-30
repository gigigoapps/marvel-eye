/*jshint -W061 */
'use strict'

const debug = require('debug')('marvel:filter');

const _ = require('lodash')
const EventEmitter = require('../lib/EventEmitter')

const PROP_REGEX = /\{([\.\w-\[\]]+)\}/g;
const OWN_PROPS= ['id','created','source']

class FilterService extends EventEmitter{

    constructor(){
        super();
        this.query = '';
        this.lastQuery = null;
        this.evalError = '';
        try{
            this.query = window.sessionStorage.getItem('query') || '';
        }catch(e){}
    }

    setQuery(q){
        this.query = _.trim(q);
        this.update();
    }

    getQuery(){
        return this.query;
    }

    add(prop,value,query){
        var q = query || this.query;
        q = q + (q ? ' && ': '') +'{'+prop+'}'+'=='+value;
        this.query = _.trim(q);
        // this.update();
        return this.query;
    }

    update(){
        clearTimeout(this._timer)
        this._timer = setTimeout(this._update.bind(this),50)
    }

    _update(){
        if (this.query === this.lastQuery)
            return;

        this.lastQuery = this.query;
        debug('saving',this.query)
        this.emit('queryChange',this.query)
        try{
            window.sessionStorage.setItem('query',this.query);
        }catch(e){}
    }



    checkStack(stack){
        this.evalError = '';
        if (!this.query)
            return true;

        var query = this.query.replace(PROP_REGEX,function(m,prop){
            var prefix = ~OWN_PROPS.indexOf(prop)? '' : 'data.';
            var val = _.get(stack,prefix+prop);
            if (typeof val == 'string')
                val = '"'+val+'"';
            return val;
        });

        var pass = false;

        try{
            pass = Function('"use strict"; return !!('+query+')')()
        }catch(e){
            debug('eval error',e.message)
            this.evalError = e.message;
            pass = null;
        }
        return pass
    }
}

module.exports = new FilterService();