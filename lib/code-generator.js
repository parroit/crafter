'use strict';

var through2 = require('through2');
var walk = require('walk-ast');
var escodegen = require('escodegen');

function codeGenerator() {
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
            var code = escodegen.generate(file.ast);
            file.contents = new Buffer(code);

            this.push(file);
            return next();

        } catch (err) {
            this.emit('error', err);
            return next();
        }

    });
}

module.exports = codeGenerator;
