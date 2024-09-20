"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaisyBookis = void 0;
exports.isDaisyPublication = isDaisyPublication;
exports.DaisyParsePromise = DaisyParsePromise;
const tslib_1 = require("tslib");
const debug_ = require("debug");
const fs = require("fs");
const path = require("path");
const metadata_1 = require("../models/metadata");
const publication_1 = require("../models/publication");
const UrlUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/http/UrlUtils");
const zipFactory_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/zip/zipFactory");
const zipHasEntry_1 = require("../_utils/zipHasEntry");
const daisy_convert_ncc_to_opf_ncx_1 = require("./daisy-convert-ncc-to-opf-ncx");
const epub_daisy_common_1 = require("./epub-daisy-common");
const debug = debug_("r2:shared#parser/daisy");
var DaisyBookis;
(function (DaisyBookis) {
    DaisyBookis["LocalExploded"] = "LocalExploded";
    DaisyBookis["LocalPacked"] = "LocalPacked";
    DaisyBookis["RemoteExploded"] = "RemoteExploded";
    DaisyBookis["RemotePacked"] = "RemotePacked";
})(DaisyBookis || (exports.DaisyBookis = DaisyBookis = {}));
function isDaisyPublication(urlOrPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let p = urlOrPath;
        const http = (0, UrlUtils_1.isHTTP)(urlOrPath);
        if (http) {
            const url = new URL(urlOrPath);
            p = url.pathname;
            return undefined;
        }
        else if (/\.daisy[23]?$/i.test(path.extname(path.basename(p)))) {
            return DaisyBookis.LocalPacked;
        }
        else if (fs.existsSync(path.join(urlOrPath, "package.opf")) ||
            fs.existsSync(path.join(urlOrPath, "Book.opf")) ||
            fs.existsSync(path.join(urlOrPath, "ncc.html")) ||
            fs.existsSync(path.join(urlOrPath, "speechgen.opf"))) {
            if (!fs.existsSync(path.join(urlOrPath, "META-INF", "container.xml"))) {
                return DaisyBookis.LocalExploded;
            }
        }
        else {
            let zip;
            try {
                zip = yield (0, zipFactory_1.zipLoadPromise)(urlOrPath);
            }
            catch (err) {
                debug(err);
                return Promise.reject(err);
            }
            if (!(yield (0, zipHasEntry_1.zipHasEntry)(zip, "META-INF/container.xml", undefined))) {
                const entries = yield zip.getEntries();
                const opfZipEntryPath = entries.find((entry) => {
                    return /ncc\.html$/i.test(entry) || /\.opf$/i.test(entry);
                });
                if (!opfZipEntryPath) {
                    return undefined;
                }
                return DaisyBookis.LocalPacked;
            }
        }
        return undefined;
    });
}
function DaisyParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let zip;
        try {
            zip = yield (0, zipFactory_1.zipLoadPromise)(filePath);
        }
        catch (err) {
            debug(err);
            return Promise.reject(err);
        }
        if (!zip.hasEntries()) {
            return Promise.reject("Daisy zip empty");
        }
        const publication = new publication_1.Publication();
        publication.Context = ["https://readium.org/webpub-manifest/context.jsonld"];
        publication.Metadata = new metadata_1.Metadata();
        publication.Metadata.RDFType = "http://schema.org/Book";
        publication.AddToInternal("filename", path.basename(filePath));
        publication.AddToInternal("type", "daisy");
        publication.AddToInternal("zip", zip);
        const entries = yield zip.getEntries();
        let opfZipEntryPath = entries.find((entry) => {
            return /\.opf$/i.test(entry);
        });
        let daisy2NccZipEntryPath;
        if (!opfZipEntryPath) {
            daisy2NccZipEntryPath = entries.find((entry) => {
                return /ncc\.html$/i.test(entry);
            });
            opfZipEntryPath = daisy2NccZipEntryPath;
        }
        if (!opfZipEntryPath) {
            return Promise.reject("DAISY3 OPF package XML file or DAISY2 NCC cannot be found.");
        }
        const rootfilePathDecoded = opfZipEntryPath;
        if (!rootfilePathDecoded) {
            return Promise.reject("?!rootfile.PathDecoded");
        }
        let opf;
        let ncx;
        if (daisy2NccZipEntryPath) {
            [opf, ncx] = yield (0, daisy_convert_ncc_to_opf_ncx_1.convertNccToOpfAndNcx)(zip, rootfilePathDecoded, opfZipEntryPath);
        }
        else {
            opf = yield (0, epub_daisy_common_1.getOpf)(zip, rootfilePathDecoded, opfZipEntryPath);
            if (opf.Manifest) {
                let ncxManItem = opf.Manifest.find((manifestItem) => {
                    return manifestItem.MediaType === "application/x-dtbncx+xml";
                });
                if (!ncxManItem) {
                    ncxManItem = opf.Manifest.find((manifestItem) => {
                        return manifestItem.MediaType === "text/xml" &&
                            manifestItem.Href && /\.ncx$/i.test(manifestItem.Href);
                    });
                }
                if (ncxManItem) {
                    ncx = yield (0, epub_daisy_common_1.getNcx)(ncxManItem, opf, zip);
                }
            }
        }
        (0, epub_daisy_common_1.addLanguage)(publication, opf);
        (0, epub_daisy_common_1.addTitle)(publication, undefined, opf);
        (0, epub_daisy_common_1.addIdentifier)(publication, opf);
        (0, epub_daisy_common_1.addOtherMetadata)(publication, undefined, opf);
        (0, epub_daisy_common_1.setPublicationDirection)(publication, opf);
        (0, epub_daisy_common_1.findContributorInMeta)(publication, undefined, opf);
        yield (0, epub_daisy_common_1.fillSpineAndResource)(publication, undefined, opf, zip, addLinkData);
        (0, epub_daisy_common_1.fillTOC)(publication, opf, ncx);
        (0, epub_daisy_common_1.fillSubject)(publication, opf);
        (0, epub_daisy_common_1.fillPublicationDate)(publication, undefined, opf);
        return publication;
    });
}
const addLinkData = (publication, _rootfile, opf, zip, linkItem, item) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if ((_a = publication.Metadata) === null || _a === void 0 ? void 0 : _a.AdditionalJSON) {
        const isFullTextAudio = publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioFullText" ||
            publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "audioFullText" || (!publication.Metadata.AdditionalJSON["dtb:multimediaType"] &&
            !publication.Metadata.AdditionalJSON["ncc:multimediaType"]);
        const isAudioOnly = publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioNCX" ||
            publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "audioNcc";
        const isTextOnly = publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "textNCX" ||
            publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "textNcc";
        if (isFullTextAudio || isTextOnly || isAudioOnly) {
            yield (0, epub_daisy_common_1.addMediaOverlaySMIL)(linkItem, item, opf, zip);
            if (linkItem.MediaOverlays && !linkItem.MediaOverlays.initialized) {
                yield (0, epub_daisy_common_1.lazyLoadMediaOverlays)(publication, linkItem.MediaOverlays);
                if (isFullTextAudio || isAudioOnly) {
                    (0, epub_daisy_common_1.updateDurations)(linkItem.MediaOverlays.duration, linkItem);
                }
            }
        }
    }
});
//# sourceMappingURL=daisy.js.map