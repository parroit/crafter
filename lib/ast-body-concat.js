'use strict';


var astVisitor = require('./ast-visitor');
var requireFinder = require('./ast-require-finder');
var estemplate = require('estemplate');
var through = require('through');
var fs = require('fs');
var File = require('vinyl');
var cachedTemplate = null;
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
        var stream = this;

        if (cachedTemplate) {
            applyTemplate(cachedTemplate);
        } else {
            fs.readFile(__dirname + '/body-concat.jst','utf8',function(err, data){
                cachedTemplate = data;
                applyTemplate(cachedTemplate);
            });
        }

        function applyTemplate(template) {
            try {
                var file = new File({
                    path: targetPath
                });

                file.ast = estemplate(template, {
                    modules: modules
                });

                file.contents = new Buffer(escodegen.generate(file.ast));

                stream.queue(file);
                stream.queue(null);

            } catch (err) {
                stream.emit('error', err);
            }
        }



    });
};
