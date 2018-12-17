"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var cbz_1 = require("./cbz");
var epub_1 = require("./epub");
function PublicationParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2, epub_1.isEPUBlication(filePath) ? epub_1.EpubParsePromise(filePath) : cbz_1.CbzParsePromise(filePath)];
        });
    });
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map