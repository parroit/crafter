'use strict';

var path = require('path');
var through = require('through');

var program = require('commander');
var vinylFs = require('vinyl-fs');
var crafter = require('../lib/crafter');
var winston = require('winston');
var cliff = require('cliff');

module.exports = function(sourceFile) {

    var source = sourceFile || program.info.main;
    writeCoreConfig(source);

};

function writeCoreConfig(sourceFileGlob) {
    winston.info('Reading source files ', sourceFileGlob);

    var coreConfig;

    var core = program.core || {};

    vinylFs.src(sourceFileGlob)
        .pipe(crafter.core({
            core: core
        }))
        .pipe(through(function write(file) {
            this.queue(file);

            if (!coreConfig) {
                coreConfig = file.coreConfig;
            }

        }, function end() {
            winston.info('Core config:');
            winston.info(cliff.inspect(coreConfig));

            this.queue(null);
        }));



}
