"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cbz_1 = require("./cbz");
const epub_1 = require("./epub");
async function PublicationParsePromise(filePath) {
    return epub_1.isEPUBlication(filePath) ? epub_1.EpubParsePromise(filePath) : cbz_1.CbzParsePromise(filePath);
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map