"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs");
var path = require("path");
var cbz_1 = require("./cbz");
var epub_1 = require("./epub");
function PublicationParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var fileName, ext, isEPUB;
        return tslib_1.__generator(this, function (_a) {
            fileName = path.basename(filePath);
            ext = path.extname(fileName).toLowerCase();
            isEPUB = /\.epub[3]?$/.test(ext) || fs.existsSync(path.join(filePath, "META-INF", "container.xml"));
            return [2, isEPUB ?
                    epub_1.EpubParsePromise(filePath) :
                    cbz_1.CbzParsePromise(filePath)];
        });
    });
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map