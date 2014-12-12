'use strict';


var astVisitor = require('./ast-visitor');
var requireFinder = require('./ast-require-finder');
var winston = require('winston');

function astRequiresReplacer(node) {
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
        if (!(node.resolvedPath in file.builder.modules)) {
            return;
        }

        node.arguments[0].value = 
        	file.builder.modules[node.resolvedPath];
        
        
    }
}

module.exports = function() {
    return astVisitor(astRequiresReplacer);
};
