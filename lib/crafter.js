/*
 * crafter
 * https://github.com/parroit/crafter
 *
 * Copyright (c) 2014 Andrea Parodi
 * Licensed under the MIT license.
 */

'use strict';

var through2 = require('through2');
var crafter = module.exports = {};

var Reader = require('./file-reader');
var concat = require('concat-stream');
var walk = require('walk-ast');

crafter.fromCode = function fromCode(code, path) {

    return new Reader().pushFromCode(code, path);
};

crafter.from = function from(path) {

    return new Reader().pushFromFile(path);
};

crafter.toArray = function toArray(cb) {

    var arrayFier = through2.obj(function arrayFier(file, enc, next) {
        this.push([file]);
        next();
    });

    return arrayFier.pipe(concat(cb));
};


crafter.makeVisitor = Reader.makeVisitor;
