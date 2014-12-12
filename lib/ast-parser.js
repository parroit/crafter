'use strict';

var through2 = require('through2');
var acorn = require('acorn');
var path = require('path');

function parseJs (code, options) {
    return acorn.parse(code, {locations:options.loc});
}

function parseJSON (code, options) {
    return acorn.parse('module.exports = '+code+';', {locations:options.loc});
}

function astParser(options) {
    options = options || {loc:true};
    options.loc = 'loc' in options ? options.loc :  true;
    options.parsers = options.parsers || {
        js: parseJs,
        json: parseJSON
    };

    options.parsers.js = options.parsers.js || parseJs;
    options.parsers.parseJSON = options.parsers.parseJSON || parseJSON;

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

            var code = file.contents.toString(enc);
            var ext = path.extname(file.path).slice(1);
            if (ext in options.parsers) {
                file.ast = options.parsers[ext](code, options);    
                this.push(file); 
                return next();
            } else {
                throw new Error('Unsupported file extension:'+ext+ ' for file ' + file.path);
            }
            

            
            

        } catch (err) {
            
            err.file = file;
            this.emit('error', err);
            return next();
        }

    });
}

module.exports = astParser;
