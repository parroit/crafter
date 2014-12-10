/*
 * crafter
 * https://github.com/parroit/crafter
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

'use strict';

var chai = require('chai');
chai.expect();
chai.should();

var path = require('path');
var vinylString = require('../lib/vinylString');
var astVisitor = require('../lib/ast-visitor');
var astParser = require('../lib/ast-parser');
var requireFinder = require('../lib/ast-require-finder.js');


describe('@only requireFinder', function() {
    this.timeout(2000);

    it('is defined', function() {
        requireFinder.should.be.a('function');
    });

    function checkWithCode(code, expected, done) {
        vinylString.src(code, __dirname + '/assets/quality_tests/simple_requirement/index_source.js')
            .pipe(astParser())
            .pipe(astVisitor(requireFinder))
            .pipe(vinylString.dst(function(result) {
                
                Object.keys(result[0].requires.relatives).forEach(function(file){
                    var filePath = result[0].requires.relatives[file];
                    result[0].requires.relatives[file] = path.relative(__dirname + '/..', filePath).replace(/\\/g, '/');
                });
                Object.keys(result[0].requires.dependencies).forEach(function(file){
                    var filePath = result[0].requires.dependencies[file];
                    result[0].requires.dependencies[file] = path.relative(__dirname + '/..', filePath).replace(/\\/g, '/');
                });
                //console.dir(result.map(function(r){return r.requires;}));

                //console.dir(expected)
                result[0].requires.should.be.deep.equal(expected);
                done();
            }));

    }

    it('add required files', function(done) {
        var code = 'var x = require(\'./x\');';
        checkWithCode(code, {
            core: {},
            relatives: {'./x': 'test/assets/quality_tests/simple_requirement/x.js'},
            dependencies: {}
        },done);
    });

    it('add required core files', function(done) {
        var code = 'var x = require(\'fs\');';
        checkWithCode(code, {
            core: {'fs': true},
            relatives: {},
            dependencies: {}
        },done);
    });

    it('add required node_modules', function(done) {
        var code = 'var x = require(\'acorn\');';
        checkWithCode(code, {
            core: {},
            relatives: {},
            dependencies: {'acorn': 'node_modules/acorn/acorn.js'}
        },done);
    });
   

});
