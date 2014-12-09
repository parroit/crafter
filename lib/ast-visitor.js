'use strict';

var through2 = require('through2');
var walk = require('walk-ast');
var Promise = require('bluebird');

function astVisitor(visitors) {
    if (typeof visitors === 'function') {
        visitors = [visitors];
    }
    return through2.obj(function visit(file, enc, next) {
        var _this = this;

        if (file.isNull()) {
            _this.push(file); // pass along
            return next();
        }

        if (file.isStream()) {
            _this.emit('error', new Error('Streaming not supported'));
            return next();
        }

        try {
            visitors.forEach(function(visitor) {
                walk(file.ast, visitor.bind(file));
            });
            
            if (file.results) {
                Promise.all(file.results).then(function() {
                    _this.push(file);
                    file.results = null;
                    return next();
                }).catch(function(err){
                     _this.emit('error', err);
                    return next();
                });

            } else {
                _this.push(file);
                return next();    
            }
            
            

        } catch (err) {
            _this.emit('error', err);
            return next();
        }

    });
}

module.exports = astVisitor;
