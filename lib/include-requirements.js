'use strict';


var through2 = require('through2');
var duplexer2 = require('duplexer2');
var astParser = require('./ast-parser');
var astVisitor = require('./ast-visitor');
var requireFinder = require('./ast-require-finder');
var fallup = require('./stream-rewind');
//console.log('streamRewind',streamRewind)

function includeRequirements(adapter) {
    var builder;    
    var writable = fallup();
    var readable = writable 
        .pipe(astParser())
        .pipe(astVisitor(requireFinder))
        .pipe((function() {
            return through2.obj(function loadRequired(file, enc, next) {
                if (!file.requires) {
                    this.push(file);
                    return next();
                }
                
                if (!builder) {
                    builder = file.builder;
                }

                if (!file.builder) {
                    file.builder = builder;
                }

                var relatives = Object.keys(file.requires.relatives).map(function(filePath){
                    return file.requires.relatives[filePath];
                });

                var dependencies = Object.keys(file.requires.dependencies).map(function(filePath){
                    return file.requires.dependencies[filePath];
                });

                var allDeps = relatives.concat(dependencies)
                    .filter(function(filePath){
                        return Object.keys(builder.modules).indexOf(filePath) === -1;    
                    });
                
                builder.resolved[file.path.replace(/\\/g,'/')] = true;

                if (allDeps.length) {
                    allDeps.forEach(function(dep){
                        builder.modules[dep.replace(/\\/g,'/')] = true;
                    });
                    //console.log('repipe',allDeps);
                    adapter.src(allDeps).pipe(
                        file.fallup,
                        {end:false}
                    );    

                } else {

                    if (!builder.needResolve()) {
                        file.fallup.end();
                    }
                }
                
                this.push(file);
                return next();
                
                
            });
        })());
        
    return duplexer2(writable, readable);
}

module.exports = includeRequirements;
