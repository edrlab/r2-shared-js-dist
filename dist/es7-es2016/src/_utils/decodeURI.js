"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function tryDecodeURI(url) {
    if (!url) {
        return null;
    }
    try {
        return decodeURI(url);
    }
    catch (err) {
        console.log(url);
        console.log(err);
    }
    return url;
}
exports.tryDecodeURI = tryDecodeURI;
//# sourceMappingURL=decodeURI.js.map