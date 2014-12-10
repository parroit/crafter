'use strict';


var through = require('through');
var through2 = require('through2');
var PassThrough = require('stream').PassThrough;
var duplexer = require('duplexer2');
var merge = require('merge-stream');
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;


function fallup() {
    
    var fallupStream =  new PassThrough({ objectMode: true });
    var input = new PassThrough({ objectMode: true });
    fallupStream.available = true;
    
    fallupStream.destroy = function() {
        fallupStream.available = false;
    };

    fallupStream.on('finish' ,function() {
        fallupStream.available = false;
    });

    fallupStream.available = true;

    var output = through2.obj(function streamRewind(file, enc, next) {

        file.fallup = fallupStream;

        this.push(file);
        return next();

    });

    merge(input, fallupStream).pipe(output);    
    return duplexer(input , output );

}
/*
streamRewind.passed = function() {
    return through(
        function write(data) {
            
            if (data.rewind && !this.rewind) {
                this.rewind = data.rewind;
                console.log('rewind saved');
            }
            
            this.queue(data);
            
            var rewind = this.rewind;
            setTimeout(function(){
                
                rewind.stream.remaining--;
                console.log('passed ' , data.contents.toString('utf8') , ',remaining ',rewind.stream.remaining)
            
                if (rewind.stream.inputClosed && 
                    !rewind.stream.remaining) {
                    
                    console.log(typeof rewind.stream.end);
                    rewind.stream.end();
                    rewind.stream = null;
                    console.log('end rewind stream');
                }
    
            },100);
        },

        function end(){
           this.queue(null);
            
        }
    );
};
*/
module.exports = fallup;
