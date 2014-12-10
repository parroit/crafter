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
        vinylString.src(code, __dirname + '/assets/index.js')
            .pipe(astParser())
            .pipe(astVisitor(requireFinder))
            .pipe(vinylString.dst(function(result) {
                console.dir(result[0].requires)
                result[0].requires.should.be.deep.equal(expected);
                done();
            }));

    }

    it('add required files', function(done) {
        var code = 'var x = require(\'./x\');';
        checkWithCode(code, {
            core: {},
            relatives: {'./x': 'test/assets/x.js'},
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
    
/*
    it('require deep files', function(done) {
        var code = 'var x = require(\'./x\');';
        var craft = crafter.from(__dirname + '/assets/requires_two.js');

        craft.use(addRequired);

        craft.visit().pipe(crafter.toArray(function(result) {
            var files = result.map(function(r) {
                var res = path.relative(__dirname,r.path);
                return res;
            });
            files.should.be.deep.equal([
                'assets/requires_two.js',
                'assets/x.js',
                'assets/y.js'
            ]);


            done();
        }));

    });

    it('require in subfolder', function(done) {
        var craft = crafter.from(__dirname + '/assets/requires_in_folder.js');

        craft.use(addRequired);

        craft.visit().pipe(crafter.toArray(function(result) {
            var files = result.map(function(r) {
                var res = path.relative(__dirname,r.path);
                return res;
            });
            files.should.be.deep.equal([
                'assets/requires_in_folder.js',
                'assets/sub/x.js',
                'assets/y.js'
            ]);


            done();
        }));

    });

    it('require by index.js', function(done) {
        var craft = crafter.from(__dirname + '/assets/requires_by_index.js');

        craft.use(addRequired);

        craft.visit().pipe(crafter.toArray(function(result) {
            var files = result.map(function(r) {
                var res = path.relative(__dirname,r.path);
                return res;
            });
            files.should.be.deep.equal([
                'assets/requires_by_index.js',
                'assets/y.js',
                'assets/sub2/index.js'
            ]);


            done();
        }));

    });


    it('dont require multiple times', function(done) {
        var craft = crafter.from(__dirname + '/assets/requires_duplicate.js');

        craft.use(addRequired);

        craft.visit().pipe(crafter.toArray(function(result) {
            var files = result.map(function(r) {
                var res = path.relative(__dirname,r.path);
                return res;
            });
            files.should.be.deep.equal([
                'assets/requires_duplicate.js',
                'assets/y.js'
            ]);


            done();
        }));

    });

    it('complex module', function(done) {
        var craft = crafter.from(__dirname + '/../node_modules/concat-stream/index.js');

        craft.use(addRequired);

        craft.visit().pipe(crafter.toArray(function(result) {
            var files = result.map(function(r) {
                var res = path.relative(__dirname,r.path);
                return res;
            });
            files.sort().should.be.deep.equal([
                '../node_modules/concat-stream/index.js',
                '../node_modules/concat-stream/node_modules/readable-stream/readable.js',
                '../node_modules/concat-stream/node_modules/inherits/inherits.js',
                '../node_modules/concat-stream/node_modules/typedarray/index.js',
                '../node_modules/concat-stream/node_modules/readable-stream/lib/_stream_readable.js',
                '../node_modules/concat-stream/node_modules/readable-stream/lib/_stream_writable.js',
                '../node_modules/concat-stream/node_modules/readable-stream/lib/_stream_duplex.js',
                '../node_modules/concat-stream/node_modules/readable-stream/lib/_stream_transform.js',
                '../node_modules/concat-stream/node_modules/readable-stream/lib/_stream_passthrough.js',
                '../node_modules/concat-stream/node_modules/readable-stream/node_modules/isarray/index.js',
                '../node_modules/concat-stream/node_modules/readable-stream/node_modules/core-util-is/lib/util.js',
                '../node_modules/concat-stream/node_modules/readable-stream/node_modules/string_decoder/index.js'
            ].sort());


            done();
        }));

    });

*/


});
