"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMediaOverlaySMIL = exports.fillTOC = exports.loadFileBufferFromZipPath = exports.loadFileStrFromZipPath = exports.addOtherMetadata = exports.getOpf = exports.getNcx = exports.setPublicationDirection = exports.addTitle = exports.addIdentifier = exports.addLanguage = exports.fillSpineAndResource = exports.findInManifestByID = exports.findInSpineByHref = exports.findAllMetaByRefineAndProperty = exports.findMetaByRefineAndProperty = exports.addContributor = exports.findContributorInMeta = exports.fillSubject = exports.fillPublicationDate = exports.isEpub3OrMore = exports.parseSpaceSeparatedString = exports.BCP47_UNKNOWN_LANG = exports.mediaOverlayURLParam = exports.mediaOverlayURLPath = void 0;
const debug_ = require("debug");
const moment = require("moment");
const path = require("path");
const xmldom = require("xmldom");
const media_overlay_1 = require("../models/media-overlay");
const metadata_1 = require("../models/metadata");
const metadata_contributor_1 = require("../models/metadata-contributor");
const metadata_media_overlay_1 = require("../models/metadata-media-overlay");
const metadata_properties_1 = require("../models/metadata-properties");
const metadata_subject_1 = require("../models/metadata-subject");
const publication_link_1 = require("../models/publication-link");
const ta_json_string_tokens_converter_1 = require("../models/ta-json-string-tokens-converter");
const UrlUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/http/UrlUtils");
const BufferUtils_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/stream/BufferUtils");
const xml_js_mapper_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/xml-js-mapper");
const zipHasEntry_1 = require("../_utils/zipHasEntry");
const ncx_1 = require("./epub/ncx");
const opf_1 = require("./epub/opf");
const opf_author_1 = require("./epub/opf-author");
const debug = debug_("r2:shared#parser/epub-daisy-common");
const epub3 = "3.0";
const epub301 = "3.0.1";
const epub31 = "3.1";
exports.mediaOverlayURLPath = "media-overlay.json";
exports.mediaOverlayURLParam = "resource";
exports.BCP47_UNKNOWN_LANG = "und";
exports.parseSpaceSeparatedString = (str) => {
    return str ? str.trim().split(" ").map((role) => {
        return role.trim();
    }).filter((role) => {
        return role.length > 0;
    }) : [];
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
exports.isEpub3OrMore = (rootfile, opf) => {
    const version = getEpubVersion(rootfile, opf);
    return (version === epub3 || version === epub301 || version === epub31);
};
exports.fillPublicationDate = (publication, rootfile, opf) => {
    var _a, _b, _c, _d, _e;
    const opfMetadataDate = ((_c = (_b = (_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.DCMetadata) === null || _b === void 0 ? void 0 : _b.Date) === null || _c === void 0 ? void 0 : _c.length) ?
        opf.Metadata.DCMetadata.Date :
        (((_e = (_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Date) === null || _e === void 0 ? void 0 : _e.length) ?
            opf.Metadata.Date :
            undefined);
    if (opfMetadataDate) {
        if ((!rootfile || exports.isEpub3OrMore(rootfile, opf)) &&
            opfMetadataDate[0] && opfMetadataDate[0].Data) {
            const token = opfMetadataDate[0].Data;
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
        opfMetadataDate.forEach((date) => {
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
exports.fillSubject = (publication, opf) => {
    var _a, _b, _c, _d, _e;
    const opfMetadataSubject = ((_c = (_b = (_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.DCMetadata) === null || _b === void 0 ? void 0 : _b.Subject) === null || _c === void 0 ? void 0 : _c.length) ?
        opf.Metadata.DCMetadata.Subject :
        (((_e = (_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Subject) === null || _e === void 0 ? void 0 : _e.length) ?
            opf.Metadata.Subject :
            undefined);
    if (opfMetadataSubject) {
        opfMetadataSubject.forEach((s) => {
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
exports.findContributorInMeta = (publication, rootfile, opf) => {
    var _a, _b, _c, _d, _e;
    if (!rootfile || exports.isEpub3OrMore(rootfile, opf)) {
        const func = (meta) => {
            if (meta.Property === "dcterms:creator" || meta.Property === "dcterms:contributor") {
                const cont = new opf_author_1.Author();
                cont.Data = meta.Data;
                cont.ID = meta.ID;
                exports.addContributor(publication, rootfile, opf, cont, undefined);
            }
        };
        if ((_c = (_b = (_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.XMetadata) === null || _b === void 0 ? void 0 : _b.Meta) === null || _c === void 0 ? void 0 : _c.length) {
            opf.Metadata.XMetadata.Meta.forEach(func);
        }
        if ((_e = (_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Meta) === null || _e === void 0 ? void 0 : _e.length) {
            opf.Metadata.Meta.forEach(func);
        }
    }
};
exports.addContributor = (publication, rootfile, opf, cont, forcedRole) => {
    const contributor = new metadata_contributor_1.Contributor();
    let role;
    if (rootfile && exports.isEpub3OrMore(rootfile, opf)) {
        if (cont.FileAs) {
            contributor.SortAs = cont.FileAs;
        }
        else {
            const metaFileAs = exports.findMetaByRefineAndProperty(opf, cont.ID, "file-as");
            if (metaFileAs && metaFileAs.Property === "file-as") {
                contributor.SortAs = metaFileAs.Data;
            }
        }
        const metaRole = exports.findMetaByRefineAndProperty(opf, cont.ID, "role");
        if (metaRole && metaRole.Property === "role") {
            role = metaRole.Data;
        }
        if (!role && forcedRole) {
            role = forcedRole;
        }
        const metaAlt = exports.findAllMetaByRefineAndProperty(opf, cont.ID, "alternate-script");
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
exports.findMetaByRefineAndProperty = (opf, ID, property) => {
    const ret = exports.findAllMetaByRefineAndProperty(opf, ID, property);
    if (ret.length) {
        return ret[0];
    }
    return undefined;
};
exports.findAllMetaByRefineAndProperty = (opf, ID, property) => {
    var _a, _b, _c, _d, _e;
    const metas = [];
    const refineID = "#" + ID;
    const func = (metaTag) => {
        if (metaTag.Refine === refineID && metaTag.Property === property) {
            metas.push(metaTag);
        }
    };
    if ((_c = (_b = (_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.XMetadata) === null || _b === void 0 ? void 0 : _b.Meta) === null || _c === void 0 ? void 0 : _c.length) {
        opf.Metadata.XMetadata.Meta.forEach(func);
    }
    if ((_e = (_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Meta) === null || _e === void 0 ? void 0 : _e.length) {
        opf.Metadata.Meta.forEach(func);
    }
    return metas;
};
exports.findInSpineByHref = (publication, href) => {
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
exports.findInManifestByID = async (publication, rootfile, opf, ID, zip, addLinkData) => {
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
            await addLinkData(publication, rootfile, opf, zip, linkItem, item);
            return linkItem;
        }
    }
    return Promise.reject(`ID ${ID} not found`);
};
exports.fillSpineAndResource = async (publication, rootfile, opf, zip, addLinkData) => {
    if (!opf.ZipPath) {
        return;
    }
    if (opf.Spine && opf.Spine.Items && opf.Spine.Items.length) {
        for (const item of opf.Spine.Items) {
            if (!item.Linear || item.Linear === "yes") {
                let linkItem;
                try {
                    linkItem = await exports.findInManifestByID(publication, rootfile, opf, item.IDref, zip, addLinkData);
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
            const linkSpine = exports.findInSpineByHref(publication, zipPath);
            if (!linkSpine || !linkSpine.Href) {
                const linkItem = new publication_link_1.Link();
                linkItem.TypeLink = item.MediaType;
                linkItem.setHrefDecoded(zipPath);
                await addLinkData(publication, rootfile, opf, zip, linkItem, item);
                if (!publication.Resources) {
                    publication.Resources = [];
                }
                publication.Resources.push(linkItem);
            }
        }
    }
};
exports.addLanguage = (publication, opf) => {
    var _a, _b, _c, _d, _e;
    const opfMetadataLanguage = ((_c = (_b = (_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.DCMetadata) === null || _b === void 0 ? void 0 : _b.Language) === null || _c === void 0 ? void 0 : _c.length) ?
        opf.Metadata.DCMetadata.Language :
        (((_e = (_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Language) === null || _e === void 0 ? void 0 : _e.length) ?
            opf.Metadata.Language :
            undefined);
    if (opfMetadataLanguage) {
        publication.Metadata.Language = opfMetadataLanguage;
    }
};
exports.addIdentifier = (publication, opf) => {
    var _a, _b, _c, _d, _e;
    const opfMetadataIdentifier = ((_c = (_b = (_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.DCMetadata) === null || _b === void 0 ? void 0 : _b.Identifier) === null || _c === void 0 ? void 0 : _c.length) ?
        opf.Metadata.DCMetadata.Identifier :
        (((_e = (_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Identifier) === null || _e === void 0 ? void 0 : _e.length) ?
            opf.Metadata.Identifier :
            undefined);
    if (opfMetadataIdentifier) {
        if (opf.UniqueIdentifier && opfMetadataIdentifier.length > 1) {
            opfMetadataIdentifier.forEach((iden) => {
                if (iden.ID === opf.UniqueIdentifier) {
                    publication.Metadata.Identifier = iden.Data;
                }
            });
        }
        else if (opfMetadataIdentifier.length > 0) {
            publication.Metadata.Identifier = opfMetadataIdentifier[0].Data;
        }
    }
};
exports.addTitle = (publication, rootfile, opf) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const opfMetadataTitle = ((_c = (_b = (_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.DCMetadata) === null || _b === void 0 ? void 0 : _b.Title) === null || _c === void 0 ? void 0 : _c.length) ?
        opf.Metadata.DCMetadata.Title :
        (((_e = (_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Title) === null || _e === void 0 ? void 0 : _e.length) ?
            opf.Metadata.Title :
            undefined);
    if (rootfile && exports.isEpub3OrMore(rootfile, opf)) {
        let mainTitle;
        let subTitle;
        let subTitleDisplaySeq = 0;
        if (opfMetadataTitle) {
            if (((_f = opf.Metadata) === null || _f === void 0 ? void 0 : _f.Meta) || ((_h = (_g = opf.Metadata) === null || _g === void 0 ? void 0 : _g.XMetadata) === null || _h === void 0 ? void 0 : _h.Meta)) {
                const tt = opfMetadataTitle.find((title) => {
                    var _a, _b, _c;
                    const refineID = "#" + title.ID;
                    const func0 = (meta) => {
                        if (meta.Data === "main" && meta.Refine === refineID) {
                            return true;
                        }
                        return false;
                    };
                    let m = ((_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.Meta) ? opf.Metadata.Meta.find(func0) : undefined;
                    if (!m && ((_c = (_b = opf.Metadata) === null || _b === void 0 ? void 0 : _b.XMetadata) === null || _c === void 0 ? void 0 : _c.Meta)) {
                        m = opf.Metadata.XMetadata.Meta.find(func0);
                    }
                    if (m) {
                        return true;
                    }
                    return false;
                });
                if (tt) {
                    mainTitle = tt;
                }
                opfMetadataTitle.forEach((title) => {
                    var _a, _b, _c, _d, _e, _f;
                    const refineID = "#" + title.ID;
                    const func1 = (meta) => {
                        if (meta.Data === "subtitle" && meta.Refine === refineID) {
                            return true;
                        }
                        return false;
                    };
                    let m = ((_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.Meta) ? opf.Metadata.Meta.find(func1) : undefined;
                    if (!m && ((_c = (_b = opf.Metadata) === null || _b === void 0 ? void 0 : _b.XMetadata) === null || _c === void 0 ? void 0 : _c.Meta)) {
                        m = opf.Metadata.XMetadata.Meta.find(func1);
                    }
                    if (m) {
                        let titleDisplaySeq = 0;
                        const func2 = (meta) => {
                            if (meta.Property === "display-seq" && meta.Refine === refineID) {
                                return true;
                            }
                            return false;
                        };
                        let mds = ((_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Meta) ? opf.Metadata.Meta.find(func2) : undefined;
                        if (!mds && ((_f = (_e = opf.Metadata) === null || _e === void 0 ? void 0 : _e.XMetadata) === null || _f === void 0 ? void 0 : _f.Meta)) {
                            mds = opf.Metadata.XMetadata.Meta.find(func2);
                        }
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
                mainTitle = opfMetadataTitle[0];
            }
        }
        if (mainTitle) {
            const metaAlt = exports.findAllMetaByRefineAndProperty(opf, mainTitle.ID, "alternate-script");
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
            const metaAlt = exports.findAllMetaByRefineAndProperty(opf, subTitle.ID, "alternate-script");
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
        if (opfMetadataTitle) {
            publication.Metadata.Title = opfMetadataTitle[0].Data;
        }
    }
};
exports.setPublicationDirection = (publication, opf) => {
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
};
exports.getNcx = async (ncxManItem, opf, zip) => {
    if (!opf.ZipPath) {
        return Promise.reject("?!!opf.ZipPath");
    }
    const dname = path.dirname(opf.ZipPath);
    const ncxManItemHrefDecoded = ncxManItem.HrefDecoded;
    if (!ncxManItemHrefDecoded) {
        return Promise.reject("?!ncxManItem.Href");
    }
    const ncxFilePath = path.join(dname, ncxManItemHrefDecoded).replace(/\\/g, "/");
    const has = await zipHasEntry_1.zipHasEntry(zip, ncxFilePath, undefined);
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
    let ncxStr = ncxZipData.toString("utf8");
    const iStart = ncxStr.indexOf("<ncx");
    if (iStart >= 0) {
        const iEnd = ncxStr.indexOf(">", iStart);
        if (iEnd > iStart) {
            const clip = ncxStr.substr(iStart, iEnd - iStart);
            if (clip.indexOf("xmlns") < 0) {
                ncxStr = ncxStr.replace(/<ncx/, "<ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\" ");
            }
        }
    }
    const ncxDoc = new xmldom.DOMParser().parseFromString(ncxStr);
    const ncx = xml_js_mapper_1.XML.deserialize(ncxDoc, ncx_1.NCX);
    ncx.ZipPath = ncxFilePath;
    return ncx;
};
exports.getOpf = async (zip, rootfilePathDecoded, rootfilePath) => {
    const has = await zipHasEntry_1.zipHasEntry(zip, rootfilePathDecoded, rootfilePath);
    if (!has) {
        const err = `NOT IN ZIP (container OPF rootfile): ${rootfilePath} --- ${rootfilePathDecoded}`;
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
    let opfStr = opfZipData.toString("utf8");
    const iStart = opfStr.indexOf("<package");
    if (iStart >= 0) {
        const iEnd = opfStr.indexOf(">", iStart);
        if (iEnd > iStart) {
            const clip = opfStr.substr(iStart, iEnd - iStart);
            if (clip.indexOf("xmlns") < 0) {
                opfStr = opfStr.replace(/<package/, "<package xmlns=\"http://openebook.org/namespaces/oeb-package/1.0/\" ");
            }
        }
    }
    const opfDoc = new xmldom.DOMParser().parseFromString(opfStr);
    const opf = xml_js_mapper_1.XML.deserialize(opfDoc, opf_1.OPF);
    opf.ZipPath = rootfilePathDecoded;
    return opf;
};
exports.addOtherMetadata = (publication, rootfile, opf) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
    if (!((_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.DCMetadata)) {
        return;
    }
    const opfMetadataRights = ((_d = (_c = (_b = opf.Metadata) === null || _b === void 0 ? void 0 : _b.DCMetadata) === null || _c === void 0 ? void 0 : _c.Rights) === null || _d === void 0 ? void 0 : _d.length) ?
        opf.Metadata.DCMetadata.Rights :
        (((_f = (_e = opf.Metadata) === null || _e === void 0 ? void 0 : _e.Rights) === null || _f === void 0 ? void 0 : _f.length) ?
            opf.Metadata.Rights :
            undefined);
    if (opfMetadataRights) {
        publication.Metadata.Rights = opfMetadataRights.join(" ");
    }
    const opfMetadataDescription = ((_j = (_h = (_g = opf.Metadata) === null || _g === void 0 ? void 0 : _g.DCMetadata) === null || _h === void 0 ? void 0 : _h.Description) === null || _j === void 0 ? void 0 : _j.length) ?
        opf.Metadata.DCMetadata.Description :
        (((_l = (_k = opf.Metadata) === null || _k === void 0 ? void 0 : _k.Description) === null || _l === void 0 ? void 0 : _l.length) ?
            opf.Metadata.Description :
            undefined);
    if (opfMetadataDescription) {
        publication.Metadata.Description = opfMetadataDescription[0];
    }
    const opfMetadataPublisher = ((_p = (_o = (_m = opf.Metadata) === null || _m === void 0 ? void 0 : _m.DCMetadata) === null || _o === void 0 ? void 0 : _o.Publisher) === null || _p === void 0 ? void 0 : _p.length) ?
        opf.Metadata.DCMetadata.Publisher :
        (((_r = (_q = opf.Metadata) === null || _q === void 0 ? void 0 : _q.Publisher) === null || _r === void 0 ? void 0 : _r.length) ?
            opf.Metadata.Publisher :
            undefined);
    if (opfMetadataPublisher) {
        publication.Metadata.Publisher = [];
        opfMetadataPublisher.forEach((pub) => {
            const contrib = new metadata_contributor_1.Contributor();
            contrib.Name = pub;
            publication.Metadata.Publisher.push(contrib);
        });
    }
    const opfMetadataSource = ((_u = (_t = (_s = opf.Metadata) === null || _s === void 0 ? void 0 : _s.DCMetadata) === null || _t === void 0 ? void 0 : _t.Source) === null || _u === void 0 ? void 0 : _u.length) ?
        opf.Metadata.DCMetadata.Source :
        (((_w = (_v = opf.Metadata) === null || _v === void 0 ? void 0 : _v.Source) === null || _w === void 0 ? void 0 : _w.length) ?
            opf.Metadata.Source :
            undefined);
    if (opfMetadataSource) {
        publication.Metadata.Source = opfMetadataSource[0];
    }
    const opfMetadataContributor = ((_z = (_y = (_x = opf.Metadata) === null || _x === void 0 ? void 0 : _x.DCMetadata) === null || _y === void 0 ? void 0 : _y.Contributor) === null || _z === void 0 ? void 0 : _z.length) ?
        opf.Metadata.DCMetadata.Contributor :
        (((_1 = (_0 = opf.Metadata) === null || _0 === void 0 ? void 0 : _0.Contributor) === null || _1 === void 0 ? void 0 : _1.length) ?
            opf.Metadata.Contributor :
            undefined);
    if (opfMetadataContributor) {
        opfMetadataContributor.forEach((cont) => {
            exports.addContributor(publication, rootfile, opf, cont, undefined);
        });
    }
    const opfMetadataCreator = ((_4 = (_3 = (_2 = opf.Metadata) === null || _2 === void 0 ? void 0 : _2.DCMetadata) === null || _3 === void 0 ? void 0 : _3.Creator) === null || _4 === void 0 ? void 0 : _4.length) ?
        opf.Metadata.DCMetadata.Creator :
        (((_6 = (_5 = opf.Metadata) === null || _5 === void 0 ? void 0 : _5.Creator) === null || _6 === void 0 ? void 0 : _6.length) ?
            opf.Metadata.Creator :
            undefined);
    if (opfMetadataCreator) {
        opfMetadataCreator.forEach((cont) => {
            exports.addContributor(publication, rootfile, opf, cont, "aut");
        });
    }
    if ((_7 = opf.Metadata) === null || _7 === void 0 ? void 0 : _7.Link) {
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
    if (opf.Metadata.Meta || opf.Metadata.XMetadata.Meta) {
        const AccessibilitySummarys = [];
        const metaFunc = (metaTag) => {
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
        };
        if (opf.Metadata.Meta) {
            opf.Metadata.Meta.forEach(metaFunc);
        }
        if (opf.Metadata.XMetadata.Meta) {
            opf.Metadata.XMetadata.Meta.forEach(metaFunc);
        }
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
        const mFunc = (metaTag) => {
            if (metaTag.Name === "dtb:totalTime") {
                metasDuration.push(metaTag);
            }
            else if (metaTag.Property === "media:duration" && !metaTag.Refine) {
                metasDuration.push(metaTag);
            }
            else if (metaTag.Property === "media:narrator") {
                metasNarrator.push(metaTag);
            }
            else if (metaTag.Property === "media:active-class") {
                metasActiveClass.push(metaTag);
            }
            else if (metaTag.Property === "media:playback-active-class") {
                metasPlaybackActiveClass.push(metaTag);
            }
            else {
                const key = metaTag.Name ? metaTag.Name : metaTag.Property;
                if (key && !metadata_1.MetadataSupportedKeys.includes(key)) {
                    if (!publication.Metadata.AdditionalJSON) {
                        publication.Metadata.AdditionalJSON = {};
                    }
                    if (metaTag.Name && metaTag.Content) {
                        publication.Metadata.AdditionalJSON[metaTag.Name] = metaTag.Content;
                    }
                    else if (metaTag.Property && metaTag.Data) {
                        publication.Metadata.AdditionalJSON[metaTag.Property] = metaTag.Data;
                    }
                }
            }
        };
        if (opf.Metadata.Meta) {
            opf.Metadata.Meta.forEach(mFunc);
        }
        if (opf.Metadata.XMetadata.Meta) {
            opf.Metadata.XMetadata.Meta.forEach(mFunc);
        }
        if (metasDuration.length) {
            publication.Metadata.Duration = media_overlay_1.timeStrToSeconds(metasDuration[0].Property ? metasDuration[0].Data : metasDuration[0].Content);
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
};
exports.loadFileStrFromZipPath = async (linkHref, linkHrefDecoded, zip) => {
    let zipData;
    try {
        zipData = await exports.loadFileBufferFromZipPath(linkHref, linkHrefDecoded, zip);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    if (zipData) {
        return zipData.toString("utf8");
    }
    return Promise.reject("?!zipData loadFileStrFromZipPath()");
};
exports.loadFileBufferFromZipPath = async (linkHref, linkHrefDecoded, zip) => {
    if (!linkHrefDecoded) {
        debug("!?link.HrefDecoded");
        return undefined;
    }
    const has = await zipHasEntry_1.zipHasEntry(zip, linkHrefDecoded, linkHref);
    if (!has) {
        debug(`NOT IN ZIP (loadFileBufferFromZipPath): ${linkHref} --- ${linkHrefDecoded}`);
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
    return zipData;
};
const fillLandmarksFromGuide = (publication, opf) => {
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
const fillTOCFromNCX = (publication, ncx) => {
    if (ncx.Points && ncx.Points.length) {
        ncx.Points.forEach((point) => {
            if (!publication.TOC) {
                publication.TOC = [];
            }
            fillTOCFromNavPoint(publication, ncx, point, publication.TOC);
        });
    }
};
const fillTOCFromNavPoint = (publication, ncx, point, node) => {
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
            fillTOCFromNavPoint(publication, ncx, p, link.Children);
        });
    }
    node.push(link);
};
const fillPageListFromNCX = (publication, ncx) => {
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
exports.fillTOC = (publication, opf, ncx) => {
    if (ncx) {
        fillTOCFromNCX(publication, ncx);
        if (!publication.PageList) {
            fillPageListFromNCX(publication, ncx);
        }
    }
    fillLandmarksFromGuide(publication, opf);
};
exports.addMediaOverlaySMIL = async (link, manItemSmil, opf, zip) => {
    if (manItemSmil && manItemSmil.MediaType && manItemSmil.MediaType.startsWith("application/smil")) {
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
};
//# sourceMappingURL=epub-daisy-common.js.map