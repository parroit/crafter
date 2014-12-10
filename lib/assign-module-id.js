'use strict';
var through = require('through');

module.exports = assignModuleId;

function assignModuleId() {
    var id = 0;
    var allFiles = [];
    return through(function write(file) {
        //console.log('assign id to ' + file.path)
        if (file.isNull()) {
            this.push(file); // pass along
            return;
        }

        if (file.isStream()) {
            this.emit('error', new Error('Streaming not supported'));
            return;
        }

        var builder = file.builder;

        var filePath = file.path.replace(/\\/g,'/');
        if (! (filePath in builder.modules) ) {
            this.emit('error', new Error('Not loaded in modules: ',filePath));
            return;   
        }
        
        file.id = id++;
        //console.log('assigned ' + file.id)
        builder.modules[filePath] = file.id;

        
        allFiles.push(file); 
        return;

    }, function end(){
        var _this = this;
        allFiles.forEach( function(file) {
            _this.queue(file);
        });
        _this.queue(null);
    });


}
