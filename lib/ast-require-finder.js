'use strict';

var resolve = require('resolve');
var path = require('path');
var Promise = require('bluebird');

function astRequireFinder(node) {
    //jshint validthis:true
    var file = this;
    
    if (!file.requires) {
        file.requires = {
            core: [],
            relatives: [],
            dependencies: []
        };
    }

    if (!file.results) {
        file.results = [];
    }

    if (node.type === 'CallExpression' && node.callee.name === 'require') {

        var modulePath = node.arguments[0].value;

        if (resolve.isCore(modulePath)) {
            file.requires.core.push(modulePath);
            return;
        }

        var opts = {
            basedir: path.dirname(file.path)
        };

        var result = new Promise(function(resolvePromise, rejectPromise){
            resolve(modulePath, opts, function(err, res) {
                if (err) {
                    return resolvePromise(err);
                }

                if (modulePath[0] === '.') {
                    file.requires.relatives.push(modulePath);
                } else {
                    file.requires.dependencies.push(modulePath);
                }

                resolvePromise(res);

            });
    
        });

        file.results.push(result);
        
    }
}

module.exports =astRequireFinder;
