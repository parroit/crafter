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
var astVisitor = require('../lib/ast-visitor');
var astParser = require('../lib/ast-parser');
var codeGenerator = require('../lib/code-generator');


describe('@only astVisitor', function() {
    this.timeout(2000);
    it('is defined', function() {
        astVisitor.should.be.a('function');
    });

    it('run visitors on each node', function(done) {
        var x = 0;
        vinylString.src('var x = 42;')
            .pipe(astParser())
            .pipe(astVisitor(function (node) {
                if (node.type === 'VariableDeclaration') {
                    node.declarations[0].id.name = 'z';

                }
            }))
            .pipe(codeGenerator())
            .pipe(vinylString.dst(function(result) {
                result = result[0].contents.toString('utf8');
                result.should.be.equal('var z = 42;');
                done();
            }));

    });



});
