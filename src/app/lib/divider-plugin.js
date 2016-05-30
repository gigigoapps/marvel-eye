'use strict';

const $ = require('jquery');

$.fn.divider = function(){
    this.each(function(){
        var t = new Divider(this);
    })
}

class Divider{
    constructor(elem){
        this.$elem = $(elem);
        this.$elem.data('divider',this);
        this.dir = this.$elem.data('dir') == 'vertical';
        this.startPoint = 0;
        this.$elem.mousedown(this.mousedown.bind(this))
    }

    getPoint(e){
        return this.dir ? e.pageX : e.pageY;
    }

    mousedown(e){
        this.startPoint = this.getPoint(e)

        this.$prev = this.$elem.prev();
        this.$next = this.$elem.next();

        $(document)
            .on('mousemove.divider',this.mousemove.bind(this))
            .on('mouseup.divider',this.mouseup.bind(this))

        e.stopPropagation();
        e.preventDefault();
    }
    mousemove(e){
        var current = this.getPoint(e);
        var total = this.$prev.outerHeight() + this.$next.outerHeight();
        console.log(this.$prev);
        console.log(current,total);
    }
    mouseup(){
        $(document).off('.divider');
    }

}