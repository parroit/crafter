'use strict';


var through = require('through');


function streamRewind() {

    var stream = through(function write(file) {

        file.rewind = function(f) {
            write(f || this);
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

module.exports = streamRewind;
