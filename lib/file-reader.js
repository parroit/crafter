var Readable = require('stream').Readable;
var Queue = require('fastqueue');
var acorn = require('acorn');
var File = require('vinyl');
var fs = require('fs');
var through2 = require('through2');
var walk = require('walk-ast');


function FileReadStream() {
    Readable.call(this, {
        objectMode: true
    });
    this.visitors = [];
    this._queue = new Queue();
    this._waiting = true;
    this.files = [];

}

FileReadStream.prototype = Object.create(Readable.prototype, {
    constructor: {
        value: FileReadStream
    }
});

FileReadStream.prototype._read = function(size) {
    this._waiting = false;

    while (this._queue.length && !this._waiting) {
        var f = this._queue.shift();
        if (f)
            console.log('_read', f.path);
        else
            console.log('_read', null);

        this._waiting = !this.push(f);
    }

};

FileReadStream.prototype.finish = function finish() {
    if (this._waiting) {

        this._queue.push(null);
    } else {
        this._waiting = !this.push(null);
    }
    return this;
};

FileReadStream.prototype.pushFile = function pushFile(file) {

    
    console.log('pushing ', file.path, this._waiting);
    file.ast = acorn.parse(file.contents.toString('utf8'));
    if (this._waiting) {
        this._queue.push(file);
    } else {
        this._waiting = !this.push(file);
    }
    return this;
};

FileReadStream.prototype.pushFromCode = function pushFromCode(code, path) {
    this.files.push(path);
    return this.pushFile(new File({
        path: path,
        contents: new Buffer(code)
    }));
};

FileReadStream.prototype.pushFromFile = function pushFromFile(path, cb) {
    var _this = this;
    this.files.push(path);
    fs.readFile(path, function(err, content) {
        if (err) {
            var index = _this.files.indexOf(path);
            if (index > -1) {
                _this.files.splice(index, 1);
            }
            return console.log(err);
        }

        _this.pushFile(new File({
            path: path,
            contents: content
        }));

        if (cb) cb();
    });

    return this;


};

FileReadStream.prototype.use = function(visitor) {
    this.visitors.push(visitor);
};

FileReadStream.prototype.visit = function() {

    var craft = this;
    var currentStream = craft;
    craft.remaining = 0;

    currentStream = currentStream.pipe(through2.obj(function(file, enc, next) {
        craft.remaining++;
        console.log('start visiting file ', file.path, ', lefts: ', craft.remaining);

        this.push(file);
        next();

    }));

    this.visitors.forEach(function(visitor) {
        currentStream = currentStream.pipe(makeVisitor(craft, visitor));
    });

    currentStream = currentStream.pipe(through2.obj(function(file, enc, next) {
        craft.remaining--;
        console.log('finished visiting file ', file.path, ', lefts: ', craft.remaining);
        this.push(file);
        next();

        if (!craft.remaining) {
            console.log('finish');
            craft.finish();
            this.push(null);
        }


    }));


    return currentStream;
};

function makeVisitor(craft, visitor) {
    return through2.obj(function visit(file, enc, next) {
        walk(file.ast, visitor.bind({
            craft: craft,
            file: file
        }));
        this.push(file);
        next();
    });
}
FileReadStream.makeVisitor = makeVisitor;
module.exports = FileReadStream;
