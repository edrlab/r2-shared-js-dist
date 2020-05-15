"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lazyLoadMediaOverlays = exports.getMediaOverlay = exports.getAllMediaOverlays = exports.EpubParsePromise = exports.isEPUBlication = exports.EPUBis = exports.addCoverDimensions = exports.BCP47_UNKNOWN_LANG = exports.mediaOverlayURLParam = exports.mediaOverlayURLPath = void 0;
const debug_ = require("debug");
const fs = require("fs");
const image_size_1 = require("image-size");
const moment = require("moment");
const path = require("path");
const url_1 = require("url");
const xmldom = require("xmldom");
const xpath = require("xpath");
const media_overlay_1 = require("../models/media-overlay");
const metadata_1 = require("../models/metadata");
const metadata_belongsto_1 = require("../models/metadata-belongsto");
const metadata_contributor_1 = require("../models/metadata-contributor");
const metadata_media_overlay_1 = require("../models/metadata-media-overlay");
const metadata_properties_1 = require("../models/metadata-properties");
const metadata_subject_1 = require("../models/metadata-subject");
const publication_1 = require("../models/publication");
const publication_link_1 = require("../models/publication-link");
const ta_json_string_tokens_converter_1 = require("../models/ta-json-string-tokens-converter");
const metadata_encrypted_1 = require("r2-lcp-js/dist/es8-es2017/src/models/metadata-encrypted");
const lcp_1 = require("r2-lcp-js/dist/es8-es2017/src/parser/epub/lcp");
const serializable_1 = require("r2-lcp-js/dist/es8-es2017/src/serializable");
const UrlUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/http/UrlUtils");
const BufferUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/stream/BufferUtils");
const xml_js_mapper_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/xml-js-mapper");
const zipFactory_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/zip/zipFactory");
const transformer_1 = require("../transform/transformer");
const decodeURI_1 = require("../_utils/decodeURI");
const zipHasEntry_1 = require("../_utils/zipHasEntry");
const container_1 = require("./epub/container");
const display_options_1 = require("./epub/display-options");
const encryption_1 = require("./epub/encryption");
const ncx_1 = require("./epub/ncx");
const opf_1 = require("./epub/opf");
const opf_author_1 = require("./epub/opf-author");
const smil_1 = require("./epub/smil");
const smil_seq_1 = require("./epub/smil-seq");
const debug = debug_("r2:shared#parser/epub");
const epub3 = "3.0";
const epub301 = "3.0.1";
const epub31 = "3.1";
exports.mediaOverlayURLPath = "media-overlay.json";
exports.mediaOverlayURLParam = "resource";
exports.BCP47_UNKNOWN_LANG = "und";
function parseSpaceSeparatedString(str) {
    return str ? str.trim().split(" ").map((role) => {
        return role.trim();
    }).filter((role) => {
        return role.length > 0;
    }) : [];
}
exports.addCoverDimensions = async (publication, coverLink) => {
    const zipInternal = publication.findFromInternal("zip");
    if (zipInternal) {
        const zip = zipInternal.Value;
        const coverLinkHrefDecoded = coverLink.HrefDecoded;
        if (!coverLinkHrefDecoded) {
            return;
        }
        const has = await zipHasEntry_1.zipHasEntry(zip, coverLinkHrefDecoded, coverLink.Href);
        if (!has) {
            debug(`NOT IN ZIP (addCoverDimensions): ${coverLink.Href} --- ${coverLinkHrefDecoded}`);
            const zipEntries = await zip.getEntries();
            for (const zipEntry of zipEntries) {
                debug(zipEntry);
            }
            return;
        }
        let zipStream;
        try {
            zipStream = await zip.entryStreamPromise(coverLinkHrefDecoded);
        }
        catch (err) {
            debug(coverLinkHrefDecoded);
            debug(coverLink.TypeLink);
            debug(err);
            return;
        }
        let zipData;
        try {
            zipData = await BufferUtils_1.streamToBufferPromise(zipStream.stream);
            const imageInfo = image_size_1.imageSize(zipData);
            if (imageInfo && imageInfo.width && imageInfo.height) {
                coverLink.Width = imageInfo.width;
                coverLink.Height = imageInfo.height;
                if (coverLink.TypeLink &&
                    coverLink.TypeLink.replace("jpeg", "jpg").replace("+xml", "")
                        !== ("image/" + imageInfo.type)) {
                    debug(`Wrong image type? ${coverLink.TypeLink} -- ${imageInfo.type}`);
                }
            }
        }
        catch (err) {
            debug(coverLinkHrefDecoded);
            debug(coverLink.TypeLink);
            debug(err);
        }
    }
};
var EPUBis;
(function (EPUBis) {
    EPUBis["LocalExploded"] = "LocalExploded";
    EPUBis["LocalPacked"] = "LocalPacked";
    EPUBis["RemoteExploded"] = "RemoteExploded";
    EPUBis["RemotePacked"] = "RemotePacked";
})(EPUBis = exports.EPUBis || (exports.EPUBis = {}));
function isEPUBlication(urlOrPath) {
    let p = urlOrPath;
    const http = UrlUtils_1.isHTTP(urlOrPath);
    if (http) {
        const url = new url_1.URL(urlOrPath);
        p = url.pathname;
    }
    else if (fs.existsSync(path.join(urlOrPath, "META-INF", "container.xml"))) {
        return EPUBis.LocalExploded;
    }
    const fileName = path.basename(p);
    const ext = path.extname(fileName).toLowerCase();
    const epub = /\.epub[3]?$/.test(ext);
    if (epub) {
        return http ? EPUBis.RemotePacked : EPUBis.LocalPacked;
    }
    if (/META-INF[\/|\\]container.xml$/.test(p)) {
        return http ? EPUBis.RemoteExploded : EPUBis.LocalExploded;
    }
    return undefined;
}
exports.isEPUBlication = isEPUBlication;
async function EpubParsePromise(filePath) {
    const isAnEPUB = isEPUBlication(filePath);
    let filePathToLoad = filePath;
    if (isAnEPUB === EPUBis.LocalExploded) {
        filePathToLoad = filePathToLoad.replace(/META-INF[\/|\\]container.xml$/, "");
    }
    else if (isAnEPUB === EPUBis.RemoteExploded) {
        const url = new url_1.URL(filePathToLoad);
        url.pathname = url.pathname.replace(/META-INF[\/|\\]container.xml$/, "");
        filePathToLoad = url.toString();
    }
    let zip;
    try {
        zip = await zipFactory_1.zipLoadPromise(filePathToLoad);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    if (!zip.hasEntries()) {
        return Promise.reject("EPUB zip empty");
    }
    const publication = new publication_1.Publication();
    publication.Context = ["https://readium.org/webpub-manifest/context.jsonld"];
    publication.Metadata = new metadata_1.Metadata();
    publication.Metadata.RDFType = "http://schema.org/Book";
    publication.Metadata.Modified = moment(Date.now()).toDate();
    publication.AddToInternal("filename", path.basename(filePath));
    publication.AddToInternal("type", "epub");
    publication.AddToInternal("zip", zip);
    let lcpl;
    const lcplZipPath = "META-INF/license.lcpl";
    let has = await zipHasEntry_1.zipHasEntry(zip, lcplZipPath, undefined);
    if (has) {
        let lcplZipStream_;
        try {
            lcplZipStream_ = await zip.entryStreamPromise(lcplZipPath);
        }
        catch (err) {
            debug(err);
            return Promise.reject(err);
        }
        const lcplZipStream = lcplZipStream_.stream;
        let lcplZipData;
        try {
            lcplZipData = await BufferUtils_1.streamToBufferPromise(lcplZipStream);
        }
        catch (err) {
            debug(err);
            return Promise.reject(err);
        }
        const lcplStr = lcplZipData.toString("utf8");
        const lcplJson = global.JSON.parse(lcplStr);
        lcpl = serializable_1.TaJsonDeserialize(lcplJson, lcp_1.LCP);
        lcpl.ZipPath = lcplZipPath;
        lcpl.JsonSource = lcplStr;
        lcpl.init();
        publication.LCP = lcpl;
        const mime = "application/vnd.readium.lcp.license.v1.0+json";
        publication.AddLink(mime, ["license"], lcpl.ZipPath, undefined);
    }
    let encryption;
    const encZipPath = "META-INF/encryption.xml";
    has = await zipHasEntry_1.zipHasEntry(zip, encZipPath, undefined);
    if (has) {
        let encryptionXmlZipStream_;
        try {
            encryptionXmlZipStream_ = await zip.entryStreamPromise(encZipPath);
        }
        catch (err) {
            debug(err);
            return Promise.reject(err);
        }
        const encryptionXmlZipStream = encryptionXmlZipStream_.stream;
        let encryptionXmlZipData;
        try {
            encryptionXmlZipData = await BufferUtils_1.streamToBufferPromise(encryptionXmlZipStream);
        }
        catch (err) {
            debug(err);
            return Promise.reject(err);
        }
        const encryptionXmlStr = encryptionXmlZipData.toString("utf8");
        const encryptionXmlDoc = new xmldom.DOMParser().parseFromString(encryptionXmlStr);
        encryption = xml_js_mapper_1.XML.deserialize(encryptionXmlDoc, encryption_1.Encryption);
        encryption.ZipPath = encZipPath;
    }
    const containerZipPath = "META-INF/container.xml";
    let containerXmlZipStream_;
    try {
        containerXmlZipStream_ = await zip.entryStreamPromise(containerZipPath);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    const containerXmlZipStream = containerXmlZipStream_.stream;
    let containerXmlZipData;
    try {
        containerXmlZipData = await BufferUtils_1.streamToBufferPromise(containerXmlZipStream);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    const containerXmlStr = containerXmlZipData.toString("utf8");
    const containerXmlDoc = new xmldom.DOMParser().parseFromString(containerXmlStr);
    const container = xml_js_mapper_1.XML.deserialize(containerXmlDoc, container_1.Container);
    container.ZipPath = containerZipPath;
    const rootfile = container.Rootfile[0];
    const rootfilePathDecoded = rootfile.PathDecoded;
    if (!rootfilePathDecoded) {
        return Promise.reject("?!rootfile.PathDecoded");
    }
    has = await zipHasEntry_1.zipHasEntry(zip, rootfilePathDecoded, rootfile.Path);
    if (!has) {
        const err = `NOT IN ZIP (container OPF rootfile): ${rootfile.Path} --- ${rootfilePathDecoded}`;
        debug(err);
        const zipEntries = await zip.getEntries();
        for (const zipEntry of zipEntries) {
            debug(zipEntry);
        }
        return Promise.reject(err);
    }
    let opfZipStream_;
    try {
        opfZipStream_ = await zip.entryStreamPromise(rootfilePathDecoded);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    const opfZipStream = opfZipStream_.stream;
    let opfZipData;
    try {
        opfZipData = await BufferUtils_1.streamToBufferPromise(opfZipStream);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    const opfStr = opfZipData.toString("utf8");
    const opfDoc = new xmldom.DOMParser().parseFromString(opfStr);
    const opf = xml_js_mapper_1.XML.deserialize(opfDoc, opf_1.OPF);
    opf.ZipPath = rootfilePathDecoded;
    let ncx;
    if (opf.Spine.Toc) {
        const ncxManItem = opf.Manifest.find((manifestItem) => {
            return manifestItem.ID === opf.Spine.Toc;
        });
        if (ncxManItem) {
            const dname = path.dirname(opf.ZipPath);
            const ncxManItemHrefDecoded = ncxManItem.HrefDecoded;
            if (!ncxManItemHrefDecoded) {
                return Promise.reject("?!ncxManItem.Href");
            }
            const ncxFilePath = path.join(dname, ncxManItemHrefDecoded).replace(/\\/g, "/");
            has = await zipHasEntry_1.zipHasEntry(zip, ncxFilePath, undefined);
            if (!has) {
                const err = `NOT IN ZIP (NCX): ${ncxManItem.Href} --- ${ncxFilePath}`;
                debug(err);
                const zipEntries = await zip.getEntries();
                for (const zipEntry of zipEntries) {
                    debug(zipEntry);
                }
                return Promise.reject(err);
            }
            let ncxZipStream_;
            try {
                ncxZipStream_ = await zip.entryStreamPromise(ncxFilePath);
            }
            catch (err) {
                debug(err);
                return Promise.reject(err);
            }
            const ncxZipStream = ncxZipStream_.stream;
            let ncxZipData;
            try {
                ncxZipData = await BufferUtils_1.streamToBufferPromise(ncxZipStream);
            }
            catch (err) {
                debug(err);
                return Promise.reject(err);
            }
            const ncxStr = ncxZipData.toString("utf8");
            const ncxDoc = new xmldom.DOMParser().parseFromString(ncxStr);
            ncx = xml_js_mapper_1.XML.deserialize(ncxDoc, ncx_1.NCX);
            ncx.ZipPath = ncxFilePath;
        }
    }
    if (opf.Metadata) {
        if (opf.Metadata.Language) {
            publication.Metadata.Language = opf.Metadata.Language;
        }
    }
    addTitle(publication, rootfile, opf);
    addIdentifier(publication, rootfile, opf);
    if (opf.Metadata) {
        if (opf.Metadata.Rights && opf.Metadata.Rights.length) {
            publication.Metadata.Rights = opf.Metadata.Rights.join(" ");
        }
        if (opf.Metadata.Description && opf.Metadata.Description.length) {
            publication.Metadata.Description = opf.Metadata.Description[0];
        }
        if (opf.Metadata.Publisher && opf.Metadata.Publisher.length) {
            publication.Metadata.Publisher = [];
            opf.Metadata.Publisher.forEach((pub) => {
                const contrib = new metadata_contributor_1.Contributor();
                contrib.Name = pub;
                publication.Metadata.Publisher.push(contrib);
            });
        }
        if (opf.Metadata.Source && opf.Metadata.Source.length) {
            publication.Metadata.Source = opf.Metadata.Source[0];
        }
        if (opf.Metadata.Contributor && opf.Metadata.Contributor.length) {
            opf.Metadata.Contributor.forEach((cont) => {
                addContributor(publication, rootfile, opf, cont, undefined);
            });
        }
        if (opf.Metadata.Creator && opf.Metadata.Creator.length) {
            opf.Metadata.Creator.forEach((cont) => {
                addContributor(publication, rootfile, opf, cont, "aut");
            });
        }
        if (opf.Metadata.Link) {
            opf.Metadata.Link.forEach((metaLink) => {
                if (metaLink.Property === "a11y:certifierCredential") {
                    let val = metaLink.Href;
                    if (!val) {
                        return;
                    }
                    val = val.trim();
                    if (!val) {
                        return;
                    }
                    if (!publication.Metadata.CertifierCredential) {
                        publication.Metadata.CertifierCredential = [];
                    }
                    publication.Metadata.CertifierCredential.push(val);
                }
                else if (metaLink.Property === "a11y:certifierReport") {
                    let val = metaLink.Href;
                    if (!val) {
                        return;
                    }
                    val = val.trim();
                    if (!val) {
                        return;
                    }
                    if (!publication.Metadata.CertifierReport) {
                        publication.Metadata.CertifierReport = [];
                    }
                    publication.Metadata.CertifierReport.push(val);
                }
                else if (metaLink.Property === "dcterms:conformsTo") {
                    let val = metaLink.Href;
                    if (!val) {
                        return;
                    }
                    val = val.trim();
                    if (!val) {
                        return;
                    }
                    if (!publication.Metadata.ConformsTo) {
                        publication.Metadata.ConformsTo = [];
                    }
                    publication.Metadata.ConformsTo.push(val);
                }
            });
        }
        if (opf.Metadata.Meta) {
            const AccessibilitySummarys = [];
            opf.Metadata.Meta.forEach((metaTag) => {
                if (metaTag.Name === "schema:accessMode" ||
                    metaTag.Property === "schema:accessMode") {
                    let val = metaTag.Property ? metaTag.Data : metaTag.Content;
                    if (!val) {
                        return;
                    }
                    val = val.trim();
                    if (!val) {
                        return;
                    }
                    if (!publication.Metadata.AccessMode) {
                        publication.Metadata.AccessMode = [];
                    }
                    publication.Metadata.AccessMode.push(val);
                }
                else if (metaTag.Name === "schema:accessibilityFeature" ||
                    metaTag.Property === "schema:accessibilityFeature") {
                    let val = metaTag.Property ? metaTag.Data : metaTag.Content;
                    if (!val) {
                        return;
                    }
                    val = val.trim();
                    if (!val) {
                        return;
                    }
                    if (!publication.Metadata.AccessibilityFeature) {
                        publication.Metadata.AccessibilityFeature = [];
                    }
                    publication.Metadata.AccessibilityFeature.push(val);
                }
                else if (metaTag.Name === "schema:accessibilityHazard" ||
                    metaTag.Property === "schema:accessibilityHazard") {
                    let val = metaTag.Property ? metaTag.Data : metaTag.Content;
                    if (!val) {
                        return;
                    }
                    val = val.trim();
                    if (!val) {
                        return;
                    }
                    if (!publication.Metadata.AccessibilityHazard) {
                        publication.Metadata.AccessibilityHazard = [];
                    }
                    publication.Metadata.AccessibilityHazard.push(val);
                }
                else if (metaTag.Name === "schema:accessibilitySummary" ||
                    metaTag.Property === "schema:accessibilitySummary") {
                    let val = metaTag.Property ? metaTag.Data : metaTag.Content;
                    if (!val) {
                        return;
                    }
                    val = val.trim();
                    if (!val) {
                        return;
                    }
                    AccessibilitySummarys.push({
                        metaTag,
                        val,
                    });
                }
                else if (metaTag.Name === "schema:accessModeSufficient" ||
                    metaTag.Property === "schema:accessModeSufficient") {
                    let val = metaTag.Property ? metaTag.Data : metaTag.Content;
                    if (!val) {
                        return;
                    }
                    val = val.trim();
                    if (!val) {
                        return;
                    }
                    if (!publication.Metadata.AccessModeSufficient) {
                        publication.Metadata.AccessModeSufficient = [];
                    }
                    publication.Metadata.AccessModeSufficient.push(ta_json_string_tokens_converter_1.DelinearizeAccessModeSufficient(val));
                }
                else if (metaTag.Name === "schema:accessibilityAPI" ||
                    metaTag.Property === "schema:accessibilityAPI") {
                    let val = metaTag.Property ? metaTag.Data : metaTag.Content;
                    if (!val) {
                        return;
                    }
                    val = val.trim();
                    if (!val) {
                        return;
                    }
                    if (!publication.Metadata.AccessibilityAPI) {
                        publication.Metadata.AccessibilityAPI = [];
                    }
                    publication.Metadata.AccessibilityAPI.push(val);
                }
                else if (metaTag.Name === "schema:accessibilityControl" ||
                    metaTag.Property === "schema:accessibilityControl") {
                    let val = metaTag.Property ? metaTag.Data : metaTag.Content;
                    if (!val) {
                        return;
                    }
                    val = val.trim();
                    if (!val) {
                        return;
                    }
                    if (!publication.Metadata.AccessibilityControl) {
                        publication.Metadata.AccessibilityControl = [];
                    }
                    publication.Metadata.AccessibilityControl.push(val);
                }
                else if (metaTag.Name === "a11y:certifiedBy" ||
                    metaTag.Property === "a11y:certifiedBy") {
                    let val = metaTag.Property ? metaTag.Data : metaTag.Content;
                    if (!val) {
                        return;
                    }
                    val = val.trim();
                    if (!val) {
                        return;
                    }
                    if (!publication.Metadata.CertifiedBy) {
                        publication.Metadata.CertifiedBy = [];
                    }
                    publication.Metadata.CertifiedBy.push(val);
                }
                else if (metaTag.Name === "a11y:certifierCredential" ||
                    metaTag.Property === "a11y:certifierCredential") {
                    let val = metaTag.Property ? metaTag.Data : metaTag.Content;
                    if (!val) {
                        return;
                    }
                    val = val.trim();
                    if (!val) {
                        return;
                    }
                    if (!publication.Metadata.CertifierCredential) {
                        publication.Metadata.CertifierCredential = [];
                    }
                    publication.Metadata.CertifierCredential.push(val);
                }
            });
            if (AccessibilitySummarys.length === 1) {
                const tuple = AccessibilitySummarys[0];
                if (tuple.metaTag.Lang) {
                    publication.Metadata.AccessibilitySummary = {};
                    publication.Metadata.AccessibilitySummary[tuple.metaTag.Lang.toLowerCase()] = tuple.val;
                }
                else {
                    publication.Metadata.AccessibilitySummary = tuple.val;
                }
            }
            else if (AccessibilitySummarys.length) {
                publication.Metadata.AccessibilitySummary = {};
                AccessibilitySummarys.forEach((tuple) => {
                    const xmlLang = tuple.metaTag.Lang || opf.Lang;
                    if (xmlLang) {
                        publication.Metadata.AccessibilitySummary[xmlLang.toLowerCase()] = tuple.val;
                    }
                    else if (publication.Metadata.Language &&
                        publication.Metadata.Language.length &&
                        !publication.Metadata.AccessibilitySummary[publication.Metadata.Language[0].toLowerCase()]) {
                        publication.Metadata.AccessibilitySummary[publication.Metadata.Language[0].toLowerCase()] = tuple.val;
                    }
                    else {
                        publication.Metadata.AccessibilitySummary[exports.BCP47_UNKNOWN_LANG] = tuple.val;
                    }
                });
            }
            const metasDuration = [];
            const metasNarrator = [];
            const metasActiveClass = [];
            const metasPlaybackActiveClass = [];
            opf.Metadata.Meta.forEach((metaTag) => {
                if (metaTag.Property === "media:duration" && !metaTag.Refine) {
                    metasDuration.push(metaTag);
                }
                if (metaTag.Property === "media:narrator") {
                    metasNarrator.push(metaTag);
                }
                if (metaTag.Property === "media:active-class") {
                    metasActiveClass.push(metaTag);
                }
                if (metaTag.Property === "media:playback-active-class") {
                    metasPlaybackActiveClass.push(metaTag);
                }
            });
            if (metasDuration.length) {
                publication.Metadata.Duration = media_overlay_1.timeStrToSeconds(metasDuration[0].Data);
            }
            if (metasNarrator.length) {
                if (!publication.Metadata.Narrator) {
                    publication.Metadata.Narrator = [];
                }
                metasNarrator.forEach((metaNarrator) => {
                    const cont = new metadata_contributor_1.Contributor();
                    cont.Name = metaNarrator.Data;
                    publication.Metadata.Narrator.push(cont);
                });
            }
            if (metasActiveClass.length) {
                if (!publication.Metadata.MediaOverlay) {
                    publication.Metadata.MediaOverlay = new metadata_media_overlay_1.MediaOverlay();
                }
                publication.Metadata.MediaOverlay.ActiveClass = metasActiveClass[0].Data;
            }
            if (metasPlaybackActiveClass.length) {
                if (!publication.Metadata.MediaOverlay) {
                    publication.Metadata.MediaOverlay = new metadata_media_overlay_1.MediaOverlay();
                }
                publication.Metadata.MediaOverlay.PlaybackActiveClass = metasPlaybackActiveClass[0].Data;
            }
        }
    }
    if (opf.Spine && opf.Spine.PageProgression) {
        switch (opf.Spine.PageProgression) {
            case "auto": {
                publication.Metadata.Direction = metadata_1.DirectionEnum.Auto;
                break;
            }
            case "ltr": {
                publication.Metadata.Direction = metadata_1.DirectionEnum.LTR;
                break;
            }
            case "rtl": {
                publication.Metadata.Direction = metadata_1.DirectionEnum.RTL;
                break;
            }
        }
    }
    if (publication.Metadata.Language && publication.Metadata.Language.length &&
        (!publication.Metadata.Direction || publication.Metadata.Direction === metadata_1.DirectionEnum.Auto)) {
        const lang = publication.Metadata.Language[0].toLowerCase();
        if ((lang === "ar" || lang.startsWith("ar-") ||
            lang === "he" || lang.startsWith("he-") ||
            lang === "fa" || lang.startsWith("fa-")) ||
            lang === "zh-Hant" ||
            lang === "zh-TW") {
            publication.Metadata.Direction = metadata_1.DirectionEnum.RTL;
        }
    }
    if (isEpub3OrMore(rootfile, opf)) {
        findContributorInMeta(publication, rootfile, opf);
    }
    await fillSpineAndResource(publication, rootfile, opf, zip);
    await addRendition(publication, rootfile, opf, zip);
    await addCoverRel(publication, rootfile, opf, zip);
    if (encryption) {
        fillEncryptionInfo(publication, rootfile, opf, encryption, lcpl);
    }
    await fillTOCFromNavDoc(publication, rootfile, opf, zip);
    if (!publication.TOC || !publication.TOC.length) {
        if (ncx) {
            fillTOCFromNCX(publication, rootfile, opf, ncx);
            if (!publication.PageList) {
                fillPageListFromNCX(publication, rootfile, opf, ncx);
            }
        }
        fillLandmarksFromGuide(publication, rootfile, opf);
    }
    if (!publication.PageList && publication.Resources) {
        const pageMapLink = publication.Resources.find((item) => {
            return item.TypeLink === "application/oebps-page-map+xml";
        });
        if (pageMapLink) {
            await fillPageListFromAdobePageMap(publication, rootfile, opf, zip, pageMapLink);
        }
    }
    fillCalibreSerieInfo(publication, rootfile, opf);
    fillSubject(publication, rootfile, opf);
    fillPublicationDate(publication, rootfile, opf);
    return publication;
}
exports.EpubParsePromise = EpubParsePromise;
async function getAllMediaOverlays(publication) {
    const mos = [];
    const links = [].
        concat(publication.Spine ? publication.Spine : []).
        concat(publication.Resources ? publication.Resources : []);
    for (const link of links) {
        if (link.MediaOverlays) {
            const mo = link.MediaOverlays;
            if (!mo.initialized) {
                try {
                    await exports.lazyLoadMediaOverlays(publication, mo);
                }
                catch (err) {
                    return Promise.reject(err);
                }
            }
            mos.push(mo);
        }
    }
    return Promise.resolve(mos);
}
exports.getAllMediaOverlays = getAllMediaOverlays;
async function getMediaOverlay(publication, spineHref) {
    const links = [].
        concat(publication.Spine ? publication.Spine : []).
        concat(publication.Resources ? publication.Resources : []);
    for (const link of links) {
        if (link.MediaOverlays && link.Href.indexOf(spineHref) >= 0) {
            const mo = link.MediaOverlays;
            if (!mo.initialized) {
                try {
                    await exports.lazyLoadMediaOverlays(publication, mo);
                }
                catch (err) {
                    return Promise.reject(err);
                }
            }
            return Promise.resolve(mo);
        }
    }
    return Promise.reject(`No Media Overlays ${spineHref}`);
}
exports.getMediaOverlay = getMediaOverlay;
exports.lazyLoadMediaOverlays = async (publication, mo) => {
    if (mo.initialized || !mo.SmilPathInZip) {
        return;
    }
    let link;
    if (publication.Resources) {
        link = publication.Resources.find((l) => {
            if (l.Href === mo.SmilPathInZip) {
                return true;
            }
            return false;
        });
        if (!link) {
            if (publication.Spine) {
                link = publication.Spine.find((l) => {
                    if (l.Href === mo.SmilPathInZip) {
                        return true;
                    }
                    return false;
                });
            }
        }
        if (!link) {
            const err = "Asset not declared in publication spine/resources! " + mo.SmilPathInZip;
            debug(err);
            return Promise.reject(err);
        }
    }
    const zipInternal = publication.findFromInternal("zip");
    if (!zipInternal) {
        return;
    }
    const zip = zipInternal.Value;
    const has = await zipHasEntry_1.zipHasEntry(zip, mo.SmilPathInZip, undefined);
    if (!has) {
        const err = `NOT IN ZIP (lazyLoadMediaOverlays): ${mo.SmilPathInZip}`;
        debug(err);
        const zipEntries = await zip.getEntries();
        for (const zipEntry of zipEntries) {
            debug(zipEntry);
        }
        return Promise.reject(err);
    }
    let smilZipStream_;
    try {
        smilZipStream_ = await zip.entryStreamPromise(mo.SmilPathInZip);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    if (link && link.Properties && link.Properties.Encrypted) {
        let decryptFail = false;
        let transformedStream;
        try {
            transformedStream = await transformer_1.Transformers.tryStream(publication, link, undefined, smilZipStream_, false, 0, 0, undefined);
        }
        catch (err) {
            debug(err);
            return Promise.reject(err);
        }
        if (transformedStream) {
            smilZipStream_ = transformedStream;
        }
        else {
            decryptFail = true;
        }
        if (decryptFail) {
            const err = "Encryption scheme not supported.";
            debug(err);
            return Promise.reject(err);
        }
    }
    const smilZipStream = smilZipStream_.stream;
    let smilZipData;
    try {
        smilZipData = await BufferUtils_1.streamToBufferPromise(smilZipStream);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    const smilStr = smilZipData.toString("utf8");
    const smilXmlDoc = new xmldom.DOMParser().parseFromString(smilStr);
    const smil = xml_js_mapper_1.XML.deserialize(smilXmlDoc, smil_1.SMIL);
    smil.ZipPath = mo.SmilPathInZip;
    mo.initialized = true;
    debug("PARSED SMIL: " + mo.SmilPathInZip);
    mo.Role = [];
    mo.Role.push("section");
    if (smil.Body) {
        if (smil.Body.EpubType) {
            const roles = parseSpaceSeparatedString(smil.Body.EpubType);
            for (const role of roles) {
                if (!role.length) {
                    return;
                }
                if (mo.Role.indexOf(role) < 0) {
                    mo.Role.push(role);
                }
            }
        }
        if (smil.Body.TextRef) {
            const smilBodyTextRefDecoded = smil.Body.TextRefDecoded;
            if (!smilBodyTextRefDecoded) {
                debug("!?smilBodyTextRefDecoded");
            }
            else {
                const zipPath = path.join(path.dirname(smil.ZipPath), smilBodyTextRefDecoded)
                    .replace(/\\/g, "/");
                mo.Text = zipPath;
            }
        }
        if (smil.Body.Children && smil.Body.Children.length) {
            smil.Body.Children.forEach((seqChild) => {
                if (!mo.Children) {
                    mo.Children = [];
                }
                addSeqToMediaOverlay(smil, publication, mo, mo.Children, seqChild);
            });
        }
    }
    return;
};
const addSeqToMediaOverlay = (smil, publication, rootMO, mo, seqChild) => {
    if (!smil.ZipPath) {
        return;
    }
    const moc = new media_overlay_1.MediaOverlayNode();
    moc.initialized = rootMO.initialized;
    mo.push(moc);
    if (seqChild instanceof smil_seq_1.Seq) {
        moc.Role = [];
        moc.Role.push("section");
        const seq = seqChild;
        if (seq.EpubType) {
            const roles = parseSpaceSeparatedString(seq.EpubType);
            for (const role of roles) {
                if (!role.length) {
                    return;
                }
                if (moc.Role.indexOf(role) < 0) {
                    moc.Role.push(role);
                }
            }
        }
        if (seq.TextRef) {
            const seqTextRefDecoded = seq.TextRefDecoded;
            if (!seqTextRefDecoded) {
                debug("!?seqTextRefDecoded");
            }
            else {
                const zipPath = path.join(path.dirname(smil.ZipPath), seqTextRefDecoded)
                    .replace(/\\/g, "/");
                moc.Text = zipPath;
            }
        }
        if (seq.Children && seq.Children.length) {
            seq.Children.forEach((child) => {
                if (!moc.Children) {
                    moc.Children = [];
                }
                addSeqToMediaOverlay(smil, publication, rootMO, moc.Children, child);
            });
        }
    }
    else {
        const par = seqChild;
        if (par.EpubType) {
            const roles = parseSpaceSeparatedString(par.EpubType);
            for (const role of roles) {
                if (!role.length) {
                    return;
                }
                if (!moc.Role) {
                    moc.Role = [];
                }
                if (moc.Role.indexOf(role) < 0) {
                    moc.Role.push(role);
                }
            }
        }
        if (par.Text && par.Text.Src) {
            const parTextSrcDcoded = par.Text.SrcDecoded;
            if (!parTextSrcDcoded) {
                debug("?!parTextSrcDcoded");
            }
            else {
                const zipPath = path.join(path.dirname(smil.ZipPath), parTextSrcDcoded)
                    .replace(/\\/g, "/");
                moc.Text = zipPath;
            }
        }
        if (par.Audio && par.Audio.Src) {
            const parAudioSrcDcoded = par.Audio.SrcDecoded;
            if (!parAudioSrcDcoded) {
                debug("?!parAudioSrcDcoded");
            }
            else {
                const zipPath = path.join(path.dirname(smil.ZipPath), parAudioSrcDcoded)
                    .replace(/\\/g, "/");
                moc.Audio = zipPath;
                moc.Audio += "#t=";
                moc.Audio += par.Audio.ClipBegin ? media_overlay_1.timeStrToSeconds(par.Audio.ClipBegin) : "0";
                if (par.Audio.ClipEnd) {
                    moc.Audio += ",";
                    moc.Audio += media_overlay_1.timeStrToSeconds(par.Audio.ClipEnd);
                }
            }
        }
    }
};
const fillPublicationDate = (publication, rootfile, opf) => {
    if (opf.Metadata && opf.Metadata.Date && opf.Metadata.Date.length) {
        if (isEpub3OrMore(rootfile, opf) && opf.Metadata.Date[0] && opf.Metadata.Date[0].Data) {
            const token = opf.Metadata.Date[0].Data;
            try {
                const mom = moment(token);
                if (mom.isValid()) {
                    publication.Metadata.PublicationDate = mom.toDate();
                }
            }
            catch (err) {
                debug("INVALID DATE/TIME? " + token);
            }
            return;
        }
        opf.Metadata.Date.forEach((date) => {
            if (date.Data && date.Event && date.Event.indexOf("publication") >= 0) {
                const token = date.Data;
                try {
                    const mom = moment(token);
                    if (mom.isValid()) {
                        publication.Metadata.PublicationDate = mom.toDate();
                    }
                }
                catch (err) {
                    debug("INVALID DATE/TIME? " + token);
                }
            }
        });
    }
};
const findContributorInMeta = (publication, rootfile, opf) => {
    if (opf.Metadata && opf.Metadata.Meta) {
        opf.Metadata.Meta.forEach((meta) => {
            if (meta.Property === "dcterms:creator" || meta.Property === "dcterms:contributor") {
                const cont = new opf_author_1.Author();
                cont.Data = meta.Data;
                cont.ID = meta.ID;
                addContributor(publication, rootfile, opf, cont, undefined);
            }
        });
    }
};
const addContributor = (publication, rootfile, opf, cont, forcedRole) => {
    const contributor = new metadata_contributor_1.Contributor();
    let role;
    if (isEpub3OrMore(rootfile, opf)) {
        if (cont.FileAs) {
            contributor.SortAs = cont.FileAs;
        }
        else {
            const metaFileAs = findMetaByRefineAndProperty(rootfile, opf, cont.ID, "file-as");
            if (metaFileAs && metaFileAs.Property === "file-as") {
                contributor.SortAs = metaFileAs.Data;
            }
        }
        const metaRole = findMetaByRefineAndProperty(rootfile, opf, cont.ID, "role");
        if (metaRole && metaRole.Property === "role") {
            role = metaRole.Data;
        }
        if (!role && forcedRole) {
            role = forcedRole;
        }
        const metaAlt = findAllMetaByRefineAndProperty(rootfile, opf, cont.ID, "alternate-script");
        if (metaAlt && metaAlt.length) {
            contributor.Name = {};
            metaAlt.forEach((m) => {
                if (m.Lang) {
                    contributor.Name[m.Lang] = m.Data;
                }
            });
            const xmlLang = cont.Lang || opf.Lang;
            if (xmlLang) {
                contributor.Name[xmlLang.toLowerCase()] = cont.Data;
            }
            else if (publication.Metadata &&
                publication.Metadata.Language &&
                publication.Metadata.Language.length &&
                !contributor.Name[publication.Metadata.Language[0].toLowerCase()]) {
                contributor.Name[publication.Metadata.Language[0].toLowerCase()] = cont.Data;
            }
            else {
                contributor.Name[exports.BCP47_UNKNOWN_LANG] = cont.Data;
            }
        }
        else {
            contributor.Name = cont.Data;
        }
    }
    else {
        contributor.Name = cont.Data;
        role = cont.Role;
        if (!role && forcedRole) {
            role = forcedRole;
        }
    }
    if (role) {
        switch (role) {
            case "aut": {
                if (!publication.Metadata.Author) {
                    publication.Metadata.Author = [];
                }
                publication.Metadata.Author.push(contributor);
                break;
            }
            case "trl": {
                if (!publication.Metadata.Translator) {
                    publication.Metadata.Translator = [];
                }
                publication.Metadata.Translator.push(contributor);
                break;
            }
            case "art": {
                if (!publication.Metadata.Artist) {
                    publication.Metadata.Artist = [];
                }
                publication.Metadata.Artist.push(contributor);
                break;
            }
            case "edt": {
                if (!publication.Metadata.Editor) {
                    publication.Metadata.Editor = [];
                }
                publication.Metadata.Editor.push(contributor);
                break;
            }
            case "ill": {
                if (!publication.Metadata.Illustrator) {
                    publication.Metadata.Illustrator = [];
                }
                publication.Metadata.Illustrator.push(contributor);
                break;
            }
            case "ltr": {
                if (!publication.Metadata.Letterer) {
                    publication.Metadata.Letterer = [];
                }
                publication.Metadata.Letterer.push(contributor);
                break;
            }
            case "pen": {
                if (!publication.Metadata.Penciler) {
                    publication.Metadata.Penciler = [];
                }
                publication.Metadata.Penciler.push(contributor);
                break;
            }
            case "clr": {
                if (!publication.Metadata.Colorist) {
                    publication.Metadata.Colorist = [];
                }
                publication.Metadata.Colorist.push(contributor);
                break;
            }
            case "ink": {
                if (!publication.Metadata.Inker) {
                    publication.Metadata.Inker = [];
                }
                publication.Metadata.Inker.push(contributor);
                break;
            }
            case "nrt": {
                if (!publication.Metadata.Narrator) {
                    publication.Metadata.Narrator = [];
                }
                publication.Metadata.Narrator.push(contributor);
                break;
            }
            case "pbl": {
                if (!publication.Metadata.Publisher) {
                    publication.Metadata.Publisher = [];
                }
                publication.Metadata.Publisher.push(contributor);
                break;
            }
            default: {
                contributor.Role = [role];
                if (!publication.Metadata.Contributor) {
                    publication.Metadata.Contributor = [];
                }
                publication.Metadata.Contributor.push(contributor);
            }
        }
    }
};
const addIdentifier = (publication, _rootfile, opf) => {
    if (opf.Metadata && opf.Metadata.Identifier) {
        if (opf.UniqueIdentifier && opf.Metadata.Identifier.length > 1) {
            opf.Metadata.Identifier.forEach((iden) => {
                if (iden.ID === opf.UniqueIdentifier) {
                    publication.Metadata.Identifier = iden.Data;
                }
            });
        }
        else if (opf.Metadata.Identifier.length > 0) {
            publication.Metadata.Identifier = opf.Metadata.Identifier[0].Data;
        }
    }
};
const addTitle = (publication, rootfile, opf) => {
    if (isEpub3OrMore(rootfile, opf)) {
        let mainTitle;
        let subTitle;
        let subTitleDisplaySeq = 0;
        if (opf.Metadata &&
            opf.Metadata.Title &&
            opf.Metadata.Title.length) {
            if (opf.Metadata.Meta) {
                const tt = opf.Metadata.Title.find((title) => {
                    const refineID = "#" + title.ID;
                    const m = opf.Metadata.Meta.find((meta) => {
                        if (meta.Data === "main" && meta.Refine === refineID) {
                            return true;
                        }
                        return false;
                    });
                    if (m) {
                        return true;
                    }
                    return false;
                });
                if (tt) {
                    mainTitle = tt;
                }
                opf.Metadata.Title.forEach((title) => {
                    const refineID = "#" + title.ID;
                    const m = opf.Metadata.Meta.find((meta) => {
                        if (meta.Data === "subtitle" && meta.Refine === refineID) {
                            return true;
                        }
                        return false;
                    });
                    if (m) {
                        let titleDisplaySeq = 0;
                        const mds = opf.Metadata.Meta.find((meta) => {
                            if (meta.Property === "display-seq" && meta.Refine === refineID) {
                                return true;
                            }
                            return false;
                        });
                        if (mds) {
                            try {
                                titleDisplaySeq = parseInt(mds.Data, 10);
                            }
                            catch (err) {
                                debug(err);
                                debug(mds.Data);
                                titleDisplaySeq = 0;
                            }
                            if (isNaN(titleDisplaySeq)) {
                                debug("NaN");
                                debug(mds.Data);
                                titleDisplaySeq = 0;
                            }
                        }
                        else {
                            titleDisplaySeq = 0;
                        }
                        if (!subTitle || titleDisplaySeq < subTitleDisplaySeq) {
                            subTitle = title;
                            subTitleDisplaySeq = titleDisplaySeq;
                        }
                    }
                });
            }
            if (!mainTitle) {
                mainTitle = opf.Metadata.Title[0];
            }
        }
        if (mainTitle) {
            const metaAlt = findAllMetaByRefineAndProperty(rootfile, opf, mainTitle.ID, "alternate-script");
            if (metaAlt && metaAlt.length) {
                publication.Metadata.Title = {};
                metaAlt.forEach((m) => {
                    if (m.Lang) {
                        publication.Metadata.Title[m.Lang.toLowerCase()] = m.Data;
                    }
                });
                const xmlLang = mainTitle.Lang || opf.Lang;
                if (xmlLang) {
                    publication.Metadata.Title[xmlLang.toLowerCase()] = mainTitle.Data;
                }
                else if (publication.Metadata.Language &&
                    publication.Metadata.Language.length &&
                    !publication.Metadata.Title[publication.Metadata.Language[0].toLowerCase()]) {
                    publication.Metadata.Title[publication.Metadata.Language[0].toLowerCase()] = mainTitle.Data;
                }
                else {
                    publication.Metadata.Title[exports.BCP47_UNKNOWN_LANG] = mainTitle.Data;
                }
            }
            else {
                publication.Metadata.Title = mainTitle.Data;
            }
        }
        if (subTitle) {
            const metaAlt = findAllMetaByRefineAndProperty(rootfile, opf, subTitle.ID, "alternate-script");
            if (metaAlt && metaAlt.length) {
                publication.Metadata.SubTitle = {};
                metaAlt.forEach((m) => {
                    if (m.Lang) {
                        publication.Metadata.SubTitle[m.Lang.toLowerCase()] = m.Data;
                    }
                });
                const xmlLang = subTitle.Lang || opf.Lang;
                if (xmlLang) {
                    publication.Metadata.SubTitle[xmlLang.toLowerCase()] = subTitle.Data;
                }
                else if (publication.Metadata.Language &&
                    publication.Metadata.Language.length &&
                    !publication.Metadata.SubTitle[publication.Metadata.Language[0].toLowerCase()]) {
                    publication.Metadata.SubTitle[publication.Metadata.Language[0].toLowerCase()] = subTitle.Data;
                }
                else {
                    publication.Metadata.SubTitle[exports.BCP47_UNKNOWN_LANG] = subTitle.Data;
                }
            }
            else {
                publication.Metadata.SubTitle = subTitle.Data;
            }
        }
    }
    else {
        if (opf.Metadata &&
            opf.Metadata.Title &&
            opf.Metadata.Title.length) {
            publication.Metadata.Title = opf.Metadata.Title[0].Data;
        }
    }
};
const addRelAndPropertiesToLink = async (publication, link, linkEpub, rootfile, opf) => {
    if (linkEpub.Properties) {
        await addToLinkFromProperties(publication, link, linkEpub.Properties);
    }
    const spineProperties = findPropertiesInSpineForManifest(linkEpub, rootfile, opf);
    if (spineProperties) {
        await addToLinkFromProperties(publication, link, spineProperties);
    }
};
const addToLinkFromProperties = async (publication, link, propertiesString) => {
    const properties = parseSpaceSeparatedString(propertiesString);
    const propertiesStruct = new metadata_properties_1.Properties();
    for (const p of properties) {
        switch (p) {
            case "cover-image": {
                link.AddRel("cover");
                await exports.addCoverDimensions(publication, link);
                break;
            }
            case "nav": {
                link.AddRel("contents");
                break;
            }
            case "scripted": {
                if (!propertiesStruct.Contains) {
                    propertiesStruct.Contains = [];
                }
                propertiesStruct.Contains.push("js");
                break;
            }
            case "mathml": {
                if (!propertiesStruct.Contains) {
                    propertiesStruct.Contains = [];
                }
                propertiesStruct.Contains.push("mathml");
                break;
            }
            case "onix-record": {
                if (!propertiesStruct.Contains) {
                    propertiesStruct.Contains = [];
                }
                propertiesStruct.Contains.push("onix");
                break;
            }
            case "svg": {
                if (!propertiesStruct.Contains) {
                    propertiesStruct.Contains = [];
                }
                propertiesStruct.Contains.push("svg");
                break;
            }
            case "xmp-record": {
                if (!propertiesStruct.Contains) {
                    propertiesStruct.Contains = [];
                }
                propertiesStruct.Contains.push("xmp");
                break;
            }
            case "remote-resources": {
                if (!propertiesStruct.Contains) {
                    propertiesStruct.Contains = [];
                }
                propertiesStruct.Contains.push("remote-resources");
                break;
            }
            case "page-spread-left": {
                propertiesStruct.Page = metadata_properties_1.PageEnum.Left;
                break;
            }
            case "page-spread-right": {
                propertiesStruct.Page = metadata_properties_1.PageEnum.Right;
                break;
            }
            case "page-spread-center": {
                propertiesStruct.Page = metadata_properties_1.PageEnum.Center;
                break;
            }
            case "rendition:spread-none": {
                propertiesStruct.Spread = metadata_properties_1.SpreadEnum.None;
                break;
            }
            case "rendition:spread-auto": {
                propertiesStruct.Spread = metadata_properties_1.SpreadEnum.Auto;
                break;
            }
            case "rendition:spread-landscape": {
                propertiesStruct.Spread = metadata_properties_1.SpreadEnum.Landscape;
                break;
            }
            case "rendition:spread-portrait": {
                propertiesStruct.Spread = metadata_properties_1.SpreadEnum.Both;
                break;
            }
            case "rendition:spread-both": {
                propertiesStruct.Spread = metadata_properties_1.SpreadEnum.Both;
                break;
            }
            case "rendition:layout-reflowable": {
                propertiesStruct.Layout = metadata_properties_1.LayoutEnum.Reflowable;
                break;
            }
            case "rendition:layout-pre-paginated": {
                propertiesStruct.Layout = metadata_properties_1.LayoutEnum.Fixed;
                break;
            }
            case "rendition:orientation-auto": {
                propertiesStruct.Orientation = metadata_properties_1.OrientationEnum.Auto;
                break;
            }
            case "rendition:orientation-landscape": {
                propertiesStruct.Orientation = metadata_properties_1.OrientationEnum.Landscape;
                break;
            }
            case "rendition:orientation-portrait": {
                propertiesStruct.Orientation = metadata_properties_1.OrientationEnum.Portrait;
                break;
            }
            case "rendition:flow-auto": {
                propertiesStruct.Overflow = metadata_properties_1.OverflowEnum.Auto;
                break;
            }
            case "rendition:flow-paginated": {
                propertiesStruct.Overflow = metadata_properties_1.OverflowEnum.Paginated;
                break;
            }
            case "rendition:flow-scrolled-continuous": {
                propertiesStruct.Overflow = metadata_properties_1.OverflowEnum.ScrolledContinuous;
                break;
            }
            case "rendition:flow-scrolled-doc": {
                propertiesStruct.Overflow = metadata_properties_1.OverflowEnum.Scrolled;
                break;
            }
            default: {
                break;
            }
        }
        if (propertiesStruct.Layout ||
            propertiesStruct.Orientation ||
            propertiesStruct.Overflow ||
            propertiesStruct.Page ||
            propertiesStruct.Spread ||
            (propertiesStruct.Contains && propertiesStruct.Contains.length)) {
            link.Properties = propertiesStruct;
        }
    }
};
const addMediaOverlay = async (link, linkEpub, rootfile, opf, zip) => {
    if (linkEpub.MediaOverlay) {
        const meta = findMetaByRefineAndProperty(rootfile, opf, linkEpub.MediaOverlay, "media:duration");
        if (meta) {
            link.Duration = media_overlay_1.timeStrToSeconds(meta.Data);
        }
        const manItemSmil = opf.Manifest.find((mi) => {
            if (mi.ID === linkEpub.MediaOverlay) {
                return true;
            }
            return false;
        });
        if (manItemSmil && manItemSmil.MediaType === "application/smil+xml") {
            if (opf.ZipPath) {
                const manItemSmilHrefDecoded = manItemSmil.HrefDecoded;
                if (!manItemSmilHrefDecoded) {
                    debug("!?manItemSmil.HrefDecoded");
                    return;
                }
                const smilFilePath = path.join(path.dirname(opf.ZipPath), manItemSmilHrefDecoded)
                    .replace(/\\/g, "/");
                const has = await zipHasEntry_1.zipHasEntry(zip, smilFilePath, smilFilePath);
                if (!has) {
                    debug(`NOT IN ZIP (addMediaOverlay): ${smilFilePath}`);
                    const zipEntries = await zip.getEntries();
                    for (const zipEntry of zipEntries) {
                        debug(zipEntry);
                    }
                    return;
                }
                const mo = new media_overlay_1.MediaOverlayNode();
                mo.SmilPathInZip = smilFilePath;
                mo.initialized = false;
                link.MediaOverlays = mo;
                const moURL = exports.mediaOverlayURLPath + "?" +
                    exports.mediaOverlayURLParam + "=" +
                    UrlUtils_1.encodeURIComponent_RFC3986(link.HrefDecoded ? link.HrefDecoded : link.Href);
                if (!link.Properties) {
                    link.Properties = new metadata_properties_1.Properties();
                }
                link.Properties.MediaOverlay = moURL;
                if (!link.Alternate) {
                    link.Alternate = [];
                }
                const moLink = new publication_link_1.Link();
                moLink.Href = moURL;
                moLink.TypeLink = "application/vnd.syncnarr+json";
                moLink.Duration = link.Duration;
                link.Alternate.push(moLink);
                if (link.Properties && link.Properties.Encrypted) {
                    debug("ENCRYPTED SMIL MEDIA OVERLAY: " + (link.HrefDecoded ? link.HrefDecoded : link.Href));
                }
            }
        }
    }
};
const findInManifestByID = async (publication, rootfile, opf, ID, zip) => {
    if (opf.Manifest && opf.Manifest.length) {
        const item = opf.Manifest.find((manItem) => {
            if (manItem.ID === ID) {
                return true;
            }
            return false;
        });
        if (item && opf.ZipPath) {
            const linkItem = new publication_link_1.Link();
            linkItem.TypeLink = item.MediaType;
            const itemHrefDecoded = item.HrefDecoded;
            if (!itemHrefDecoded) {
                return Promise.reject("item.Href?!");
            }
            linkItem.setHrefDecoded(path.join(path.dirname(opf.ZipPath), itemHrefDecoded)
                .replace(/\\/g, "/"));
            await addRelAndPropertiesToLink(publication, linkItem, item, rootfile, opf);
            await addMediaOverlay(linkItem, item, rootfile, opf, zip);
            return linkItem;
        }
    }
    return Promise.reject(`ID ${ID} not found`);
};
const addRendition = async (publication, _rootfile, opf, zip) => {
    if (opf.Metadata && opf.Metadata.Meta && opf.Metadata.Meta.length) {
        const rendition = new metadata_properties_1.Properties();
        opf.Metadata.Meta.forEach((meta) => {
            switch (meta.Property) {
                case "rendition:layout": {
                    switch (meta.Data) {
                        case "pre-paginated": {
                            rendition.Layout = metadata_properties_1.LayoutEnum.Fixed;
                            break;
                        }
                        case "reflowable": {
                            rendition.Layout = metadata_properties_1.LayoutEnum.Reflowable;
                            break;
                        }
                    }
                    break;
                }
                case "rendition:orientation": {
                    switch (meta.Data) {
                        case "auto": {
                            rendition.Orientation = metadata_properties_1.OrientationEnum.Auto;
                            break;
                        }
                        case "landscape": {
                            rendition.Orientation = metadata_properties_1.OrientationEnum.Landscape;
                            break;
                        }
                        case "portrait": {
                            rendition.Orientation = metadata_properties_1.OrientationEnum.Portrait;
                            break;
                        }
                    }
                    break;
                }
                case "rendition:spread": {
                    switch (meta.Data) {
                        case "auto": {
                            rendition.Spread = metadata_properties_1.SpreadEnum.Auto;
                            break;
                        }
                        case "both": {
                            rendition.Spread = metadata_properties_1.SpreadEnum.Both;
                            break;
                        }
                        case "none": {
                            rendition.Spread = metadata_properties_1.SpreadEnum.None;
                            break;
                        }
                        case "landscape": {
                            rendition.Spread = metadata_properties_1.SpreadEnum.Landscape;
                            break;
                        }
                        case "portrait": {
                            rendition.Spread = metadata_properties_1.SpreadEnum.Both;
                            break;
                        }
                    }
                    break;
                }
                case "rendition:flow": {
                    switch (meta.Data) {
                        case "auto": {
                            rendition.Overflow = metadata_properties_1.OverflowEnum.Auto;
                            break;
                        }
                        case "paginated": {
                            rendition.Overflow = metadata_properties_1.OverflowEnum.Paginated;
                            break;
                        }
                        case "scrolled": {
                            rendition.Overflow = metadata_properties_1.OverflowEnum.Scrolled;
                            break;
                        }
                        case "scrolled-continuous": {
                            rendition.Overflow = metadata_properties_1.OverflowEnum.ScrolledContinuous;
                            break;
                        }
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        });
        if (!rendition.Layout || !rendition.Orientation) {
            let displayOptionsZipPath = "META-INF/com.apple.ibooks.display-options.xml";
            let has = await zipHasEntry_1.zipHasEntry(zip, displayOptionsZipPath, undefined);
            if (has) {
                debug("Info: found iBooks display-options XML");
            }
            else {
                displayOptionsZipPath = "META-INF/com.kobobooks.display-options.xml";
                has = await zipHasEntry_1.zipHasEntry(zip, displayOptionsZipPath, undefined);
                if (has) {
                    debug("Info: found Kobo display-options XML");
                }
            }
            if (!has) {
                debug("Info: not found iBooks or Kobo display-options XML");
            }
            else {
                let displayOptionsZipStream_;
                try {
                    displayOptionsZipStream_ = await zip.entryStreamPromise(displayOptionsZipPath);
                }
                catch (err) {
                    debug(err);
                }
                if (displayOptionsZipStream_) {
                    const displayOptionsZipStream = displayOptionsZipStream_.stream;
                    let displayOptionsZipData;
                    try {
                        displayOptionsZipData = await BufferUtils_1.streamToBufferPromise(displayOptionsZipStream);
                    }
                    catch (err) {
                        debug(err);
                    }
                    if (displayOptionsZipData) {
                        try {
                            const displayOptionsStr = displayOptionsZipData.toString("utf8");
                            const displayOptionsDoc = new xmldom.DOMParser().parseFromString(displayOptionsStr);
                            const displayOptions = xml_js_mapper_1.XML.deserialize(displayOptionsDoc, display_options_1.DisplayOptions);
                            displayOptions.ZipPath = displayOptionsZipPath;
                            if (displayOptions && displayOptions.Platforms) {
                                const renditionPlatformAll = new metadata_properties_1.Properties();
                                const renditionPlatformIpad = new metadata_properties_1.Properties();
                                const renditionPlatformIphone = new metadata_properties_1.Properties();
                                displayOptions.Platforms.forEach((platform) => {
                                    if (platform.Options) {
                                        platform.Options.forEach((option) => {
                                            if (!rendition.Layout) {
                                                if (option.Name === "fixed-layout") {
                                                    if (option.Value === "true") {
                                                        rendition.Layout = metadata_properties_1.LayoutEnum.Fixed;
                                                    }
                                                    else {
                                                        rendition.Layout = metadata_properties_1.LayoutEnum.Reflowable;
                                                    }
                                                }
                                            }
                                            if (!rendition.Orientation) {
                                                if (option.Name === "orientation-lock") {
                                                    const rend = platform.Name === "*" ? renditionPlatformAll :
                                                        (platform.Name === "ipad" ? renditionPlatformIpad :
                                                            (platform.Name === "iphone" ? renditionPlatformIphone :
                                                                renditionPlatformAll));
                                                    switch (option.Value) {
                                                        case "none": {
                                                            rend.Orientation = metadata_properties_1.OrientationEnum.Auto;
                                                            break;
                                                        }
                                                        case "landscape-only": {
                                                            rend.Orientation = metadata_properties_1.OrientationEnum.Landscape;
                                                            break;
                                                        }
                                                        case "portrait-only": {
                                                            rend.Orientation = metadata_properties_1.OrientationEnum.Portrait;
                                                            break;
                                                        }
                                                        default: {
                                                            rend.Orientation = metadata_properties_1.OrientationEnum.Auto;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }
                                });
                                if (renditionPlatformAll.Orientation) {
                                    rendition.Orientation = renditionPlatformAll.Orientation;
                                }
                                else if (renditionPlatformIpad.Orientation) {
                                    rendition.Orientation = renditionPlatformIpad.Orientation;
                                }
                                else if (renditionPlatformIphone.Orientation) {
                                    rendition.Orientation = renditionPlatformIphone.Orientation;
                                }
                            }
                        }
                        catch (err) {
                            debug(err);
                        }
                    }
                }
            }
        }
        if (rendition.Layout || rendition.Orientation || rendition.Overflow || rendition.Page || rendition.Spread) {
            publication.Metadata.Rendition = rendition;
        }
    }
};
const fillSpineAndResource = async (publication, rootfile, opf, zip) => {
    if (!opf.ZipPath) {
        return;
    }
    if (opf.Spine && opf.Spine.Items && opf.Spine.Items.length) {
        for (const item of opf.Spine.Items) {
            if (!item.Linear || item.Linear === "yes") {
                let linkItem;
                try {
                    linkItem = await findInManifestByID(publication, rootfile, opf, item.IDref, zip);
                }
                catch (err) {
                    debug(err);
                    continue;
                }
                if (linkItem && linkItem.Href) {
                    if (!publication.Spine) {
                        publication.Spine = [];
                    }
                    publication.Spine.push(linkItem);
                }
            }
        }
    }
    if (opf.Manifest && opf.Manifest.length) {
        for (const item of opf.Manifest) {
            const itemHrefDecoded = item.HrefDecoded;
            if (!itemHrefDecoded) {
                debug("!? item.Href");
                continue;
            }
            const zipPath = path.join(path.dirname(opf.ZipPath), itemHrefDecoded)
                .replace(/\\/g, "/");
            const linkSpine = findInSpineByHref(publication, zipPath);
            if (!linkSpine || !linkSpine.Href) {
                const linkItem = new publication_link_1.Link();
                linkItem.TypeLink = item.MediaType;
                linkItem.setHrefDecoded(zipPath);
                await addRelAndPropertiesToLink(publication, linkItem, item, rootfile, opf);
                await addMediaOverlay(linkItem, item, rootfile, opf, zip);
                if (!publication.Resources) {
                    publication.Resources = [];
                }
                publication.Resources.push(linkItem);
            }
        }
    }
};
const fillEncryptionInfo = (publication, _rootfile, _opf, encryption, lcp) => {
    encryption.EncryptedData.forEach((encInfo) => {
        const encrypted = new metadata_encrypted_1.Encrypted();
        encrypted.Algorithm = encInfo.EncryptionMethod.Algorithm;
        if (lcp &&
            encrypted.Algorithm !== "http://www.idpf.org/2008/embedding" &&
            encrypted.Algorithm !== "http://ns.adobe.com/pdf/enc#RC") {
            encrypted.Profile = lcp.Encryption.Profile;
            encrypted.Scheme = "http://readium.org/2014/01/lcp";
        }
        if (encInfo.EncryptionProperties && encInfo.EncryptionProperties.length) {
            encInfo.EncryptionProperties.forEach((prop) => {
                if (prop.Compression) {
                    if (prop.Compression.OriginalLength) {
                        encrypted.OriginalLength = parseFloat(prop.Compression.OriginalLength);
                    }
                    if (prop.Compression.Method === "8") {
                        encrypted.Compression = "deflate";
                    }
                    else {
                        encrypted.Compression = "none";
                    }
                }
            });
        }
        if (publication.Resources) {
            publication.Resources.forEach((l, _i, _arr) => {
                const filePath = l.Href;
                if (filePath === encInfo.CipherData.CipherReference.URI) {
                    if (!l.Properties) {
                        l.Properties = new metadata_properties_1.Properties();
                    }
                    l.Properties.Encrypted = encrypted;
                }
            });
        }
        if (publication.Spine) {
            publication.Spine.forEach((l, _i, _arr) => {
                const filePath = l.Href;
                if (filePath === encInfo.CipherData.CipherReference.URI) {
                    if (!l.Properties) {
                        l.Properties = new metadata_properties_1.Properties();
                    }
                    l.Properties.Encrypted = encrypted;
                }
            });
        }
    });
};
const fillPageListFromNCX = (publication, _rootfile, _opf, ncx) => {
    if (ncx.PageList && ncx.PageList.PageTarget && ncx.PageList.PageTarget.length) {
        ncx.PageList.PageTarget.forEach((pageTarget) => {
            const link = new publication_link_1.Link();
            const srcDecoded = pageTarget.Content.SrcDecoded;
            if (!srcDecoded) {
                debug("!?srcDecoded");
                return;
            }
            const zipPath = path.join(path.dirname(ncx.ZipPath), srcDecoded)
                .replace(/\\/g, "/");
            link.setHrefDecoded(zipPath);
            link.Title = pageTarget.Text;
            if (!publication.PageList) {
                publication.PageList = [];
            }
            publication.PageList.push(link);
        });
    }
};
const fillPageListFromAdobePageMap = async (publication, _rootfile, _opf, zip, l) => {
    if (!l.HrefDecoded) {
        return;
    }
    const pageMapContent = await createDocStringFromZipPath(l, zip);
    if (!pageMapContent) {
        return;
    }
    const pageMapXmlDoc = new xmldom.DOMParser().parseFromString(pageMapContent);
    const pages = pageMapXmlDoc.getElementsByTagName("page");
    if (pages && pages.length) {
        for (let i = 0; i < pages.length; i += 1) {
            const page = pages.item(i);
            const link = new publication_link_1.Link();
            const href = page.getAttribute("href");
            const title = page.getAttribute("name");
            if (href === null || title === null) {
                continue;
            }
            if (!publication.PageList) {
                publication.PageList = [];
            }
            const hrefDecoded = decodeURI_1.tryDecodeURI(href);
            if (!hrefDecoded) {
                continue;
            }
            const zipPath = path.join(path.dirname(l.HrefDecoded), hrefDecoded)
                .replace(/\\/g, "/");
            link.setHrefDecoded(zipPath);
            link.Title = title;
            publication.PageList.push(link);
        }
    }
};
const createDocStringFromZipPath = async (link, zip) => {
    const linkHrefDecoded = link.HrefDecoded;
    if (!linkHrefDecoded) {
        debug("!?link.HrefDecoded");
        return undefined;
    }
    const has = await zipHasEntry_1.zipHasEntry(zip, linkHrefDecoded, link.Href);
    if (!has) {
        debug(`NOT IN ZIP (createDocStringFromZipPath): ${link.Href} --- ${linkHrefDecoded}`);
        const zipEntries = await zip.getEntries();
        for (const zipEntry of zipEntries) {
            debug(zipEntry);
        }
        return undefined;
    }
    let zipStream_;
    try {
        zipStream_ = await zip.entryStreamPromise(linkHrefDecoded);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    const zipStream = zipStream_.stream;
    let zipData;
    try {
        zipData = await BufferUtils_1.streamToBufferPromise(zipStream);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    return zipData.toString("utf8");
};
const fillTOCFromNCX = (publication, rootfile, opf, ncx) => {
    if (ncx.Points && ncx.Points.length) {
        ncx.Points.forEach((point) => {
            if (!publication.TOC) {
                publication.TOC = [];
            }
            fillTOCFromNavPoint(publication, rootfile, opf, ncx, point, publication.TOC);
        });
    }
};
const fillLandmarksFromGuide = (publication, _rootfile, opf) => {
    if (opf.Guide && opf.Guide.length) {
        opf.Guide.forEach((ref) => {
            if (ref.Href && opf.ZipPath) {
                const refHrefDecoded = ref.HrefDecoded;
                if (!refHrefDecoded) {
                    debug("ref.Href?!");
                    return;
                }
                const link = new publication_link_1.Link();
                const zipPath = path.join(path.dirname(opf.ZipPath), refHrefDecoded)
                    .replace(/\\/g, "/");
                link.setHrefDecoded(zipPath);
                link.Title = ref.Title;
                if (!publication.Landmarks) {
                    publication.Landmarks = [];
                }
                publication.Landmarks.push(link);
            }
        });
    }
};
const fillTOCFromNavPoint = (publication, rootfile, opf, ncx, point, node) => {
    const srcDecoded = point.Content.SrcDecoded;
    if (!srcDecoded) {
        debug("?!point.Content.Src");
        return;
    }
    const link = new publication_link_1.Link();
    const zipPath = path.join(path.dirname(ncx.ZipPath), srcDecoded)
        .replace(/\\/g, "/");
    link.setHrefDecoded(zipPath);
    link.Title = point.Text;
    if (point.Points && point.Points.length) {
        point.Points.forEach((p) => {
            if (!link.Children) {
                link.Children = [];
            }
            fillTOCFromNavPoint(publication, rootfile, opf, ncx, p, link.Children);
        });
    }
    node.push(link);
};
const fillSubject = (publication, _rootfile, opf) => {
    if (opf.Metadata && opf.Metadata.Subject && opf.Metadata.Subject.length) {
        opf.Metadata.Subject.forEach((s) => {
            const sub = new metadata_subject_1.Subject();
            if (s.Lang) {
                sub.Name = {};
                sub.Name[s.Lang] = s.Data;
            }
            else {
                sub.Name = s.Data;
            }
            sub.Code = s.Term;
            sub.Scheme = s.Authority;
            if (!publication.Metadata.Subject) {
                publication.Metadata.Subject = [];
            }
            publication.Metadata.Subject.push(sub);
        });
    }
};
const fillCalibreSerieInfo = (publication, _rootfile, opf) => {
    let serie;
    let seriePosition;
    if (opf.Metadata && opf.Metadata.Meta && opf.Metadata.Meta.length) {
        opf.Metadata.Meta.forEach((m) => {
            if (m.Name === "calibre:series") {
                serie = m.Content;
            }
            if (m.Name === "calibre:series_index") {
                seriePosition = parseFloat(m.Content);
            }
        });
    }
    if (serie) {
        const contributor = new metadata_contributor_1.Contributor();
        contributor.Name = serie;
        if (seriePosition) {
            contributor.Position = seriePosition;
        }
        if (!publication.Metadata.BelongsTo) {
            publication.Metadata.BelongsTo = new metadata_belongsto_1.BelongsTo();
        }
        if (!publication.Metadata.BelongsTo.Series) {
            publication.Metadata.BelongsTo.Series = [];
        }
        publication.Metadata.BelongsTo.Series.push(contributor);
    }
};
const fillTOCFromNavDoc = async (publication, _rootfile, _opf, zip) => {
    const navLink = publication.GetNavDoc();
    if (!navLink) {
        return;
    }
    const navLinkHrefDecoded = navLink.HrefDecoded;
    if (!navLinkHrefDecoded) {
        debug("!?navLink.HrefDecoded");
        return;
    }
    const has = await zipHasEntry_1.zipHasEntry(zip, navLinkHrefDecoded, navLink.Href);
    if (!has) {
        debug(`NOT IN ZIP (fillTOCFromNavDoc): ${navLink.Href} --- ${navLinkHrefDecoded}`);
        const zipEntries = await zip.getEntries();
        for (const zipEntry of zipEntries) {
            debug(zipEntry);
        }
        return;
    }
    let navDocZipStream_;
    try {
        navDocZipStream_ = await zip.entryStreamPromise(navLinkHrefDecoded);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    const navDocZipStream = navDocZipStream_.stream;
    let navDocZipData;
    try {
        navDocZipData = await BufferUtils_1.streamToBufferPromise(navDocZipStream);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    const navDocStr = navDocZipData.toString("utf8");
    const navXmlDoc = new xmldom.DOMParser().parseFromString(navDocStr);
    const select = xpath.useNamespaces({
        epub: "http://www.idpf.org/2007/ops",
        xhtml: "http://www.w3.org/1999/xhtml",
    });
    const navs = select("/xhtml:html/xhtml:body//xhtml:nav", navXmlDoc);
    if (navs && navs.length) {
        navs.forEach((navElement) => {
            const epubType = select("@epub:type", navElement);
            if (epubType && epubType.length) {
                const olElem = select("xhtml:ol", navElement);
                const rolesString = epubType[0].value;
                const rolesArray = parseSpaceSeparatedString(rolesString);
                if (rolesArray.length) {
                    for (const role of rolesArray) {
                        switch (role) {
                            case "toc": {
                                publication.TOC = [];
                                fillTOCFromNavDocWithOL(select, olElem, publication.TOC, navLinkHrefDecoded);
                                break;
                            }
                            case "page-list": {
                                publication.PageList = [];
                                fillTOCFromNavDocWithOL(select, olElem, publication.PageList, navLinkHrefDecoded);
                                break;
                            }
                            case "landmarks": {
                                publication.Landmarks = [];
                                fillTOCFromNavDocWithOL(select, olElem, publication.Landmarks, navLinkHrefDecoded);
                                break;
                            }
                            case "lot": {
                                publication.LOT = [];
                                fillTOCFromNavDocWithOL(select, olElem, publication.LOT, navLinkHrefDecoded);
                                break;
                            }
                            case "loa": {
                                publication.LOA = [];
                                fillTOCFromNavDocWithOL(select, olElem, publication.LOA, navLinkHrefDecoded);
                                break;
                            }
                            case "loi": {
                                publication.LOI = [];
                                fillTOCFromNavDocWithOL(select, olElem, publication.LOI, navLinkHrefDecoded);
                                break;
                            }
                            case "lov": {
                                publication.LOV = [];
                                fillTOCFromNavDocWithOL(select, olElem, publication.LOV, navLinkHrefDecoded);
                                break;
                            }
                            default: {
                                break;
                            }
                        }
                    }
                }
            }
        });
    }
};
const fillTOCFromNavDocWithOL = (select, olElems, children, navDocPath) => {
    olElems.forEach((olElem) => {
        const liElems = select("xhtml:li", olElem);
        if (liElems && liElems.length) {
            liElems.forEach((liElem) => {
                const link = new publication_link_1.Link();
                children.push(link);
                const aElems = select("xhtml:a", liElem);
                if (aElems && aElems.length > 0) {
                    const epubType = select("@epub:type", aElems[0]);
                    if (epubType && epubType.length) {
                        const rolesString = epubType[0].value;
                        const rolesArray = parseSpaceSeparatedString(rolesString);
                        if (rolesArray.length) {
                            link.AddRels(rolesArray);
                        }
                    }
                    const aHref = select("@href", aElems[0]);
                    if (aHref && aHref.length) {
                        const val = aHref[0].value;
                        let valDecoded = decodeURI_1.tryDecodeURI(val);
                        if (!valDecoded) {
                            debug("!?valDecoded");
                            return;
                        }
                        if (val[0] === "#") {
                            valDecoded = path.basename(navDocPath) + valDecoded;
                        }
                        const zipPath = path.join(path.dirname(navDocPath), valDecoded)
                            .replace(/\\/g, "/");
                        link.setHrefDecoded(zipPath);
                    }
                    let aText = aElems[0].textContent;
                    if (aText && aText.length) {
                        aText = aText.trim();
                        aText = aText.replace(/\s\s+/g, " ");
                        link.Title = aText;
                    }
                }
                else {
                    const liFirstChild = select("xhtml:*[1]", liElem);
                    if (liFirstChild && liFirstChild.length && liFirstChild[0].textContent) {
                        link.Title = liFirstChild[0].textContent.trim();
                    }
                }
                const olElemsNext = select("xhtml:ol", liElem);
                if (olElemsNext && olElemsNext.length) {
                    if (!link.Children) {
                        link.Children = [];
                    }
                    fillTOCFromNavDocWithOL(select, olElemsNext, link.Children, navDocPath);
                }
            });
        }
    });
};
const addCoverRel = async (publication, rootfile, opf, zip) => {
    let coverID;
    if (opf.Metadata && opf.Metadata.Meta && opf.Metadata.Meta.length) {
        opf.Metadata.Meta.find((meta) => {
            if (meta.Name === "cover") {
                coverID = meta.Content;
                return true;
            }
            return false;
        });
    }
    if (coverID) {
        let manifestInfo;
        try {
            manifestInfo = await findInManifestByID(publication, rootfile, opf, coverID, zip);
        }
        catch (err) {
            debug(err);
            return;
        }
        if (manifestInfo && manifestInfo.Href && publication.Resources && publication.Resources.length) {
            const href = manifestInfo.Href;
            const linky = publication.Resources.find((item, _i, _arr) => {
                if (item.Href === href) {
                    return true;
                }
                return false;
            });
            if (linky) {
                linky.AddRel("cover");
                await exports.addCoverDimensions(publication, linky);
            }
        }
    }
};
const findPropertiesInSpineForManifest = (linkEpub, _rootfile, opf) => {
    if (opf.Spine && opf.Spine.Items && opf.Spine.Items.length) {
        const it = opf.Spine.Items.find((item) => {
            if (item.IDref === linkEpub.ID) {
                return true;
            }
            return false;
        });
        if (it && it.Properties) {
            return it.Properties;
        }
    }
    return undefined;
};
const findInSpineByHref = (publication, href) => {
    if (publication.Spine && publication.Spine.length) {
        const ll = publication.Spine.find((l) => {
            if (l.HrefDecoded === href) {
                return true;
            }
            return false;
        });
        if (ll) {
            return ll;
        }
    }
    return undefined;
};
const findMetaByRefineAndProperty = (rootfile, opf, ID, property) => {
    const ret = findAllMetaByRefineAndProperty(rootfile, opf, ID, property);
    if (ret.length) {
        return ret[0];
    }
    return undefined;
};
const findAllMetaByRefineAndProperty = (_rootfile, opf, ID, property) => {
    const metas = [];
    const refineID = "#" + ID;
    if (opf.Metadata && opf.Metadata.Meta) {
        opf.Metadata.Meta.forEach((metaTag) => {
            if (metaTag.Refine === refineID && metaTag.Property === property) {
                metas.push(metaTag);
            }
        });
    }
    return metas;
};
const getEpubVersion = (rootfile, opf) => {
    if (rootfile.Version) {
        return rootfile.Version;
    }
    else if (opf.Version) {
        return opf.Version;
    }
    return undefined;
};
const isEpub3OrMore = (rootfile, opf) => {
    const version = getEpubVersion(rootfile, opf);
    return (version === epub3 || version === epub301 || version === epub31);
};
//# sourceMappingURL=epub.js.map