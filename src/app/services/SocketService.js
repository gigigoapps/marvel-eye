'use strict'

const debug = require('debug')('marvel:socket');
const socketIo = require('socket.io-client')

const StackService = require('./StackService');
const config = require('../lib/config')
const _ = require('lodash')
const EventEmitter = require('../lib/EventEmitter')

class SocketConnection extends EventEmitter{

    constructor(name,uri){
        super();
        this.name = name;
        this.uri = uri;
        this.debug = require('debug')('marvel:socket:'+name);
        this.socket = null;
        this.connected = false;
        this.paused = false;
        this.meta = {};
        this.connect();
    }

    connect(){
        this.socket = socketIo(this.uri);
        
        this.debugEvents()

       	//Connection status listeners
        this.socket.on('connect',()=>{
            this.connected = true;
            this.emit('statusChanged',true)

            this.socket.emit('getMetadata',(meta)=>{
                this.meta = meta;
            })
        })
        this.socket.on('disconnect',()=>{
            this.connected = false;
        	this.emit('statusChanged',false)
        })

        //Stack listeners
        this.socket.on('log',(log)=>{
            if (this.paused)
                return;
            // this.debug('log',log)
            StackService.addLog(this.name,log)
        })
        this.socket.on('logs',(logs)=>{
            if (this.paused)
                return;
            this.debug('logs',logs.length)
            StackService.addLogs(this.name,logs)
        })

    }

    togglePause(){
        this.paused = !this.paused;
    }


    fetchHistory(num,step){
        this.debug('fetchHistory asking',num,step)
        this.socket.emit('fetchHistory',{num:num,step:step})
    }


    debugEvents(){

    	//Socket events
    	let eventNames = [
        'connect',
        'error',
        'disconnect',
        'reconnect',
        // 'reconnect_attempt',
        'reconnecting',
        // 'reconnect_error',
        // 'reconnect_failed'
        ];

    	eventNames.forEach((eventName)=>{
    		this.socket.on(eventName, ()=>this.debug('io:'+eventName))
    	})
    }
}

class SocketsWrapper extends EventEmitter{
    constructor(){
        super();
        this.conns = [];

        debug('sources',config._sources);
        _.each(config._sources,(source)=>{
            var conn = new SocketConnection(source.name,source.uri);
            this.conns.push(conn);
            conn.on('statusChanged',this._emitConnectionsStatus.bind(this))
            this._emitConnectionsStatus();
        })
    }

    fetchHistory(num,step){
        _.each(this.conns,function(conn){
            conn.fetchHistory(num,step)
        })
    }

    getConnections(){
        return _.map(this.conns,function(c){
            return _.pick(c,['name','connected','paused','uri']);
        })
    }
    _emitConnectionsStatus(){
        this.emit('connectionsStatusChanged',[this.getConnections()])
    }

    togglePause(sourceName){
        var source = _.find(this.conns,{name:sourceName});
        source.togglePause();
        this._emitConnectionsStatus();
    }

}



module.exports = new SocketsWrapper();