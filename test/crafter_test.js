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
var crafter = require('../lib/crafter.js');
var addRequired = require('../lib/add-required.js');
var expected = {
    type: 'Program',
    start: 0,
    end: 11,
    body: [{
        type: 'VariableDeclaration',
        start: 0,
        end: 11,
        declarations: [{
            type: 'VariableDeclarator',
            start: 4,
            end: 10,
            id: {
                type: 'Identifier',
                start: 4,
                end: 5,
                name: 'x'
            },
            init: {
                type: 'Literal',
                start: 8,
                end: 10,
                value: 42,
                raw: '42'
            }
        }],
        kind: 'var'
    }]
};

var expected2 = {
    type: 'Program',
    start: 0,
    end: 21,
    body: [{
        type: 'VariableDeclaration',
        start: 0,
        end: 21,
        declarations: [{
            type: 'VariableDeclarator',
            start: 4,
            end: 20,
            id: {
                type: 'Identifier',
                start: 4,
                end: 5,
                name: 'x'
            },
            init: {
                type: 'CallExpression',
                start: 8,
                end: 20,
                callee: {
                    type: 'Identifier',
                    start: 8,
                    end: 15,
                    name: 'require'
                },
                arguments: [{
                    type: 'Literal',
                    start: 16,
                    end: 19,
                    value: 'x',
                    raw: '\'x\''
                }]
            }
        }],
        kind: 'var'
    }]
};

describe('crafter', function() {
    this.timeout(2000);
    it('is defined', function() {
        crafter.should.be.a('object');
    });

    it('return ast', function(done) {
        var code = 'var x = 42;';
        crafter.fromCode(code).finish()
            .pipe(crafter.toArray(function(result) {
                result = result[0].ast;
                result.should.be.deep.equal(expected);
                done();
            }));

    });

    it('visit nodes', function(done) {
        var code = 'var x = 42;';
        var ast = crafter.fromCode(code).finish();

        ast.pipe(crafter.makeVisitor(ast, function(node) {
            if (node.type === 'VariableDeclaration') {
                node.declarations[0].id.name = 'z';
            }
        }))

        .pipe(crafter.toArray(function(result) {
            result = result[0].ast;
            expected.body[0].declarations[0].id.name = 'z';
            result.should.be.deep.equal(expected);
            expected.body[0].declarations[0].id.name = 'x';
            done();
        }));

    });


    it('visitors could add files', function(done) {
        var code = 'var x = 42;';
        var ast = crafter.fromCode(code, '/test/answer.js');
        var added = false;
        ast.use(function(node) {
            if (node.type === 'VariableDeclaration' && !added) {
                this.craft.pushFromCode('var x = require(\'x\');', '/test/added.js');
                added = true;
            }
        });

        ast.visit().pipe(crafter.toArray(function(result) {
            result.length.should.be.equal(2);

            result[0].ast.should.be.deep.equal(expected);
            result[1].ast.should.be.deep.equal(expected2);

            done();
        }));

    });


    it('add required files', function(done) {
        var code = 'var x = require(\'./x\');';
        var craft = crafter.fromCode(code, __dirname + '/assets/test.js');

        craft.use(addRequired);

        craft.visit().pipe(crafter.toArray(function(result) {
            result.length.should.be.equal(2);

            result[1].ast.should.be.deep.equal(expected);

            done();
        }));

    });

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




});
