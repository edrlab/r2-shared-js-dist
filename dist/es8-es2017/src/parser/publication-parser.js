"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const audiobook_1 = require("./audiobook");
const cbz_1 = require("./cbz");
const epub_1 = require("./epub");
async function PublicationParsePromise(filePath) {
    let isAudio;
    return epub_1.isEPUBlication(filePath) ? epub_1.EpubParsePromise(filePath) :
        (cbz_1.isCBZPublication(filePath) ? cbz_1.CbzParsePromise(filePath) :
            (isAudio = await audiobook_1.isAudioBookPublication(filePath)) ? audiobook_1.AudioBookParsePromise(filePath, isAudio) :
                Promise.reject(`Unrecognized publication type ${filePath}`));
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map