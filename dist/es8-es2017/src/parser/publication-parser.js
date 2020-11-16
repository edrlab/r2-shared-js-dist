"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicationParsePromise = void 0;
const path = require("path");
const audiobook_1 = require("./audiobook");
const cbz_1 = require("./cbz");
const daisy_1 = require("./daisy");
const epub_1 = require("./epub");
const divina_1 = require("./divina");
async function PublicationParsePromise(filePath) {
    let isAudio;
    return epub_1.isEPUBlication(filePath) ? epub_1.EpubParsePromise(filePath) :
        (cbz_1.isCBZPublication(filePath) ? cbz_1.CbzParsePromise(filePath) :
            (await divina_1.isDivinaPublication(filePath) ? divina_1.DivinaParsePromise(filePath) :
                (/\.webpub$/.test(path.extname(path.basename(filePath)).toLowerCase()) ? divina_1.DivinaParsePromise(filePath) :
                    (await daisy_1.isDaisyPublication(filePath) ? daisy_1.DaisyParsePromise(filePath) :
                        (isAudio = await audiobook_1.isAudioBookPublication(filePath)) ? audiobook_1.AudioBookParsePromise(filePath, isAudio) :
                            Promise.reject(`Unrecognized publication type ${filePath}`)))));
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map