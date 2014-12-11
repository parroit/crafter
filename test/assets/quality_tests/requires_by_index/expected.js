_define(0, function (module, exports) {
    var x = require(2);
    var y = require(1);
});

_define(1, function (module, exports) {
    var y = 43;
});

_define(2, function (module, exports) {
    var x = 42;
});