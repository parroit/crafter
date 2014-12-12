#!/usr/bin/env node

'use strict';

var through2 = require('through2');
var through = require('through');

var program = require('commander');
var path = require('path');
var relativePackage = require('relative-package');
var readJson = require('read-package-json');
var vinylFs = require('vinyl-fs');
var crafter = require('../lib/crafter');
var winston = require('winston');

winston.level = 'debug';
winston.cli();

function createBundle(output, sourceFileGlob) {
    var outputPath = path.resolve(process.cwd(), output);
    winston.info('Reading source files ', sourceFileGlob);
    winston.info('Writing result to ', outputPath);

    var core = program.core || {};

    vinylFs.src(sourceFileGlob)
        .pipe(crafter.bundle({
            target: outputPath,
            core: core

        }))
        .pipe(through2.obj(function visit(file, enc, next) {
            if (file.isNull()) {
                this.push(file); // pass along
                return next();
            }
            var modules = file.builder.modules;
            winston.info('Bundle created at ' + outputPath);
            winston.info('%d files included in bundle.', Object.keys(modules).length);
            winston.debug(Object.keys(modules).map(function(m) {
                var relPath = path.relative(file.base, m);
                relPath = relPath.replace(/\\?node_modules\\/g, '->');

                return '\t - ' + relPath;
            }).join('\n'));

            this.push(file); // pass along
            return next();
        }))
        .pipe(vinylFs.dest(path.dirname(outputPath)));



}

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
            winston.info('Core config: \n' + JSON.stringify(coreConfig));

            this.queue(null);
        }));



}

function runProgram(er, data) {
    if (er) {
        winston.error('There was an error reading the file ' + packagePath + '\n\n' + er.stack);
        return;
    }

    program.version(data.version);

    program.command('bundle [sourceFileGlob]')
        .description('Create a bundle with source files matching the glob.')
        .action(function(sourceFile) {
            var output = program.output || data.name + '-' +
                data.version.replace(/\./g, '_') + '.js';

            var source = sourceFile || data.main;
            createBundle(output, source);

        });

    program.command('corecfg [sourceFileGlob]')
        .description('Analyze source files and write core modules configuration to console.')
        .action(function(sourceFile) {

            var source = sourceFile || data.main;
            writeCoreConfig(source);

        });

    program.option(
        '-o, --output <filename>',
        'Write output to specified file. ' +
        'Default to current module name.'
    );

    var cores = {};

    program.option(
        '-c, --core [coreConfig]',
        'Specified configuration for a core module.',
        function(value){
            
            if (typeof value !== 'string') {
                return null;
            }
            var result = {};
            var fields = value.split(':');

            cores[ fields[0] ] = fields.splice(1).join(':');
            
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
