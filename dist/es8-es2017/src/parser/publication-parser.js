"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicationParsePromise = PublicationParsePromise;
const path = require("path");
const audiobook_1 = require("./audiobook");
const cbz_1 = require("./cbz");
const daisy_1 = require("./daisy");
const epub_1 = require("./epub");
const divina_1 = require("./divina");
async function PublicationParsePromise(filePath) {
    let isAudio;
    let isDivina;
    return (0, epub_1.isEPUBlication)(filePath) ? (0, epub_1.EpubParsePromise)(filePath) :
        ((0, cbz_1.isCBZPublication)(filePath) ? (0, cbz_1.CbzParsePromise)(filePath) :
            ((isDivina = await (0, divina_1.isDivinaPublication)(filePath)) ? (0, divina_1.DivinaParsePromise)(filePath, isDivina) :
                (/\.webpub$/i.test(path.extname(path.basename(filePath))) ? (0, divina_1.DivinaParsePromise)(filePath, (/^https?:\/\//.test(filePath) ? divina_1.Divinais.RemotePacked : divina_1.Divinais.LocalPacked), "webpub") :
                    (/\.lcpdf$/i.test(path.extname(path.basename(filePath))) ? (0, divina_1.DivinaParsePromise)(filePath, (/^https?:\/\//.test(filePath) ? divina_1.Divinais.RemotePacked : divina_1.Divinais.LocalPacked), "pdf") :
                        (await (0, daisy_1.isDaisyPublication)(filePath) ? (0, daisy_1.DaisyParsePromise)(filePath) :
                            (isAudio = await (0, audiobook_1.isAudioBookPublication)(filePath)) ? (0, audiobook_1.AudioBookParsePromise)(filePath, isAudio) :
                                Promise.reject(`Unrecognized publication type ${filePath}`))))));
}
//# sourceMappingURL=publication-parser.js.map