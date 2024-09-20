"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicationParsePromise = PublicationParsePromise;
var tslib_1 = require("tslib");
var path = require("path");
var audiobook_1 = require("./audiobook");
var cbz_1 = require("./cbz");
var daisy_1 = require("./daisy");
var epub_1 = require("./epub");
var divina_1 = require("./divina");
function PublicationParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var isAudio, isDivina, _a, _b, _c, _d, _e, _f;
        return tslib_1.__generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!(0, epub_1.isEPUBlication)(filePath)) return [3, 1];
                    _a = (0, epub_1.EpubParsePromise)(filePath);
                    return [3, 15];
                case 1:
                    if (!(0, cbz_1.isCBZPublication)(filePath)) return [3, 2];
                    _b = (0, cbz_1.CbzParsePromise)(filePath);
                    return [3, 14];
                case 2: return [4, (0, divina_1.isDivinaPublication)(filePath)];
                case 3:
                    if (!(isDivina = _g.sent())) return [3, 4];
                    _c = (0, divina_1.DivinaParsePromise)(filePath, isDivina);
                    return [3, 13];
                case 4:
                    if (!/\.webpub$/i.test(path.extname(path.basename(filePath)))) return [3, 5];
                    _d = (0, divina_1.DivinaParsePromise)(filePath, (/^https?:\/\//.test(filePath) ? divina_1.Divinais.RemotePacked : divina_1.Divinais.LocalPacked), "webpub");
                    return [3, 12];
                case 5:
                    if (!/\.lcpdf$/i.test(path.extname(path.basename(filePath)))) return [3, 6];
                    _e = (0, divina_1.DivinaParsePromise)(filePath, (/^https?:\/\//.test(filePath) ? divina_1.Divinais.RemotePacked : divina_1.Divinais.LocalPacked), "pdf");
                    return [3, 11];
                case 6: return [4, (0, daisy_1.isDaisyPublication)(filePath)];
                case 7:
                    if (!(_g.sent())) return [3, 8];
                    _f = (0, daisy_1.DaisyParsePromise)(filePath);
                    return [3, 10];
                case 8: return [4, (0, audiobook_1.isAudioBookPublication)(filePath)];
                case 9:
                    _f = (isAudio = _g.sent()) ? (0, audiobook_1.AudioBookParsePromise)(filePath, isAudio) :
                        Promise.reject("Unrecognized publication type ".concat(filePath));
                    _g.label = 10;
                case 10:
                    _e = (_f);
                    _g.label = 11;
                case 11:
                    _d = (_e);
                    _g.label = 12;
                case 12:
                    _c = (_d);
                    _g.label = 13;
                case 13:
                    _b = (_c);
                    _g.label = 14;
                case 14:
                    _a = (_b);
                    _g.label = 15;
                case 15: return [2, _a];
            }
        });
    });
}
//# sourceMappingURL=publication-parser.js.map