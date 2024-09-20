"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaisyBookis = void 0;
exports.isDaisyPublication = isDaisyPublication;
exports.DaisyParsePromise = DaisyParsePromise;
var tslib_1 = require("tslib");
var debug_ = require("debug");
var fs = require("fs");
var path = require("path");
var metadata_1 = require("../models/metadata");
var publication_1 = require("../models/publication");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var zipFactory_1 = require("r2-utils-js/dist/es5/src/_utils/zip/zipFactory");
var zipHasEntry_1 = require("../_utils/zipHasEntry");
var daisy_convert_ncc_to_opf_ncx_1 = require("./daisy-convert-ncc-to-opf-ncx");
var epub_daisy_common_1 = require("./epub-daisy-common");
var debug = debug_("r2:shared#parser/daisy");
var DaisyBookis;
(function (DaisyBookis) {
    DaisyBookis["LocalExploded"] = "LocalExploded";
    DaisyBookis["LocalPacked"] = "LocalPacked";
    DaisyBookis["RemoteExploded"] = "RemoteExploded";
    DaisyBookis["RemotePacked"] = "RemotePacked";
})(DaisyBookis || (exports.DaisyBookis = DaisyBookis = {}));
function isDaisyPublication(urlOrPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var p, http, url, zip, err_1, entries, opfZipEntryPath;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    p = urlOrPath;
                    http = (0, UrlUtils_1.isHTTP)(urlOrPath);
                    if (!http) return [3, 1];
                    url = new URL(urlOrPath);
                    p = url.pathname;
                    return [2, undefined];
                case 1:
                    if (!/\.daisy[23]?$/i.test(path.extname(path.basename(p)))) return [3, 2];
                    return [2, DaisyBookis.LocalPacked];
                case 2:
                    if (!(fs.existsSync(path.join(urlOrPath, "package.opf")) ||
                        fs.existsSync(path.join(urlOrPath, "Book.opf")) ||
                        fs.existsSync(path.join(urlOrPath, "ncc.html")) ||
                        fs.existsSync(path.join(urlOrPath, "speechgen.opf")))) return [3, 3];
                    if (!fs.existsSync(path.join(urlOrPath, "META-INF", "container.xml"))) {
                        return [2, DaisyBookis.LocalExploded];
                    }
                    return [3, 10];
                case 3:
                    zip = void 0;
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4, (0, zipFactory_1.zipLoadPromise)(urlOrPath)];
                case 5:
                    zip = _a.sent();
                    return [3, 7];
                case 6:
                    err_1 = _a.sent();
                    debug(err_1);
                    return [2, Promise.reject(err_1)];
                case 7: return [4, (0, zipHasEntry_1.zipHasEntry)(zip, "META-INF/container.xml", undefined)];
                case 8:
                    if (!!(_a.sent())) return [3, 10];
                    return [4, zip.getEntries()];
                case 9:
                    entries = _a.sent();
                    opfZipEntryPath = entries.find(function (entry) {
                        return /ncc\.html$/i.test(entry) || /\.opf$/i.test(entry);
                    });
                    if (!opfZipEntryPath) {
                        return [2, undefined];
                    }
                    return [2, DaisyBookis.LocalPacked];
                case 10: return [2, undefined];
            }
        });
    });
}
function DaisyParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var zip, err_2, publication, entries, opfZipEntryPath, daisy2NccZipEntryPath, rootfilePathDecoded, opf, ncx, ncxManItem;
        var _a;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4, (0, zipFactory_1.zipLoadPromise)(filePath)];
                case 1:
                    zip = _b.sent();
                    return [3, 3];
                case 2:
                    err_2 = _b.sent();
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
                    publication.AddToInternal("filename", path.basename(filePath));
                    publication.AddToInternal("type", "daisy");
                    publication.AddToInternal("zip", zip);
                    return [4, zip.getEntries()];
                case 4:
                    entries = _b.sent();
                    opfZipEntryPath = entries.find(function (entry) {
                        return /\.opf$/i.test(entry);
                    });
                    if (!opfZipEntryPath) {
                        daisy2NccZipEntryPath = entries.find(function (entry) {
                            return /ncc\.html$/i.test(entry);
                        });
                        opfZipEntryPath = daisy2NccZipEntryPath;
                    }
                    if (!opfZipEntryPath) {
                        return [2, Promise.reject("DAISY3 OPF package XML file or DAISY2 NCC cannot be found.")];
                    }
                    rootfilePathDecoded = opfZipEntryPath;
                    if (!rootfilePathDecoded) {
                        return [2, Promise.reject("?!rootfile.PathDecoded")];
                    }
                    if (!daisy2NccZipEntryPath) return [3, 6];
                    return [4, (0, daisy_convert_ncc_to_opf_ncx_1.convertNccToOpfAndNcx)(zip, rootfilePathDecoded, opfZipEntryPath)];
                case 5:
                    _a = _b.sent(), opf = _a[0], ncx = _a[1];
                    return [3, 9];
                case 6: return [4, (0, epub_daisy_common_1.getOpf)(zip, rootfilePathDecoded, opfZipEntryPath)];
                case 7:
                    opf = _b.sent();
                    if (!opf.Manifest) return [3, 9];
                    ncxManItem = opf.Manifest.find(function (manifestItem) {
                        return manifestItem.MediaType === "application/x-dtbncx+xml";
                    });
                    if (!ncxManItem) {
                        ncxManItem = opf.Manifest.find(function (manifestItem) {
                            return manifestItem.MediaType === "text/xml" &&
                                manifestItem.Href && /\.ncx$/i.test(manifestItem.Href);
                        });
                    }
                    if (!ncxManItem) return [3, 9];
                    return [4, (0, epub_daisy_common_1.getNcx)(ncxManItem, opf, zip)];
                case 8:
                    ncx = _b.sent();
                    _b.label = 9;
                case 9:
                    (0, epub_daisy_common_1.addLanguage)(publication, opf);
                    (0, epub_daisy_common_1.addTitle)(publication, undefined, opf);
                    (0, epub_daisy_common_1.addIdentifier)(publication, opf);
                    (0, epub_daisy_common_1.addOtherMetadata)(publication, undefined, opf);
                    (0, epub_daisy_common_1.setPublicationDirection)(publication, opf);
                    (0, epub_daisy_common_1.findContributorInMeta)(publication, undefined, opf);
                    return [4, (0, epub_daisy_common_1.fillSpineAndResource)(publication, undefined, opf, zip, addLinkData)];
                case 10:
                    _b.sent();
                    (0, epub_daisy_common_1.fillTOC)(publication, opf, ncx);
                    (0, epub_daisy_common_1.fillSubject)(publication, opf);
                    (0, epub_daisy_common_1.fillPublicationDate)(publication, undefined, opf);
                    return [2, publication];
            }
        });
    });
}
var addLinkData = function (publication, _rootfile, opf, zip, linkItem, item) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var isFullTextAudio, isAudioOnly, isTextOnly;
    var _a;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!((_a = publication.Metadata) === null || _a === void 0 ? void 0 : _a.AdditionalJSON)) return [3, 3];
                isFullTextAudio = publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioFullText" ||
                    publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "audioFullText" || (!publication.Metadata.AdditionalJSON["dtb:multimediaType"] &&
                    !publication.Metadata.AdditionalJSON["ncc:multimediaType"]);
                isAudioOnly = publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioNCX" ||
                    publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "audioNcc";
                isTextOnly = publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "textNCX" ||
                    publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "textNcc";
                if (!(isFullTextAudio || isTextOnly || isAudioOnly)) return [3, 3];
                return [4, (0, epub_daisy_common_1.addMediaOverlaySMIL)(linkItem, item, opf, zip)];
            case 1:
                _b.sent();
                if (!(linkItem.MediaOverlays && !linkItem.MediaOverlays.initialized)) return [3, 3];
                return [4, (0, epub_daisy_common_1.lazyLoadMediaOverlays)(publication, linkItem.MediaOverlays)];
            case 2:
                _b.sent();
                if (isFullTextAudio || isAudioOnly) {
                    (0, epub_daisy_common_1.updateDurations)(linkItem.MediaOverlays.duration, linkItem);
                }
                _b.label = 3;
            case 3: return [2];
        }
    });
}); };
//# sourceMappingURL=daisy.js.map