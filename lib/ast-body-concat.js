'use strict';


var astVisitor = require('./ast-visitor');
var requireFinder = require('./ast-require-finder');
var estemplate = require('estemplate');
var through = require('through');
var fs = require('fs');
var File = require('vinyl');
var cachedTemplate = null;
var escodegen = require('escodegen');
var path = require('path');
var acorn = require('acorn');

module.exports = function(targetPath, exports) {
    var modules = [];
    var builder;
    var exportsIds = {};
    exports = exports || [];
    return through(function write(file) {
        if (file.isNull()) {
            this.queue(file); // pass along
            return;
        }

        if (file.isStream()) {
            this.emit('error', new Error('Streaming not supported'));
            return;
        }

        if (file.builder && !builder) {
            builder = file.builder;
        }
        var relativePath = path.relative(file.base, file.path);
        if (Object.keys(exports).indexOf(relativePath) !== -1) {
            exportsIds[ path.basename(relativePath) ] = {
                id: file.id,
                name: exports[relativePath]
            };
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
                file.builder = builder;
                var exportCode = '';

                var exportsKeys = Object.keys(exportsIds);
                if (exportsKeys === 0) {
                    exportCode = 'return undefined;';
                } else if (exportsKeys.length > 1 || (exportsIds[exportsKeys[0]] && exportsIds[exportsKeys[0]].name !== null) ) {
                    exportCode = 'return {'+
                        exportsKeys.map(function(key){
                            
                            var mod = exportsIds[key];
                            return '\'' + mod.name + '\': require(' + mod.id + ');';
                        }).join(',\n')+
                    '};';
                } else if (exportsKeys.length === 1) {
                    var mod = exportsIds[ exportsKeys[0] ];
                    exportCode = 'return require(' + mod.id + ');';
                }
                var outputName = path.basename(targetPath, path.extname(targetPath));

                file.ast = estemplate(template, {
                    modules: modules,
                    exportCode: acorn.parse(exportCode,{
                        allowReturnOutsideFunction: true
                    }),
                    outputName: outputName
                });

                file.contents = new Buffer(escodegen.generate(file.ast));

                stream.queue(file);
                stream.queue(null);

            } catch (err) {
                err.file = file;
                stream.emit('error', err);
            }
        }



    });
};
