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
var astBodyConcat = require('../lib/ast-body-concat');
var os = require('os');
var functionWrapper = require('../lib/declare-function-wrapper');

function checkQuality(checkFn, checkName) {
    describe(checkName, function() {
        checkQualityTest(checkFn, 'file_without_deps');
        checkQualityTest(checkFn, 'multiple_files_without_deps');
        checkQualityTest(checkFn, 'simple_requirement');
        checkQualityTest(checkFn, 'requires_by_index');
        checkQualityTest(checkFn, 'requires_duplicate');
        checkQualityTest(checkFn, 'requires_in_folder');
        checkQualityTest(checkFn, 'requires_two');
        checkQualityTest(checkFn, 'dep_in_node_modules');
    });
}

describe('@quality', function() {
    checkQuality(checkWithFile, 'result body');
    checkQuality(checkConcatenations, 'results concatenation');

});

function checkWithFile(path, expected, done) {
    var readable = vinylFs.src(path);
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
                var actual = result[i].contents.toString('utf8').replace(/\r/g,'');
                
                actual.should.be.equal(expectasions[i].replace(/\r/g,''));
            }
            done();
        }));

}


function checkConcatenations(path, expected, done) {
    var readable = vinylFs.src(path);
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
        .pipe(astBodyConcat(__dirname + '/test/assets/results.js'))
        .pipe(codeGenerator())
        .pipe(vinylString.dst(function(result) {
            result.length.should.be.equal(1);
            result[0].path.should.be.equal(__dirname + '/test/assets/results.js');
            expectasions = ('\n' + expectasions.join('\n'));

            var expectedResult = fs.readFileSync(__dirname + '/../lib/body-concat.jst','utf8');
            expectedResult = expectedResult.replace('{%= modules %}', '{\n'+expectasions+'\n}\n');
            
            //expectedResult = expectedResult.replace(/\n/g,os.EOL);
            var actual = result[0].contents.toString('utf8');
            actual = actual.replace(/\r/g,'');
            expectedResult = expectedResult.replace(/\r/g,'');
            
            actual = actual.replace(/    /g,'');
            expectedResult = expectedResult.replace(/    /g,'');
            actual = actual.replace(/\t/g,'');
            expectedResult = expectedResult.replace(/\t/g,'');
            actual = actual.replace(/\n\n/g,'\n');
            expectedResult = expectedResult.replace(/\n\n/g,'\n');
            expectedResult = expectedResult.replace(/\s*\/\/.*\n/g,'\n');
            

            actual.should.be.equal(expectedResult);

            done();
        }));

}



function checkQualityTest(checkFn, test) {
    it(test, function(done) {
        var pattern = __dirname + '/assets/quality_tests/' + test + '/*_source.js';
        var expected = fs.readFileSync(__dirname + '/assets/quality_tests/' + test + '/expected.js', 'utf8');
        var exps = expected.replace(/\r/g,'').split('\n\n');
        //console.dir(exps)
        checkFn(
            pattern,
            exps,
            done
        );
    });

}
