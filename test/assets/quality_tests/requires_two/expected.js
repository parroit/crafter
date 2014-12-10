define(0, function (module, exports) {
    var x = require(1);
    var y = require(2);
});

define(1, function (module, exports) {
    var x = 42;
});

define(2, function (module, exports) {
    var y = 43;
});