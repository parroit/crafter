define(0, function () {
    var x = require(2);
    var y = require(1);
});

define(1, function () {
    var y = 43;
});

define(2, function () {
    var x = 42;
});