"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var audiobook_1 = require("./audiobook");
var cbz_1 = require("./cbz");
var epub_1 = require("./epub");
function PublicationParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var isAudio, _a, _b;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!epub_1.isEPUBlication(filePath)) return [3, 1];
                    _a = epub_1.EpubParsePromise(filePath);
                    return [3, 5];
                case 1:
                    if (!cbz_1.isCBZPublication(filePath)) return [3, 2];
                    _b = cbz_1.CbzParsePromise(filePath);
                    return [3, 4];
                case 2: return [4, audiobook_1.isAudioBookPublication(filePath)];
                case 3:
                    _b = (isAudio = _c.sent()) ? audiobook_1.AudioBookParsePromise(filePath, isAudio) :
                        Promise.reject("Unrecognized publication type " + filePath);
                    _c.label = 4;
                case 4:
                    _a = (_b);
                    _c.label = 5;
                case 5: return [2, _a];
            }
        });
    });
}
exports.PublicationParsePromise = PublicationParsePromise;
//# sourceMappingURL=publication-parser.js.map