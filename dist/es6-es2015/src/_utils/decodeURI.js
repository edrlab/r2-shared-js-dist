"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryDecodeURI = tryDecodeURI;
function tryDecodeURI(url) {
    if (!url) {
        return null;
    }
    try {
        return decodeURIComponent(url);
    }
    catch (err) {
        console.log(url);
        console.log(err);
    }
    return url;
}
//# sourceMappingURL=decodeURI.js.map