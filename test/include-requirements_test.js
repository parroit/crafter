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

describe('@only includeRequirements', function() {
    this.timeout(2000);

    it('is defined', function() {
        includeRequirements.should.be.a('function');
    });


    function check(readable, expected, done) {
        readable
            .pipe(modulesBuilder())
            .pipe(includeRequirements(vinylFs))
            .pipe(vinylString.dst(function(result) {
                var paths = result.map(function(f) {

                    return path.relative(__dirname + '/..', f.path).replace(/\\/g, '/');
                });
                //console.dir(paths)
                paths.sort()
                    .should.be.deep.equal(
                        expected.sort()
                    );
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

    it('files without deps', function(done) {
        checkWithCode(
            'var x = 42;', [
                'test/assets/index.js'
            ],
            done
        );
    });

    it('multiple files without deps', function(done) {
        checkWithCode(
            ['var x = 42;', 'var z = 42;'], [
                'test/assets/index.js',
                'test/assets/index.js'
            ],
            done
        );
    });

    it('add required files', function(done) {
       checkWithFile(
            __dirname + '/assets/quality_tests/simple_requirement/index_source.js', [
                'test/assets/quality_tests/simple_requirement/index_source.js',
                'test/assets/quality_tests/simple_requirement/x.js'
            ],
            done
        );
    });

    it('add required node_modules', function(done) {
        var code = 'var x = require(\'acorn\');';
        checkWithCode(code, [
            'test/assets/index.js',
            'node_modules/acorn/acorn.js'
        ], done);
    });


    it('require deep files', function(done) {
        checkWithFile(
            __dirname + '/assets/quality_tests/requires_two/index_source.js', [
                'test/assets/quality_tests/requires_two/index_source.js',
                'test/assets/quality_tests/requires_two/x.js',
                'test/assets/quality_tests/requires_two/y.js'
            ],
            done
        );


    });

    it('require in subfolder', function(done) {
        checkWithFile(
            __dirname + '/assets/quality_tests/requires_in_folder/index_source.js',
            [
                'test/assets/quality_tests/requires_in_folder/index_source.js',
                'test/assets/quality_tests/requires_in_folder/sub/x.js',
                'test/assets/quality_tests/requires_in_folder/y.js'
            ],
            done
        );

    });

    it('require by index.js', function(done) {
        checkWithFile(
            __dirname + '/assets/quality_tests/requires_by_index/index_source.js',
            [
                'test/assets/quality_tests/requires_by_index/index_source.js',
                'test/assets/quality_tests/requires_by_index/y.js',
                'test/assets/quality_tests/requires_by_index/sub2/index.js'
            ],
            done
        );

    });

    it('dont require multiple times', function(done) {
        checkWithFile(
            __dirname + '/assets/quality_tests/requires_duplicate/index_source.js',
            [
                'test/assets/quality_tests/requires_duplicate/index_source.js',
                'test/assets/quality_tests/requires_duplicate/y.js'
            ],
            done
        );

    });

    it('complex module', function(done) {
        checkWithFile(
            __dirname + '/../node_modules/concat-stream/index.js',
            [
                'node_modules/concat-stream/index.js',
                'node_modules/concat-stream/node_modules/readable-stream/readable.js',
                'node_modules/concat-stream/node_modules/inherits/inherits.js',
                'node_modules/concat-stream/node_modules/typedarray/index.js',
                'node_modules/concat-stream/node_modules/readable-stream/lib/_stream_readable.js',
                'node_modules/concat-stream/node_modules/readable-stream/lib/_stream_writable.js',
                'node_modules/concat-stream/node_modules/readable-stream/lib/_stream_duplex.js',
                'node_modules/concat-stream/node_modules/readable-stream/lib/_stream_transform.js',
                'node_modules/concat-stream/node_modules/readable-stream/lib/_stream_passthrough.js',
                'node_modules/concat-stream/node_modules/readable-stream/node_modules/isarray/index.js',
                'node_modules/concat-stream/node_modules/readable-stream/node_modules/core-util-is/lib/util.js',
                'node_modules/concat-stream/node_modules/readable-stream/node_modules/string_decoder/index.js'
            ],
            done
        );
    });
            


});
