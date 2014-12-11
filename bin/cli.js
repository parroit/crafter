#!/usr/bin/env node

'use strict';

var program = require('commander');

program
    .version('0.0.1')
    .option('-s, --source <files>', 'Use source files mathing the files glob.')
    .option('-o, --output <filename>', 'Write output to specified file.')
    .parse(process.argv);

if(!program.args.length) {
    program.help();
} else {
    console.log('Keywords: ' + program.args);   
}