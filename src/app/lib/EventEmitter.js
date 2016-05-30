'use strict';
const $ = require('jquery');

let EventEmitter = function(){
    this._JQ = $(this);
}

EventEmitter.prototype = {
  emit: function(evt, data) {
    this._JQ.trigger(evt, data);
  },
  once: function(evt, handler) {
    this._JQ.one(evt, handler);
  },
  on: function(evt, handler) {
    this._JQ.bind(evt, handler);
  },
  off: function(evt, handler) {
    this._JQ.unbind(evt, handler);
  }
};
 
module.exports = EventEmitter;
