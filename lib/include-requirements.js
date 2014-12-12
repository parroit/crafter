'use strict';


var through2 = require('through2');
var duplexer2 = require('duplexer2');
var astParser = require('./ast-parser');
var astVisitor = require('./ast-visitor');
var requireFinder = require('./ast-require-finder');
var fallup = require('./stream-rewind');
var repipeRequirement = require('./repipe-requirement');


function includeRequirements(adapter) {
    var writable = fallup();
    var readable = writable
        .pipe(astParser())
        .pipe(astVisitor(requireFinder))
        .pipe(repipeRequirement(adapter));

    return duplexer2(writable, readable);
}
includeRequirements.repipe = repipeRequirement;

module.exports = includeRequirements;
