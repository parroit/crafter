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
var vinylString = require('../lib/vinylString');
var astParser = require('../lib/ast-parser');

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


describe('@only ast-parser', function() {
    this.timeout(2000);
    it('is defined', function() {
        astParser.should.be.a('function');
    });

    it('return ast', function(done) {
        vinylString.src('var x = 42;')
            .pipe(astParser({loc:false}))
            .pipe(vinylString.dst(function(result) {
                result = result[0].ast;
                result.should.be.deep.equal(expected);
                done();
            }));
        
    });




});
