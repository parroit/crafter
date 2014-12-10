'use strict';

var streamify = require('stream-array');
var File = require('vinyl');
var through2 = require('through2');
var concat = require('concat-stream');

function vinylString(code, path) {
    if (typeof code == 'string') {
        code = [code];
    }

    return streamify(code.map(function(code) {
        return new File({
            path: path,
            contents: new Buffer(code)
        });
    }));

}

function destArray(cb) {
    return through2.obj(function visit(file, enc, next) {

        this.push([file]);
        return next();

    }).pipe(concat(cb));
}

exports.src = vinylString;
exports.dst = destArray;
