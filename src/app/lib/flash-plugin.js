'use strict';

const $ = require('jquery');

$.fn.flash = function(){
    this.addClass('flash');
    clearTimeout(this._timer)
    this._timer = setTimeout(()=>{
        this.removeClass('flash')
    },100)
    // this.css({color:'#fc0'}).animate({color:'#222'},500);
}
