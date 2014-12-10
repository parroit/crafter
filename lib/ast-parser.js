'use strict';

var through2 = require('through2');
var acorn = require('acorn');


function astParser() {
    return through2.obj(function visit(file, enc, next) {
        if (file.isNull()) {
            this.push(file); // pass along
            return next();
        }

        if (file.isStream()) {
            this.emit('error', new Error('Streaming not supported'));
            return next();
        }

        try {
            var code = file.contents.toString(enc);
            file.ast = acorn.parse(code);
            this.push(file); 
            return next();

        } catch (err) {
            this.emit('error', err);
            return next();
        }

    });
}

module.exports = astParser;
