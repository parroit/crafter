'use strict';


var astVisitor = require('./ast-visitor');
var requireFinder = require('./ast-require-finder');
var estemplate = require('estemplate');
var through2 = require('through2');

var template = 'define(<%= {type: "Literal", value: id} %>, function(module, exports) {%= ast.body %} );';

module.exports = function() {
    return through2.obj(function visit(file, enc, next) {
        if (file.isNull()) {
            this.push(file); // pass along
            return next();
        }

        if (file.isStream()) {
            this.emit('error', new Error('Streaming not supported'));
            return next();
        }

        //console.log(JSON.stringify(file.ast.body,null,4));
        file.ast = estemplate(template, file);
        //console.log(JSON.stringify(file.ast,null,4));
        this.push(file); // pass along
        return next();
    });
};
