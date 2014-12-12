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
var vinylFs = require('vinyl-fs');
var vinylString = require('../lib/vinylString');
var includeRequirements = require('../lib/include-requirements.js');
var modulesBuilder = require('../lib/modules-builder');
var codeGenerator = require('../lib/code-generator');
var assignId = require('../lib/assign-module-id');
var replaceRequires = require('../lib/replace-requires');
var functionWrapper = require('../lib/declare-function-wrapper');

describe('@only replace-requires', function() {
    this.timeout(2000);

    function check(readable, expected, done) {
        readable
            .pipe(modulesBuilder())
            .pipe(includeRequirements(vinylFs))
            .pipe(assignId())
            .pipe(replaceRequires())
            
            .pipe(codeGenerator())
            .pipe(vinylString.dst(function(result) {
                
                var actual = result[0].contents.toString('utf8');
                actual.should.be.equal(expected);
                done();
            }));
    }

    function checkWithFile(path, expected, done) {
        check(
            vinylFs.src(path),
            expected,
            done
        );

    }

    function checkWithCode(code, expected, done) {
        check(
            vinylString.src(code, __dirname + '/assets/quality_tests/simple_requirement/index_source.js'),
            expected,
            done
        );

    }

    it('files without deps', function(done) {
        checkWithCode(
            'var x = 42;', 
            'var x = 42;',
            done
        );
    });

    it('multiple files without deps', function(done) {
        checkWithCode(
            ['var x = 42;', 'var z = 42;'], 
            'var x = 42;',
            done
        );
    });

    it('add required files', function(done) {
        checkWithCode(
            'var x = require(\'./x\');', 
            'var x = require(1);',
            done
        );
    });




});
