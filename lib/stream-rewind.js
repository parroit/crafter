'use strict';


var through = require('through');
var through2 = require('through2');


function streamRewind() {

    var stream = through(function write(file) {

        file.rewind = function(f) {
            write(f || this);
            this.rewind.passed();
        };

        file.rewind.passed = function() {
            stream.rewindCount--;
            if (stream.rewindCount <= 0 && stream.finished) {
                stream.emit('end');
            }
        };

        file.rewind.repipe = function(newStream) {
            newStream.pipe(stream);

            stream.rewindCount++;
            process.nextTick(function() {
                stream.rewindCount--;
                file.rewind.passed();
            });
        };

        stream.rewindCount++;
        file.rewind.stream = stream;

        stream.emit('data', file);

    }, function end() { //optional
        if (stream.rewindCount <= 0) {
            return stream.emit('end');
        }
        stream.finished = true;
    });

    stream.rewindCount = 0;
    stream.finished = false;

    return stream;


}

streamRewind.passed = function() {
    return through2.obj(function streamRewind(file, enc, next) {
        file.rewind.passed();

        this.push(file);
        return next();

    });
};

module.exports = streamRewind;
