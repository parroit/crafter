'use strict';
var vinylFs = require('vinyl-fs');
var duplexer2 = require('duplexer2');

var repipeRequirement = require('./include-requirements.js').repipe;
var modulesBuilder = require('./modules-builder');
var codeGenerator = require('./code-generator');
var astBodyConcat = require('./ast-body-concat');
var functionWrapper = require('./declare-function-wrapper');
var astParser = require('./ast-parser');
var astVisitor = require('./ast-visitor');
var requireFinder = require('./ast-require-finder');
var fallup = require('./stream-rewind');

function reportThroughError(through) {
    return function(err) {
        console.log(
            'Error occurred in function ' + through._transform.name+ 
            ' in file '+err.file.path
        );
        console.warn(err);
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
        modulesBuilder.start(),
        fallup(),
        astParser(),
        astVisitor(requireFinder),
        repipeRequirement(vinylFs),
        modulesBuilder.assignId(),
        modulesBuilder.replaceRequires(),
        functionWrapper(),
        astBodyConcat(options.target, options.exports),
        codeGenerator()
    ];

    return createPipeset(throughStreams);
};
