"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearizeAccessModeSufficients = exports.DelinearizeAccessModeSufficients = exports.DelinearizeAccessModeSufficient = void 0;
exports.DelinearizeAccessModeSufficient = (ams) => {
    return ams.split(",").
        map((token) => token.trim()).
        filter((token) => token.length).
        reduce((pv, cv) => pv.includes(cv) ? pv : pv.concat(cv), []).
        filter((arr) => arr.length);
};
exports.DelinearizeAccessModeSufficients = (accessModeSufficients) => {
    return accessModeSufficients.map((ams) => exports.DelinearizeAccessModeSufficient(ams));
};
exports.LinearizeAccessModeSufficients = (accessModeSufficients) => {
    return accessModeSufficients.map((ams) => ams.join(","));
};
//# sourceMappingURL=ta-json-string-tokens-converter.js.map