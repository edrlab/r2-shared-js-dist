"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaisyParsePromise = exports.isDaisyPublication = exports.DaisyBookis = void 0;
const debug_ = require("debug");
const fs = require("fs");
const moment = require("moment");
const path = require("path");
const metadata_1 = require("../models/metadata");
const publication_1 = require("../models/publication");
const UrlUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/http/UrlUtils");
const zipFactory_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/zip/zipFactory");
const zipHasEntry_1 = require("../_utils/zipHasEntry");
const epub_1 = require("./epub");
const epub_daisy_common_1 = require("./epub-daisy-common");
const debug = debug_("r2:shared#parser/daisy");
var DaisyBookis;
(function (DaisyBookis) {
    DaisyBookis["LocalExploded"] = "LocalExploded";
    DaisyBookis["LocalPacked"] = "LocalPacked";
    DaisyBookis["RemoteExploded"] = "RemoteExploded";
    DaisyBookis["RemotePacked"] = "RemotePacked";
})(DaisyBookis = exports.DaisyBookis || (exports.DaisyBookis = {}));
async function isDaisyPublication(urlOrPath) {
    let p = urlOrPath;
    const http = UrlUtils_1.isHTTP(urlOrPath);
    if (http) {
        const url = new URL(urlOrPath);
        p = url.pathname;
        return undefined;
    }
    else if (/\.daisy[23]?$/.test(path.extname(path.basename(p)).toLowerCase())) {
        return DaisyBookis.LocalPacked;
    }
    else if (fs.existsSync(path.join(urlOrPath, "package.opf")) ||
        fs.existsSync(path.join(urlOrPath, "Book.opf")) ||
        fs.existsSync(path.join(urlOrPath, "speechgen.opf"))) {
        if (!fs.existsSync(path.join(urlOrPath, "META-INF", "container.xml"))) {
            return DaisyBookis.LocalExploded;
        }
    }
    else {
        let zip;
        try {
            zip = await zipFactory_1.zipLoadPromise(urlOrPath);
        }
        catch (err) {
            debug(err);
            return Promise.reject(err);
        }
        if (!await zipHasEntry_1.zipHasEntry(zip, "META-INF/container.xml", undefined) &&
            (await zipHasEntry_1.zipHasEntry(zip, "package.opf", undefined) ||
                await zipHasEntry_1.zipHasEntry(zip, "Book.opf", undefined) ||
                await zipHasEntry_1.zipHasEntry(zip, "speechgen.opf", undefined))) {
            return DaisyBookis.LocalPacked;
        }
    }
    return undefined;
}
exports.isDaisyPublication = isDaisyPublication;
async function DaisyParsePromise(filePath) {
    let zip;
    try {
        zip = await zipFactory_1.zipLoadPromise(filePath);
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
    publication.Metadata.Modified = moment(Date.now()).toDate();
    publication.AddToInternal("filename", path.basename(filePath));
    publication.AddToInternal("type", "daisy");
    publication.AddToInternal("zip", zip);
    const entries = await zip.getEntries();
    const opfZipEntryPath = entries.find((entry) => {
        return entry.endsWith(".opf") && entry.indexOf("/") < 0 && entry.indexOf("\\") < 0;
    });
    if (!opfZipEntryPath) {
        return Promise.reject("Opf File doesn't exists");
    }
    const rootfilePathDecoded = opfZipEntryPath;
    if (!rootfilePathDecoded) {
        return Promise.reject("?!rootfile.PathDecoded");
    }
    const opf = await epub_daisy_common_1.getOpf(zip, rootfilePathDecoded, opfZipEntryPath);
    epub_daisy_common_1.addLanguage(publication, opf);
    epub_daisy_common_1.addTitle(publication, undefined, opf);
    epub_daisy_common_1.addIdentifier(publication, opf);
    epub_daisy_common_1.addOtherMetadata(publication, undefined, opf);
    epub_daisy_common_1.setPublicationDirection(publication, opf);
    epub_daisy_common_1.findContributorInMeta(publication, undefined, opf);
    await epub_daisy_common_1.fillSpineAndResource(publication, undefined, opf, zip, addLinkData);
    let ncx;
    if (opf.Manifest) {
        let ncxManItem = opf.Manifest.find((manifestItem) => {
            return manifestItem.MediaType === "application/x-dtbncx+xml";
        });
        if (!ncxManItem) {
            ncxManItem = opf.Manifest.find((manifestItem) => {
                return manifestItem.MediaType === "text/xml" &&
                    manifestItem.Href && manifestItem.Href.endsWith(".ncx");
            });
        }
        if (ncxManItem) {
            ncx = await epub_daisy_common_1.getNcx(ncxManItem, opf, zip);
        }
    }
    epub_daisy_common_1.fillTOC(publication, opf, ncx);
    epub_daisy_common_1.fillSubject(publication, opf);
    epub_daisy_common_1.fillPublicationDate(publication, undefined, opf);
    return publication;
}
exports.DaisyParsePromise = DaisyParsePromise;
const addLinkData = async (publication, _rootfile, opf, zip, linkItem, item) => {
    var _a;
    if (((_a = publication.Metadata) === null || _a === void 0 ? void 0 : _a.AdditionalJSON) &&
        publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioFullText") {
        await epub_daisy_common_1.addMediaOverlaySMIL(linkItem, item, opf, zip);
        if (linkItem.MediaOverlays && !linkItem.MediaOverlays.initialized) {
            await epub_1.lazyLoadMediaOverlays(publication, linkItem.MediaOverlays);
            if (linkItem.MediaOverlays.duration) {
                if (!linkItem.Duration) {
                    linkItem.Duration = linkItem.MediaOverlays.duration;
                }
                if (linkItem.Alternate) {
                    for (const altLink of linkItem.Alternate) {
                        if (altLink.TypeLink === "application/vnd.syncnarr+json") {
                            if (!altLink.Duration) {
                                altLink.Duration = linkItem.MediaOverlays.duration;
                            }
                        }
                    }
                }
            }
        }
    }
};
//# sourceMappingURL=daisy.js.map