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
var fallup = require('../lib/stream-rewind');
var through2 = require('through2');


function editContent(fn) {
    return through2.obj(function fallup(file, enc, next) {
        if (!file) {
            this.push(file);
            return next();            
        }
        file.contents = new Buffer(fn(file.contents.toString(enc),file));

        this.push(file);
        return next();

    });
}

describe('@only fallup', function() {
    this.timeout(2000);
    it('is defined', function() {
        fallup.should.be.a('function');
    });

    it('repush file to stream', function(done) {
        var x = 0;
        vinylString.src('var x = 42;')
            .pipe(fallup())
            .pipe(editContent(function(c) {
                return c + (x++) + ';';
            }))
            .pipe((function() {
                return through2.obj(function fallup(file, enc, next) {
                    if (x < 5) {
                        file.fallup.write(file);
                        
                    } else {
                        file.fallup.end();
                        this.push(file);
                    }
                    
                    return next();

                });
            })())

            .pipe(vinylString.dst(function(result) {
                result.length.should.be.equal(1);
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
            .pipe(fallup())

            .pipe(editContent(function(c) {
                
                return c + (x++) + ';';
            }))
            .pipe((function() {
                return through2.obj(function fallup(file, enc, next) {
                    if (x < 5) {
                        file.fallup.write(second);
                        
                    } else {
                        file.fallup.end();
                        this.push(file);
                    }
                    return next();

                });
            })())


            .pipe(vinylString.dst(function(result) {
                result.length.should.be.equal(2);
                var result0 = result[0].contents.toString('utf8');
                var result1 = result[1].contents.toString('utf8');
                //result0.should.be.equal('var x = 42;0;');
                result0.should.be.equal('var y = 42;1;2;3;4;5;');
                result1.should.be.equal('var y = 42;1;2;3;4;5;');
                
                done();
            }));

    });

    it('repipe files to stream', function(done) {
        vinylString.src(['var x = 42;','ciao'])
            .pipe(fallup())
            .pipe(editContent(function(c) {
                return c.toUpperCase();
            }))
            .pipe((function() {
                return through2.obj(function (file, enc, next) {
                    if (file.fallup.available) {
                        vinylString.src(['var y = 42;']).pipe(
                            file.fallup,
                            {end:true}
                        );
                        file.fallup.destroy();
                    } 

                    this.push(file);
                    return next();

                });
            })())
            
            
            .pipe(vinylString.dst(function(result) {
                //console.dir(result[3].contents.toString('utf8'))
                
                var result0 = result[0].contents.toString('utf8');
                var result1 = result[1].contents.toString('utf8');
                

                result.length.should.be.equal(3);
                var result2 = result[2].contents.toString('utf8');
                
                //result0.should.be.equal('var x = 42;0;');
                result0.should.be.equal('VAR X = 42;');
                result1.should.be.equal('CIAO');
                result2.should.be.equal('VAR Y = 42;');
                
                done();
            }));

    });


});
