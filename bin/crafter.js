#!/usr/bin/env node

'use strict';

var through2 = require('through2');
var path = require('path');
var through = require('through');
var program = require('commander');
var relativePackage = require('relative-package');
var readJson = require('read-package-json');
var vinylFs = require('vinyl-fs');
var winston = require('winston');
var cliff = require('cliff');

var crafter = require('../lib/crafter');
var bundle = require('./crafter-bundle');
var cfg = require('./crafter-cfg');

winston.level = 'debug';
winston.cli();



function runProgram(er, data) {
    if (er) {
        winston.error('There was an error reading the file ' + packagePath + '\n\n' + er.stack);
        return;
    }
    program.info = data;
    program.version(data.version);


    program.command('bundle [sourceFileGlob]')
        .description('Create a bundle with source files matching the glob.')
        .action(bundle);

    program.command('cfg [sourceFileGlob]')
        .description('Analyze source files and write core modules configuration to console.')
        .action(cfg);

    program.option(
        '-o, --output <filename>',
        'Write output to specified file. ' +
        'Default to current module name.'
    );

    var cores = {};

    program.option(
        '-c, --core [coreConfig]',
        'Specified configuration for a core module.',
        function(value) {

            if (typeof value !== 'string') {
                return null;
            }
            var result = {};
            var fields = value.split(':');

            cores[fields[0]] = fields.splice(1).join(':');

            return cores;
        }
    );

    program.parse(process.argv);


    if (!program.args.length) {
        program.help();
    }

}

var packagePath = relativePackage(process.cwd());
readJson(packagePath, winston.error, false, runProgram);
