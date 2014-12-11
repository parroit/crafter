#!/usr/bin/env node

'use strict';

var program = require('commander');
var path = require('path');
var relativePackage = require('relative-package');
var readJson = require('read-package-json');
var vinylFs = require('vinyl-fs');
var crafter = require('../lib/crafter');
program.version('0.0.1');

program.command('bundle [sourceFileGlob]')
    .description('Create a bundle with source files matching the glob.')
    .action(function(sourceFile) {
        if (program.output && sourceFile) {
            createBundle(program.output, sourceFile);
        } else {
            var packagePath = relativePackage(process.cwd());
            readJson(packagePath, console.error, false, function(er, data) {
                if (er) {
                    console.error('There was an error reading the file ' + packagePath + '\n\n' + er.stack);
                    return;
                }

                //console.dir(program.args);
                var output = program.output || data.name + '-' +
                    data.version.replace(/\./g, '_') + '.js';

                var source = sourceFile || data.main;
                createBundle(output, source);
                //console.log('content of package.json data is ', data);

            });

        }

        function createBundle(output, sourceFileGlob) {
            var outputPath = path.resolve(process.cwd(), output);
            console.log('Reading source files ', sourceFileGlob);
            console.log('Writing result to ', outputPath);


            vinylFs.src(sourceFileGlob)
                .pipe(crafter.bundle(path.basename(outputPath)))
                .pipe(vinylFs.dest(path.dirname(outputPath)));



        }


    });

program.option(
    '-o, --output <filename>',
    'Write output to specified file. ' +
    'Default to current module name.'
);

program.parse(process.argv);


if (!program.args.length) {
    program.help();
} else {



}
