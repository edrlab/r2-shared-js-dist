"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicationParsePromise = void 0;
var tslib_1 = require("tslib");
var path = require("path");
var audiobook_1 = require("./audiobook");
var cbz_1 = require("./cbz");
var daisy_1 = require("./daisy");
var epub_1 = require("./epub");
var divina_1 = require("./divina");
function PublicationParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var isAudio, _a, _b, _c, _d, _e;
        return tslib_1.__generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!epub_1.isEPUBlication(filePath)) return [3, 1];
                    _a = epub_1.EpubParsePromise(filePath);
                    return [3, 13];
                case 1:
                    if (!cbz_1.isCBZPublication(filePath)) return [3, 2];
                    _b = cbz_1.CbzParsePromise(filePath);
                    return [3, 12];
                case 2: return [4, divina_1.isDivinaPublication(filePath)];
                case 3:
                    if (!(_f.sent())) return [3, 4];
                    _c = divina_1.DivinaParsePromise(filePath);
                    return [3, 11];
                case 4:
                    if (!/\.webpub$/.test(path.extname(path.basename(filePath)).toLowerCase())) return [3, 5];
                    _d = divina_1.DivinaParsePromise(filePath);
                    return [3, 10];
                case 5: return [4, daisy_1.isDaisyPublication(filePath)];
                case 6:
                    if (!(_f.sent())) return [3, 7];
                    _e = daisy_1.DaisyParsePromise(filePath);
                    return [3, 9];
                case 7: return [4, audiobook_1.isAudioBookPublication(filePath)];
                case 8:
                    _e = (isAudio = _f.sent()) ? audiobook_1.AudioBookParsePromise(filePath, isAudio) :
                        Promise.reject("Unrecognized publication type " + filePath);
                    _f.label = 9;
                case 9:
                    _d = (_e);
                    _f.label = 10;
                case 10:
                    _c = (_d);
                    _f.label = 11;
                case 11:
                    _b = (_c);
                    _f.label = 12;
                case 12:
                    _a = (_b);
                    _f.label = 13;
                case 13: return [2, _a];
            }
        });
    });
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map