'use strict';

var program = require('commander');
var vinylFs = require('vinyl-fs');
var crafter = require('../lib/crafter');
var winston = require('winston');
var through2 = require('through2');
var path = require('path');

module.exports = function(sourceFile) {
	var output = program.output || program.info.name + '-' +
	    program.info.version.replace(/\./g, '_') + '.js';

	var source = sourceFile || program.info.main;
	createBundle(output, source);
};

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
