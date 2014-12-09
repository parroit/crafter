'use strict';

var through2 = require('through2');
var acorn = require('acorn');


function streamRewind() {
    return through2.obj(function streamRewind(file, enc, next) {
        var stream = this;
        
        file.rewind = function(){
            stream.push(file); 
        };

        stream.push(file); 
        return next();

    });
}

module.exports = streamRewind;
