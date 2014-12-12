'use strict';
var vinylFs = require('vinyl-fs');
var duplexer2 = require('duplexer2');

var repipeRequirement = require('./repipe-requirement.js');
var modulesBuilder = require('./modules-builder');
var codeGenerator = require('./code-generator');
var astBodyConcat = require('./ast-body-concat');
var functionWrapper = require('./declare-function-wrapper');
var astParser = require('./ast-parser');
var astVisitor = require('./ast-visitor');
var requireFinder = require('./ast-require-finder');
var fallup = require('./stream-rewind');
var assignId = require('./assign-module-id');
var replaceRequires = require('./replace-requires');
var coreRequireConfig = require('./ast-core-require-config');
var winston = require('winston');

function reportThroughError(through) {
    return function(err) {
        winston.error(
            through._transform ?
            ('Error occurred in function ' + through._transform.name)
            :'Error occurred '+ 
            ' in file '+err.file.path +'\n\n'+
            err.stack
        );
    };
}

function createPipeset(throughStreams) {
    var writable = throughStreams[0];
    var streamIdx = 1;
    var current = writable;
    var readable;

    for (; streamIdx < throughStreams.length; streamIdx++) {
        var through = throughStreams[streamIdx];
        through.on('error', reportThroughError(through));
        current = current.pipe(through);
    }
    readable = current;

    return duplexer2(writable, readable);
}

exports.bundle = function bundle(options) {

    if (typeof options === 'string' || typeof options === 'undefined') {
        options = {
            target: options
        };
    }


    options.target = options.target || 'index.js';
    options.exports = options.exports || [];
    var throughStreams = [
        modulesBuilder(),
        fallup(),
        astParser(options.exports.parsers),
        astVisitor(requireFinder.withOptions(options)),
        repipeRequirement(vinylFs),
        assignId(),
        replaceRequires(),
        functionWrapper(),
        astBodyConcat(options.target, options.exports),
        codeGenerator()
    ];

    return createPipeset(throughStreams);
};


exports.core = function bundle(options) {

    options = options || {
        core: {}
    };
    
    options.exports = options.exports || [];

    var throughStreams = [
        modulesBuilder(),
        fallup(),
        astParser(options.exports.parsers),
        astVisitor(requireFinder.withOptions(options)),
        repipeRequirement(vinylFs),
        astVisitor(coreRequireConfig(options))
    ];

    return createPipeset(throughStreams);
};
