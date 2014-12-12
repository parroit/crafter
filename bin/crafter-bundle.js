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

function sharedStart(array){
    var A= array.slice(0).sort(), 
    word1= A[0], word2= A[A.length-1], 
    L= word1.length, i= 0;
    while(i<L && word1.charAt(i)=== word2.charAt(i)) i++;
    return word1.substring(0, i);
}

function stringRepeat(source, count){
    var result = '';
    while(count--) {
        result += source;
    }
    return result;
}

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
            var modulesPath = Object.keys(modules);
            modulesPath.sort();

            winston.info('Bundle created at ' + outputPath);
            winston.info('%d files included in bundle.', modulesPath.length);
            var lastPath = '';
            winston.debug('\n' +modulesPath.map(function(m) {
                var relPath = path.relative(file.base, m);
                relPath = relPath.replace(/[\\/]?node_modules[\\/]/g, '->');

                var commonParts = sharedStart([relPath, lastPath]);
                var commonFolder = relPath.slice(0, commonParts.length).lastIndexOf('/');
                if (commonFolder < 0) {
                    commonFolder = 0;
                }
                var newPart = stringRepeat(' ',commonFolder)+relPath.slice(commonFolder);

                lastPath = relPath;
                return '\t' + newPart;
            }).join('\n'));

            this.push(file); // pass along
            return next();
        }))
        .pipe(vinylFs.dest(path.dirname(outputPath)));



}
