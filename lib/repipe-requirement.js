'use strict';
module.exports = repipeRequirement;
var through2 = require('through2');
var winston = require('winston');

function repipeRequirement(adapter) {
    var builder;
    return through2.obj(function loadRequired(file, enc, next) {
        if (!file.requires) {
            this.push(file);
            return next();
        }

        if (!builder) {
            builder = file.builder;
        }

        if (!file.builder) {
            file.builder = builder;
        }

        var relatives = Object.keys(file.requires.relatives).map(function(filePath) {
            return file.requires.relatives[filePath];
        });

        var dependencies = Object.keys(file.requires.dependencies).map(function(filePath) {
            return file.requires.dependencies[filePath];
        });

        var allDeps = relatives.concat(dependencies)
            .filter(function(filePath) {
                return Object.keys(builder.modules).indexOf(filePath) === -1;
            });

        builder.resolved[file.path.replace(/\\/g, '/')] = true;

        if (allDeps.length) {
            allDeps.forEach(function(dep) {
                builder.modules[dep.replace(/\\/g, '/')] = true;
            });
            winston.verbose('repipe %j',allDeps);
            adapter.src(allDeps, {
                base: file.base
            }).pipe(
                file.fallup, {
                    end: false
                }
            );

        } else {

            if (!builder.needResolve()) {
                file.fallup.end();
            }
        }

        this.push(file);
        return next();


    });
}