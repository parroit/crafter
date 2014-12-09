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
var through2 = require('through2');


function editContent(fn) {
    return through2.obj(function streamRewind(file, enc, next) {
        if (!file) {
            this.push(file);
            return next();            
        }
        file.contents = new Buffer(fn(file.contents.toString(enc),file));

        this.push(file);
        return next();

    });
}

describe('@only streamRewind', function() {
    this.timeout(2000);
    it('is defined', function() {
        streamRewind.should.be.a('function');
    });

    it('repush file to stream', function(done) {
        var x = 0;
        vinylString.src('var x = 42;')
            .pipe(streamRewind())
            .pipe(editContent(function(c) {
                return c + (x++) + ';';
            }))
            .pipe((function() {
                return through2.obj(function streamRewind(file, enc, next) {
                    if (x < 5) {
                        file.rewind();
                        return next();
                    }
                    
                    //file.rewind.passed();

                    this.push(file);
                    return next();

                });
            })())

            .pipe( streamRewind.passed() )

            .pipe(vinylString.dst(function(result) {
                result = result[0].contents.toString('utf8');
                result.should.be.equal('var x = 42;0;1;2;3;4;');
                done();
            }));

    });

    it('repush specific file to stream', function(done) {
        var x = 0;
        var second;
        vinylString.src(['var x = 42;','var y = 42;'])
            .pipe(editContent(function(c,file) {
                if (!second && c.indexOf('y') !== -1) {
                    second = file;
                }
                return c;
            }))
            .pipe(streamRewind())

            .pipe(editContent(function(c) {
                
                return c + (x++) + ';';
            }))
            .pipe((function() {
                return through2.obj(function streamRewind(file, enc, next) {
                    if (x < 5) {
                        file.rewind(second);
                        return next();
                    } 

                    
                    this.push(file);
                    return next();

                });
            })())

            .pipe( streamRewind.passed() )

            .pipe(vinylString.dst(function(result) {
                var result0 = result[0].contents.toString('utf8');
                var result1 = result[1].contents.toString('utf8');
                //result0.should.be.equal('var x = 42;0;');
                result0.should.be.equal('var y = 42;1;2;3;4;');
                result1.should.be.equal('var y = 42;1;2;3;4;');
                
                done();
            }));

    });

    it('repipe files to stream', function(done) {
        var pushed = false;
        vinylString.src(['var x = 42;','ciao'])
            .pipe(streamRewind())
            .pipe(editContent(function(c) {
                return c.toUpperCase();
            }))
            .pipe((function() {
                return through2.obj(function (file, enc, next) {
                    if (!pushed) {
                        pushed = true;
                        file.rewind.repipe(vinylString.src(['var y = 42;']));
                    } 

                    this.push(file);
                    return next();

                });
            })())
             .pipe( streamRewind.passed() )
            .pipe(vinylString.dst(function(result) {
                //console.dir(result)
                var result0 = result[0].contents.toString('utf8');
                var result1 = result[1].contents.toString('utf8');
                var result2 = result[2].contents.toString('utf8');
                //result0.should.be.equal('var x = 42;0;');
                result0.should.be.equal('VAR X = 42;');
                result1.should.be.equal('CIAO');
                result2.should.be.equal('VAR Y = 42;');
                
                done();
            }));

    });


});
