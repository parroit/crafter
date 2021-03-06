'use strict';

var resolve = require('resolve');
var path = require('path');
var winston = require('winston');
var Promise = require('bluebird');

function astRequireFinder (options){
    return function (node) {
        //jshint validthis:true
        var file = this;

        if (!file.requires) {
            file.requires = {
                core: {},
                relatives: {},
                dependencies: {}
            };
        }

        if (!file.results) {
            file.results = [];
        }

        if (node.type === 'CallExpression' && node.callee.name === 'require') {

            var modulePath = node.arguments[0].value;

            if (resolve.isCore(modulePath) ) {
                if (modulePath in options.core && options.core[modulePath] !== 'ignore') {
                    
                    modulePath = options.core[modulePath];    
                    
                } else {
                    
                    file.requires.core[modulePath] = true;    
                    if (options.core[modulePath] !== 'ignore') {
                        var relPath = path.relative(file.base, file.path);
                        relPath = relPath.replace(/\\?node_modules\\/g,'->');
                        var msg = 'Not configured core module ' + modulePath + 
                            ' at ' + relPath + ':' + node.loc.start.line + '[' +
                            node.loc.start.column + ',' + node.loc.end.column + ']';
                        winston.warn(msg);
                    }
                    return;
                }
                
                
            }

            var opts = {
                basedir: path.dirname(file.path)
            };

            var result = new Promise(function(resolvePromise, rejectPromise){
                resolve(modulePath, opts, function(err, res) {
                    if (err) {
                        return resolvePromise(err);
                    }
                    res = res.replace(/\\/g,'/');
                    
                    node.resolvedPath = res;

                    if (modulePath[0] === '.') {
                        file.requires.relatives[modulePath] = res;
                    } else {
                        file.requires.dependencies[modulePath] = res;
                    }

                    resolvePromise(res);

                });
        
            });

            file.results.push(result);
            
        }
    };
}

module.exports = astRequireFinder({
    core: {}
});
module.exports.withOptions =astRequireFinder;