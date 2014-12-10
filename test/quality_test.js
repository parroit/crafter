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
var fs = require('fs');
var vinylFs = require('vinyl-fs');
var vinylString = require('../lib/vinylString');
var includeRequirements = require('../lib/include-requirements.js');
var modulesBuilder = require('../lib/modules-builder');
var codeGenerator = require('../lib/code-generator');

var functionWrapper = require('../lib/declare-function-wrapper');

describe('@quality', function() {

    describe('result body', function() {
        checkQualityTest('file_without_deps');
        checkQualityTest('multiple_files_without_deps');
        checkQualityTest('simple_requirement');
        checkQualityTest('requires_by_index');
        checkQualityTest('requires_duplicate');
        checkQualityTest('requires_in_folder');
        checkQualityTest('requires_two');
        checkQualityTest('dep_in_node_modules');
    });

});

function check(readable, expected, done) {
    var expectasions;
    if (typeof expected === 'string') {
        expectasions = [expected];
    } else {
        expectasions = expected;
    }


    readable
        .pipe(modulesBuilder.start())
        .pipe(includeRequirements(vinylFs))
        .pipe(modulesBuilder.assignId())
        .pipe(modulesBuilder.replaceRequires())
        .pipe(functionWrapper())
        .pipe(codeGenerator())
        .pipe(vinylString.dst(function(result) {
            result.length.should.be.equal(expectasions.length);
            var i = expectasions.length;
            while (i--) {
                var actual = result[i].contents.toString('utf8');
                actual.should.be.equal(expectasions[i]);
            }
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
        vinylString.src(code, __dirname + '/assets/index.js'),
        expected,
        done
    );

}

function checkQualityTest(test) {
    it(test, function(done) {
        var pattern = __dirname + '/assets/quality_tests/' + test + '/*_source.js';
        var expected = fs.readFileSync(__dirname + '/assets/quality_tests/' + test + '/expected.js', 'utf8');
        var exps = expected.split('\n\n');

        checkWithFile(
            pattern,
            exps,
            done
        );
    });

}
