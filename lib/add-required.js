'use strict';

var resolve = require('resolve');
var path = require('path');

function addRequired(node) {
    //jshint validthis:true
    var craft = this.craft;

    if (node.type === 'CallExpression' && node.callee.name === 'require') {

        var modulePath = node.arguments[0].value;

        if (resolve.isCore(modulePath)) {
            return console.log('cannot resolve core module ', modulePath);
        
        }

        var opts = {
            basedir: path.dirname(this.file.path)
        };

        craft.remaining++;
        console.log('resolve required module ', modulePath, ' remaining ',craft.remaining);
        
        resolve(modulePath, opts, function(err, res) {
            if (err) {
                return console.error(err);
            }

            if (craft.files.indexOf(res) !== -1) {
                craft.remaining--;
                if (!craft.remaining) {
                    craft.finish();
                }
                return console.log('module already required ', res, ' remaining ',craft.remaining);    
            }
            
            console.log('load required module ', res, ' remaining ',craft.remaining);
            
            craft.pushFromFile(res, function() {
                craft.remaining--;
                if (!craft.remaining) {
                    craft.finish();
                }
                console.log('pushFromFile finish for ', res, ' remaining ',craft.remaining);
            });

        });



    }
}

module.exports =addRequired;
