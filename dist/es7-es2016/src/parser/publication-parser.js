"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicationParsePromise = void 0;
const tslib_1 = require("tslib");
const audiobook_1 = require("./audiobook");
const cbz_1 = require("./cbz");
const epub_1 = require("./epub");
const divina_1 = require("./divina");
function PublicationParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let isAudio;
        return epub_1.isEPUBlication(filePath) ? epub_1.EpubParsePromise(filePath) :
            (cbz_1.isCBZPublication(filePath) ? cbz_1.CbzParsePromise(filePath) :
                (divina_1.isDivinaPublication(filePath) ? divina_1.DivinaParsePromise(filePath) :
                    (isAudio = yield audiobook_1.isAudioBookPublication(filePath)) ? audiobook_1.AudioBookParsePromise(filePath, isAudio) :
                        Promise.reject(`Unrecognized publication type ${filePath}`)));
    });
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map