'use strict';
var through2 = require('through2');
module.exports = assignModuleId;

function assignModuleId() {
    var id = 0;
    return through2.obj(function visit(file, enc, next) {
        if (file.isNull()) {
            this.push(file); // pass along
            return next();
        }

        if (file.isStream()) {
            this.emit('error', new Error('Streaming not supported'));
            return next();
        }

        var builder = file.builder;

        var filePath = file.path.replace(/\\/g,'/');
        if (! (filePath in builder.modules) ) {
            this.emit('error', new Error('Not loaded in modules: ',filePath));
            return next();   
        }
        
        file.id = id++;
        this.push(file); 
        return next();

    });

    
}
