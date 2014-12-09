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
var streamRewind = require('../lib/stream-rewind');




describe('@only streamRewind', function() {
    this.timeout(2000);
    it('is defined', function() {
        streamRewind.should.be.a('function');
    });

    it('return ast', function(done) {
        vinylString.src('var x = 42;')
            .pipe(streamRewind())
            
            .pipe(vinylString.dst(function(result) {
                result = result[0].contents.toString('utf8');
                result.should.be.equal('var x = 42;');
                done();
            }));
        
    });




});
