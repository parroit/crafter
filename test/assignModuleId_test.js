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
var assignId = require('../lib/assign-module-id');
var replaceRequires = require('../lib/replace-requires');

describe('@only assignModuleId', function() {
    this.timeout(2000);

    function check(readable, expected, done) {
        readable
            .pipe(modulesBuilder())
            .pipe(includeRequirements(vinylFs))
            .pipe(assignId())
            .pipe(vinylString.dst(function(result) {
                var ids = result.map(function(f) {
                    return {
                        path: path.relative(__dirname + '/..', f.path).replace(/\\/g, '/'),
                        id: f.id
                    };
                });

                ids.sort(function(a, b) {
                    return a.id - b.id;
                });

                expected.sort(function(a, b) {
                    return a.id - b.id;
                });

                ids.should.be.deep.equal(
                    expected
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
            vinylString.src(code, __dirname + '/assets/simple_requirement/index_source.js'),
            expected,
            done
        );

    }

    it('files without deps', function(done) {
        checkWithCode(
            'var x = 42;', [{
                path: 'test/assets/simple_requirement/index_source.js',
                id: 0
            }],
            done
        );
    });

    it('multiple files without deps', function(done) {
        checkWithFile(
            __dirname + '/assets/quality_tests/multiple_files_without_deps/*source.js',
            [{
                path: 'test/assets/quality_tests/multiple_files_without_deps/file1_source.js',
                id: 0
            }, {
                path: 'test/assets/quality_tests/multiple_files_without_deps/file2_source.js',
                id: 1
            }],
            done
        );
    });

    it('add required files', function(done) {
        checkWithFile(
            __dirname + '/assets/quality_tests/simple_requirement/index_source.js',
            [{
                    path: 'test/assets/quality_tests/simple_requirement/index_source.js',
                    id: 0
                }, {
                    path: 'test/assets/quality_tests/simple_requirement/x.js',
                    id: 1
                }

            ],
            done
        );
    });

    it('add required node_modules', function(done) {
        var code = 'var x = require(\'acorn\');';
        checkWithCode(code, [{
                path: 'test/assets/simple_requirement/index_source.js',
                id: 0
            }, {
                path: 'node_modules/acorn/acorn.js',
                id: 1
            }

        ], done);
    });


    it('require deep files', function(done) {
        checkWithFile(
            __dirname + '/assets/quality_tests/requires_two/index_source.js', [{
                    path: 'test/assets/quality_tests/requires_two/index_source.js',
                    id: 0
                }, {
                    path: 'test/assets/quality_tests/requires_two/x.js',
                    id: 1
                }, {
                    path: 'test/assets/quality_tests/requires_two/y.js',
                    id: 2
                }

            ],
            done
        );


    });

    it('require in subfolder', function(done) {
        checkWithFile(
            __dirname + '/assets/quality_tests/requires_in_folder/index_source.js', [{
                    path: 'test/assets/quality_tests/requires_in_folder/index_source.js',
                    id: 0
                }, {
                    path: 'test/assets/quality_tests/requires_in_folder/sub/x.js',
                    id: 1
                }, {
                    path: 'test/assets/quality_tests/requires_in_folder/y.js',
                    id: 2
                }

            ],
            done
        );

    });

    it('require by index.js', function(done) {
        checkWithFile(
            __dirname + '/assets/quality_tests/requires_by_index/index_source.js', [{
                    path: 'test/assets/quality_tests/requires_by_index/index_source.js',
                    id: 0
                }, {
                    path: 'test/assets/quality_tests/requires_by_index/y.js',
                    id: 1
                }, {
                    path: 'test/assets/quality_tests/requires_by_index/sub2/index.js',
                    id: 2
                }

            ],
            done
        );

    });

    it('dont require multiple times', function(done) {
        checkWithFile(
            __dirname + '/assets/quality_tests/requires_duplicate/index_source.js', [{
                    path: 'test/assets/quality_tests/requires_duplicate/index_source.js',
                    id: 0
                }, {
                    path: 'test/assets/quality_tests/requires_duplicate/y.js',
                    id: 1
                }

            ],
            done
        );

    });

    it('complex module', function(done) {
        checkWithFile(
            __dirname + '/../node_modules/concat-stream/index.js', [{
                path: 'node_modules/concat-stream/index.js',
                id: 0
            }, {
                path: 'node_modules/concat-stream/node_modules/readable-stream/readable.js',
                id: 1
            }, {
                path: 'node_modules/concat-stream/node_modules/inherits/inherits.js',
                id: 2
            }, {
                path: 'node_modules/concat-stream/node_modules/readable-stream/lib/_stream_readable.js',
                id: 3
            }, {
                path: 'node_modules/concat-stream/node_modules/typedarray/index.js',
                id: 4
            }, {
                path: 'node_modules/concat-stream/node_modules/readable-stream/lib/_stream_writable.js',
                id: 5
            }, {
                path: 'node_modules/concat-stream/node_modules/readable-stream/lib/_stream_duplex.js',
                id: 6
            }, {
                path: 'node_modules/concat-stream/node_modules/readable-stream/lib/_stream_transform.js',
                id: 7
            }, {
                path: 'node_modules/concat-stream/node_modules/readable-stream/lib/_stream_passthrough.js',
                id: 8
            }, {
                path: 'node_modules/concat-stream/node_modules/readable-stream/node_modules/isarray/index.js',
                id: 9
            }, {
                path: 'node_modules/concat-stream/node_modules/readable-stream/node_modules/core-util-is/lib/util.js',
                id: 10
            }, {
                path: 'node_modules/concat-stream/node_modules/readable-stream/node_modules/string_decoder/index.js',
                id: 11
            }],
            done
        );
    });



});
