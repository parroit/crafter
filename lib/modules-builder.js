'use strict';

var through2 = require('through2');

function modulesBuilder() {
    var builder = {
        rootModules:{},
        modules:{},
        resolved:{},
        needResolve: function() {
            var resolvedKeys = Object.keys(builder.resolved);
            var moduleKeys = Object.keys(builder.modules);
            var toResoveKeys = moduleKeys.filter(function(module){
                return resolvedKeys.indexOf(module) === -1;
            });
             
            return toResoveKeys.length > 0;
        }
    };

    return through2.obj(function visit(file, enc, next) {
        if (file.isNull()) {
            this.push(file); // pass along
            return next();
        }

        if (file.isStream()) {
            this.emit('error', new Error('Streaming not supported'));
            return next();
        }
        var dep = file.path.replace(/\\/g,'/');
        builder.rootModules[dep] = true;
        builder.modules[dep] = true;
        file.builder = builder;

        this.push(file); 
        return next();

    });

    
}



module.exports = {
    start: modulesBuilder,
    assignId: require('./assign-module-id'),
    replaceRequires: require('./replace-requires')
};
