"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaisyParsePromise = exports.isDaisyPublication = exports.DaisyBookis = void 0;
var tslib_1 = require("tslib");
var debug_ = require("debug");
var fs = require("fs");
var moment = require("moment");
var path = require("path");
var metadata_1 = require("../models/metadata");
var publication_1 = require("../models/publication");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var zipFactory_1 = require("r2-utils-js/dist/es5/src/_utils/zip/zipFactory");
var zipHasEntry_1 = require("../_utils/zipHasEntry");
var epub_daisy_common_1 = require("./epub-daisy-common");
var debug = debug_("r2:shared#parser/daisy");
var DaisyBookis;
(function (DaisyBookis) {
    DaisyBookis["LocalExploded"] = "LocalExploded";
    DaisyBookis["LocalPacked"] = "LocalPacked";
    DaisyBookis["RemoteExploded"] = "RemoteExploded";
    DaisyBookis["RemotePacked"] = "RemotePacked";
})(DaisyBookis = exports.DaisyBookis || (exports.DaisyBookis = {}));
function isDaisyPublication(urlOrPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var p, http, url, zip, err_1, _a, _b, _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    p = urlOrPath;
                    http = UrlUtils_1.isHTTP(urlOrPath);
                    if (!http) return [3, 1];
                    url = new URL(urlOrPath);
                    p = url.pathname;
                    return [2, undefined];
                case 1:
                    if (!/\.daisy[23]?$/.test(path.extname(path.basename(p)).toLowerCase())) return [3, 2];
                    return [2, DaisyBookis.LocalPacked];
                case 2:
                    if (!(fs.existsSync(path.join(urlOrPath, "package.opf")) ||
                        fs.existsSync(path.join(urlOrPath, "Book.opf")) ||
                        fs.existsSync(path.join(urlOrPath, "speechgen.opf")))) return [3, 3];
                    if (!fs.existsSync(path.join(urlOrPath, "META-INF", "container.xml"))) {
                        return [2, DaisyBookis.LocalExploded];
                    }
                    return [3, 15];
                case 3:
                    zip = void 0;
                    _d.label = 4;
                case 4:
                    _d.trys.push([4, 6, , 7]);
                    return [4, zipFactory_1.zipLoadPromise(urlOrPath)];
                case 5:
                    zip = _d.sent();
                    return [3, 7];
                case 6:
                    err_1 = _d.sent();
                    debug(err_1);
                    return [2, Promise.reject(err_1)];
                case 7: return [4, zipHasEntry_1.zipHasEntry(zip, "META-INF/container.xml", undefined)];
                case 8:
                    _a = !(_d.sent());
                    if (!_a) return [3, 14];
                    return [4, zipHasEntry_1.zipHasEntry(zip, "package.opf", undefined)];
                case 9:
                    _c = (_d.sent());
                    if (_c) return [3, 11];
                    return [4, zipHasEntry_1.zipHasEntry(zip, "Book.opf", undefined)];
                case 10:
                    _c = (_d.sent());
                    _d.label = 11;
                case 11:
                    _b = _c;
                    if (_b) return [3, 13];
                    return [4, zipHasEntry_1.zipHasEntry(zip, "speechgen.opf", undefined)];
                case 12:
                    _b = (_d.sent());
                    _d.label = 13;
                case 13:
                    _a = (_b);
                    _d.label = 14;
                case 14:
                    if (_a) {
                        return [2, DaisyBookis.LocalPacked];
                    }
                    _d.label = 15;
                case 15: return [2, undefined];
            }
        });
    });
}
exports.isDaisyPublication = isDaisyPublication;
function DaisyParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var zip, err_2, publication, entries, opfZipEntryPath, rootfilePathDecoded, opf, ncx, ncxManItem;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, zipFactory_1.zipLoadPromise(filePath)];
                case 1:
                    zip = _a.sent();
                    return [3, 3];
                case 2:
                    err_2 = _a.sent();
                    debug(err_2);
                    return [2, Promise.reject(err_2)];
                case 3:
                    if (!zip.hasEntries()) {
                        return [2, Promise.reject("Daisy zip empty")];
                    }
                    publication = new publication_1.Publication();
                    publication.Context = ["https://readium.org/webpub-manifest/context.jsonld"];
                    publication.Metadata = new metadata_1.Metadata();
                    publication.Metadata.RDFType = "http://schema.org/Book";
                    publication.Metadata.Modified = moment(Date.now()).toDate();
                    publication.AddToInternal("filename", path.basename(filePath));
                    publication.AddToInternal("type", "daisy");
                    publication.AddToInternal("zip", zip);
                    return [4, zip.getEntries()];
                case 4:
                    entries = _a.sent();
                    opfZipEntryPath = entries.find(function (entry) {
                        return entry.endsWith(".opf") && entry.indexOf("/") < 0 && entry.indexOf("\\") < 0;
                    });
                    if (!opfZipEntryPath) {
                        return [2, Promise.reject("Opf File doesn't exists")];
                    }
                    rootfilePathDecoded = opfZipEntryPath;
                    if (!rootfilePathDecoded) {
                        return [2, Promise.reject("?!rootfile.PathDecoded")];
                    }
                    return [4, epub_daisy_common_1.getOpf(zip, rootfilePathDecoded, opfZipEntryPath)];
                case 5:
                    opf = _a.sent();
                    epub_daisy_common_1.addLanguage(publication, opf);
                    epub_daisy_common_1.addTitle(publication, undefined, opf);
                    epub_daisy_common_1.addIdentifier(publication, opf);
                    epub_daisy_common_1.addOtherMetadata(publication, undefined, opf);
                    epub_daisy_common_1.setPublicationDirection(publication, opf);
                    epub_daisy_common_1.findContributorInMeta(publication, undefined, opf);
                    return [4, epub_daisy_common_1.fillSpineAndResource(publication, undefined, opf, zip, addLinkData)];
                case 6:
                    _a.sent();
                    if (!opf.Manifest) return [3, 8];
                    ncxManItem = opf.Manifest.find(function (manifestItem) {
                        return manifestItem.MediaType === "application/x-dtbncx+xml";
                    });
                    if (!ncxManItem) {
                        ncxManItem = opf.Manifest.find(function (manifestItem) {
                            return manifestItem.MediaType === "text/xml" &&
                                manifestItem.Href && manifestItem.Href.endsWith(".ncx");
                        });
                    }
                    if (!ncxManItem) return [3, 8];
                    return [4, epub_daisy_common_1.getNcx(ncxManItem, opf, zip)];
                case 7:
                    ncx = _a.sent();
                    _a.label = 8;
                case 8:
                    epub_daisy_common_1.fillTOC(publication, opf, ncx);
                    epub_daisy_common_1.fillSubject(publication, opf);
                    epub_daisy_common_1.fillPublicationDate(publication, undefined, opf);
                    return [2, publication];
            }
        });
    });
}
exports.DaisyParsePromise = DaisyParsePromise;
var addLinkData = function (publication, _rootfile, opf, zip, linkItem, item) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var isFullTextAudio, isTextOnly;
    var _a;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!((_a = publication.Metadata) === null || _a === void 0 ? void 0 : _a.AdditionalJSON)) return [3, 3];
                isFullTextAudio = publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioFullText";
                isTextOnly = publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "textNCX";
                if (!(isFullTextAudio || isTextOnly)) return [3, 3];
                return [4, epub_daisy_common_1.addMediaOverlaySMIL(linkItem, item, opf, zip)];
            case 1:
                _b.sent();
                if (!(linkItem.MediaOverlays && !linkItem.MediaOverlays.initialized)) return [3, 3];
                return [4, epub_daisy_common_1.lazyLoadMediaOverlays(publication, linkItem.MediaOverlays)];
            case 2:
                _b.sent();
                if (isFullTextAudio) {
                    epub_daisy_common_1.updateDurations(linkItem.MediaOverlays.duration, linkItem);
                }
                _b.label = 3;
            case 3: return [2];
        }
    });
}); };
//# sourceMappingURL=daisy.js.map