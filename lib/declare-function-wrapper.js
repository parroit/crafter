'use strict';


var astVisitor = require('./ast-visitor');
var requireFinder = require('./ast-require-finder');
var estemplate = require('estemplate');
var through2 = require('through2');
var fs = require('fs');

var templateCache = null;

module.exports = function() {
    return through2.obj(function visit(file, enc, next) {
        var stream = this;

        if (file.isNull()) {
            stream.push(file); // pass along
            return next();
        }

        if (file.isStream()) {
            stream.emit('error', new Error('Streaming not supported'));
            return next();
        }
        function applyTemplate(template){
            file.ast = estemplate(template, file);
            stream.push(file); // pass along
            return next();
        }

        if (templateCache !== null) {
            applyTemplate(templateCache);
        } else {
            fs.readFile(__dirname + '/function-define.jst','utf8',function(err, data){
                templateCache = data;
                applyTemplate(templateCache);
            });
        }

    });
};
