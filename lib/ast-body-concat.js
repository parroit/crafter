'use strict';


var astVisitor = require('./ast-visitor');
var requireFinder = require('./ast-require-finder');
var estemplate = require('estemplate');
var through = require('through');
var File = require('vinyl');
var template = '(function module_preamble() {(\n'+
    'function modules() {%= modules %} )();\n'+
    'function define(id,factory) {\n'+
    '    return modules[id] || (modules[id] = factory({},{}));\n'+
    '}\n'+
'} )();';
var escodegen = require('escodegen');

module.exports = function(targetPath) {
    var modules = [];
    return through(function write(file) {
        if (file.isNull()) {
            this.queue(file); // pass along
            return;
        }

        if (file.isStream()) {
            this.emit('error', new Error('Streaming not supported'));
            return;
        }

        [].push.apply(modules, file.ast.body);


    }, function end() {


        try {
            var file = new File({
                path: targetPath
            });

            file.ast = estemplate(template, {
                modules: modules
            });

            file.contents = new Buffer(escodegen.generate(file.ast));

            this.queue(file);
            this.queue(null);

        } catch (err) {
            this.emit('error', err);
        }


    });
};
