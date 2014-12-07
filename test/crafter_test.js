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

var crafter = require('../lib/crafter.js');

describe('crafter', function(){
    it('is defined', function(){
      crafter.should.be.a('function');
    });

});
