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


function createBundle(output, sourceFileGlob) {
    var outputPath = path.resolve(process.cwd(), output);
    console.log('Reading source files ', sourceFileGlob);
    console.log('Writing result to ', outputPath);


    vinylFs.src(sourceFileGlob)
        .pipe(crafter.bundle(path.basename(outputPath)))
        .pipe(through2.obj(function visit(file, enc, next) {
            if (file.isNull()) {
                this.push(file); // pass along
                return next();
            }
            //console.dir(file.contents.toString('utf8'));
            console.log('Bundle created at ' + outputPath);

            console.log(Object.keys(file.builder.modules).map(function(m) {
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
    console.log('Reading source files ', sourceFileGlob);

    var coreConfig;


    vinylFs.src(sourceFileGlob)
        .pipe(crafter.core(''))
        .pipe(through(function write(file) {
            this.queue(file);
            //console.dir(file.coreConfig)
            if (!coreConfig) {
                coreConfig = file.coreConfig;
            }

        }, function end() {
            console.log('Core config: ' + JSON.stringify(coreConfig, null, 4));

            this.queue(null);
        }));



}

function runProgram(er, data) {
    if (er) {
        console.error('There was an error reading the file ' + packagePath + '\n\n' + er.stack);
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

    program.command('core [sourceFileGlob]')
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

    program.parse(process.argv);


    if (!program.args.length) {
        program.help();
    }

}

var packagePath = relativePackage(process.cwd());
readJson(packagePath, console.error, false, runProgram);
