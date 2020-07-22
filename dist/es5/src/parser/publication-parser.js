"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicationParsePromise = void 0;
var tslib_1 = require("tslib");
var audiobook_1 = require("./audiobook");
var cbz_1 = require("./cbz");
var epub_1 = require("./epub");
var divina_1 = require("./divina");
function PublicationParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var isAudio, _a, _b, _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!epub_1.isEPUBlication(filePath)) return [3, 1];
                    _a = epub_1.EpubParsePromise(filePath);
                    return [3, 7];
                case 1:
                    if (!cbz_1.isCBZPublication(filePath)) return [3, 2];
                    _b = cbz_1.CbzParsePromise(filePath);
                    return [3, 6];
                case 2:
                    if (!divina_1.isDivinaPublication(filePath)) return [3, 3];
                    _c = divina_1.DivinaParsePromise(filePath);
                    return [3, 5];
                case 3: return [4, audiobook_1.isAudioBookPublication(filePath)];
                case 4:
                    _c = (isAudio = _d.sent()) ? audiobook_1.AudioBookParsePromise(filePath, isAudio) :
                        Promise.reject("Unrecognized publication type " + filePath);
                    _d.label = 5;
                case 5:
                    _b = (_c);
                    _d.label = 6;
                case 6:
                    _a = (_b);
                    _d.label = 7;
                case 7: return [2, _a];
            }
        });
    });
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map