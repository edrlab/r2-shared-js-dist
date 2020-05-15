"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearizeAccessModeSufficients = exports.DelinearizeAccessModeSufficients = exports.DelinearizeAccessModeSufficient = void 0;
exports.DelinearizeAccessModeSufficient = function (ams) {
    return ams.split(",").
        map(function (token) { return token.trim(); }).
        filter(function (token) { return token.length; }).
        reduce(function (pv, cv) { return pv.includes(cv) ? pv : pv.concat(cv); }, []).
        filter(function (arr) { return arr.length; });
};
exports.DelinearizeAccessModeSufficients = function (accessModeSufficients) {
    return accessModeSufficients.map(function (ams) { return exports.DelinearizeAccessModeSufficient(ams); });
};
exports.LinearizeAccessModeSufficients = function (accessModeSufficients) {
    return accessModeSufficients.map(function (ams) { return ams.join(","); });
};
//# sourceMappingURL=ta-json-string-tokens-converter.js.map