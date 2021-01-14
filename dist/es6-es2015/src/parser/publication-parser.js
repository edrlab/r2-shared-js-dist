"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicationParsePromise = void 0;
const tslib_1 = require("tslib");
const path = require("path");
const audiobook_1 = require("./audiobook");
const cbz_1 = require("./cbz");
const daisy_1 = require("./daisy");
const epub_1 = require("./epub");
const divina_1 = require("./divina");
function PublicationParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let isAudio;
        let isDivina;
        return epub_1.isEPUBlication(filePath) ? epub_1.EpubParsePromise(filePath) :
            (cbz_1.isCBZPublication(filePath) ? cbz_1.CbzParsePromise(filePath) :
                ((isDivina = yield divina_1.isDivinaPublication(filePath)) ? divina_1.DivinaParsePromise(filePath, isDivina) :
                    (/\.webpub$/.test(path.extname(path.basename(filePath)).toLowerCase()) ? divina_1.DivinaParsePromise(filePath, (/^http[s]?:\/\//.test(filePath) ? divina_1.Divinais.RemotePacked : divina_1.Divinais.LocalPacked), "webpub") :
                        (/\.lcpdf$/.test(path.extname(path.basename(filePath)).toLowerCase()) ? divina_1.DivinaParsePromise(filePath, (/^http[s]?:\/\//.test(filePath) ? divina_1.Divinais.RemotePacked : divina_1.Divinais.LocalPacked), "pdf") :
                            ((yield daisy_1.isDaisyPublication(filePath)) ? daisy_1.DaisyParsePromise(filePath) :
                                (isAudio = yield audiobook_1.isAudioBookPublication(filePath)) ? audiobook_1.AudioBookParsePromise(filePath, isAudio) :
                                    Promise.reject(`Unrecognized publication type ${filePath}`))))));
    });
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map