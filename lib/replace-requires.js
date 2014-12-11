'use strict';


var astVisitor = require('./ast-visitor');
var requireFinder = require('./ast-require-finder');

function astRequiresReplacer(node) {
    //jshint validthis:true
    var file = this;
    //console.log(file.path);
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
        if (!(node.resolvedPath in file.builder.modules)) {
            //console.log('error', new Error('Not loaded in modules: ' + node.arguments[0].value));
            return;
        }

        node.arguments[0].value = 
        	file.builder.modules[node.resolvedPath];
        
        
    }
}

module.exports = function() {
    return astVisitor(astRequiresReplacer);
};
