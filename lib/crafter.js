'use strict';
var vinylFs = require('vinyl-fs');
var includeRequirements = require('../lib/include-requirements.js');
var modulesBuilder = require('../lib/modules-builder');
var codeGenerator = require('../lib/code-generator');
var astBodyConcat = require('../lib/ast-body-concat');
var functionWrapper = require('../lib/declare-function-wrapper');
var duplexer2 = require('duplexer2');

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
        .pipe(includeRequirements(vinylFs))
        .pipe(modulesBuilder.assignId())
        .pipe(modulesBuilder.replaceRequires())
        .pipe(functionWrapper())
        .pipe(astBodyConcat(options.target, options.exports))
        .pipe(codeGenerator());

    return duplexer2(writable, readable);
};