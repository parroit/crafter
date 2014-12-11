'use strict';
var vinylFs = require('vinyl-fs');
var repipeRequirement = require('../lib/include-requirements.js').repipe;
var modulesBuilder = require('../lib/modules-builder');
var codeGenerator = require('../lib/code-generator');
var astBodyConcat = require('../lib/ast-body-concat');
var functionWrapper = require('../lib/declare-function-wrapper');
var duplexer2 = require('duplexer2');
var astParser = require('./ast-parser');
var astVisitor = require('./ast-visitor');
var requireFinder = require('./ast-require-finder');
var fallup = require('./stream-rewind');

exports.bundle = function bundle(options) {
	
	if (typeof options === 'string' || typeof options === 'undefined') {
	 	options = {
	 		target: options
	 	};
	} 

	options.target = options.target || 'index.js';
	options.exports = options.exports || [];

	var writable = modulesBuilder.start();
    var readable = writable 
        .pipe(fallup())
        .pipe(astParser())
        .pipe(astVisitor(requireFinder))
        .pipe(repipeRequirement(vinylFs))
        .pipe(modulesBuilder.assignId())
        .pipe(modulesBuilder.replaceRequires())
        .pipe(functionWrapper())
        .pipe(astBodyConcat(options.target, options.exports))
        .pipe(codeGenerator());

    return duplexer2(writable, readable);
};