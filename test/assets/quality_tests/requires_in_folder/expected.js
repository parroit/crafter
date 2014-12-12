_define(0, function (module, exports) {
    var x = require(1);
    var y = require(2);
});

_define(1, function (module, exports) {
    var x = 42;
});

_define(2, function (module, exports) {
    var y = 43;
});