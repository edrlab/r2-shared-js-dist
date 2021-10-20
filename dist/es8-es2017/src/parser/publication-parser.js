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
    let isDivina;
    return (0, epub_1.isEPUBlication)(filePath) ? (0, epub_1.EpubParsePromise)(filePath) :
        ((0, cbz_1.isCBZPublication)(filePath) ? (0, cbz_1.CbzParsePromise)(filePath) :
            ((isDivina = await (0, divina_1.isDivinaPublication)(filePath)) ? (0, divina_1.DivinaParsePromise)(filePath, isDivina) :
                (/\.webpub$/.test(path.extname(path.basename(filePath)).toLowerCase()) ? (0, divina_1.DivinaParsePromise)(filePath, (/^http[s]?:\/\//.test(filePath) ? divina_1.Divinais.RemotePacked : divina_1.Divinais.LocalPacked), "webpub") :
                    (/\.lcpdf$/.test(path.extname(path.basename(filePath)).toLowerCase()) ? (0, divina_1.DivinaParsePromise)(filePath, (/^http[s]?:\/\//.test(filePath) ? divina_1.Divinais.RemotePacked : divina_1.Divinais.LocalPacked), "pdf") :
                        (await (0, daisy_1.isDaisyPublication)(filePath) ? (0, daisy_1.DaisyParsePromise)(filePath) :
                            (isAudio = await (0, audiobook_1.isAudioBookPublication)(filePath)) ? (0, audiobook_1.AudioBookParsePromise)(filePath, isAudio) :
                                Promise.reject(`Unrecognized publication type ${filePath}`))))));
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map