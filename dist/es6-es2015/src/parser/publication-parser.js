"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = require("fs");
const path = require("path");
const cbz_1 = require("./cbz");
const epub_1 = require("./epub");
function PublicationParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const fileName = path.basename(filePath);
        const ext = path.extname(fileName).toLowerCase();
        const isEPUB = /\.epub[3]?$/.test(ext) || fs.existsSync(path.join(filePath, "META-INF", "container.xml"));
        return isEPUB ?
            epub_1.EpubParsePromise(filePath) :
            cbz_1.CbzParsePromise(filePath);
    });
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map