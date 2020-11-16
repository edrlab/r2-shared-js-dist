"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMediaOverlaySMIL = exports.fillTOC = exports.loadFileBufferFromZipPath = exports.loadFileStrFromZipPath = exports.addOtherMetadata = exports.getOpf = exports.getNcx = exports.setPublicationDirection = exports.addTitle = exports.addIdentifier = exports.addLanguage = exports.fillSpineAndResource = exports.findInManifestByID = exports.findInSpineByHref = exports.findAllMetaByRefineAndProperty = exports.findMetaByRefineAndProperty = exports.addContributor = exports.findContributorInMeta = exports.fillSubject = exports.fillPublicationDate = exports.isEpub3OrMore = exports.parseSpaceSeparatedString = exports.BCP47_UNKNOWN_LANG = exports.mediaOverlayURLParam = exports.mediaOverlayURLPath = void 0;
var tslib_1 = require("tslib");
var debug_ = require("debug");
var moment = require("moment");
var path = require("path");
var xmldom = require("xmldom");
var media_overlay_1 = require("../models/media-overlay");
var metadata_1 = require("../models/metadata");
var metadata_contributor_1 = require("../models/metadata-contributor");
var metadata_media_overlay_1 = require("../models/metadata-media-overlay");
var metadata_properties_1 = require("../models/metadata-properties");
var metadata_subject_1 = require("../models/metadata-subject");
var publication_link_1 = require("../models/publication-link");
var ta_json_string_tokens_converter_1 = require("../models/ta-json-string-tokens-converter");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var BufferUtils_1 = require("r2-utils-js/dist/es5/src/_utils/stream/BufferUtils");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var zipHasEntry_1 = require("../_utils/zipHasEntry");
var ncx_1 = require("./epub/ncx");
var opf_1 = require("./epub/opf");
var opf_author_1 = require("./epub/opf-author");
var debug = debug_("r2:shared#parser/epub-daisy-common");
var epub3 = "3.0";
var epub301 = "3.0.1";
var epub31 = "3.1";
exports.mediaOverlayURLPath = "media-overlay.json";
exports.mediaOverlayURLParam = "resource";
exports.BCP47_UNKNOWN_LANG = "und";
exports.parseSpaceSeparatedString = function (str) {
    return str ? str.trim().split(" ").map(function (role) {
        return role.trim();
    }).filter(function (role) {
        return role.length > 0;
    }) : [];
};
var getEpubVersion = function (rootfile, opf) {
    if (rootfile.Version) {
        return rootfile.Version;
    }
    else if (opf.Version) {
        return opf.Version;
    }
    return undefined;
};
exports.isEpub3OrMore = function (rootfile, opf) {
    var version = getEpubVersion(rootfile, opf);
    return (version === epub3 || version === epub301 || version === epub31);
};
exports.fillPublicationDate = function (publication, rootfile, opf) {
    var _a, _b, _c, _d, _e;
    var opfMetadataDate = ((_c = (_b = (_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.DCMetadata) === null || _b === void 0 ? void 0 : _b.Date) === null || _c === void 0 ? void 0 : _c.length) ?
        opf.Metadata.DCMetadata.Date :
        (((_e = (_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Date) === null || _e === void 0 ? void 0 : _e.length) ?
            opf.Metadata.Date :
            undefined);
    if (opfMetadataDate) {
        if ((!rootfile || exports.isEpub3OrMore(rootfile, opf)) &&
            opfMetadataDate[0] && opfMetadataDate[0].Data) {
            var token = opfMetadataDate[0].Data;
            try {
                var mom = moment(token);
                if (mom.isValid()) {
                    publication.Metadata.PublicationDate = mom.toDate();
                }
            }
            catch (err) {
                debug("INVALID DATE/TIME? " + token);
            }
            return;
        }
        opfMetadataDate.forEach(function (date) {
            if (date.Data && date.Event && date.Event.indexOf("publication") >= 0) {
                var token = date.Data;
                try {
                    var mom = moment(token);
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
exports.fillSubject = function (publication, opf) {
    var _a, _b, _c, _d, _e;
    var opfMetadataSubject = ((_c = (_b = (_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.DCMetadata) === null || _b === void 0 ? void 0 : _b.Subject) === null || _c === void 0 ? void 0 : _c.length) ?
        opf.Metadata.DCMetadata.Subject :
        (((_e = (_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Subject) === null || _e === void 0 ? void 0 : _e.length) ?
            opf.Metadata.Subject :
            undefined);
    if (opfMetadataSubject) {
        opfMetadataSubject.forEach(function (s) {
            var sub = new metadata_subject_1.Subject();
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
exports.findContributorInMeta = function (publication, rootfile, opf) {
    var _a, _b, _c, _d, _e;
    if (!rootfile || exports.isEpub3OrMore(rootfile, opf)) {
        var func = function (meta) {
            if (meta.Property === "dcterms:creator" || meta.Property === "dcterms:contributor") {
                var cont = new opf_author_1.Author();
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
exports.addContributor = function (publication, rootfile, opf, cont, forcedRole) {
    var contributor = new metadata_contributor_1.Contributor();
    var role;
    if (rootfile && exports.isEpub3OrMore(rootfile, opf)) {
        if (cont.FileAs) {
            contributor.SortAs = cont.FileAs;
        }
        else {
            var metaFileAs = exports.findMetaByRefineAndProperty(opf, cont.ID, "file-as");
            if (metaFileAs && metaFileAs.Property === "file-as") {
                contributor.SortAs = metaFileAs.Data;
            }
        }
        var metaRole = exports.findMetaByRefineAndProperty(opf, cont.ID, "role");
        if (metaRole && metaRole.Property === "role") {
            role = metaRole.Data;
        }
        if (!role && forcedRole) {
            role = forcedRole;
        }
        var metaAlt = exports.findAllMetaByRefineAndProperty(opf, cont.ID, "alternate-script");
        if (metaAlt && metaAlt.length) {
            contributor.Name = {};
            metaAlt.forEach(function (m) {
                if (m.Lang) {
                    contributor.Name[m.Lang] = m.Data;
                }
            });
            var xmlLang = cont.Lang || opf.Lang;
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
exports.findMetaByRefineAndProperty = function (opf, ID, property) {
    var ret = exports.findAllMetaByRefineAndProperty(opf, ID, property);
    if (ret.length) {
        return ret[0];
    }
    return undefined;
};
exports.findAllMetaByRefineAndProperty = function (opf, ID, property) {
    var _a, _b, _c, _d, _e;
    var metas = [];
    var refineID = "#" + ID;
    var func = function (metaTag) {
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
exports.findInSpineByHref = function (publication, href) {
    if (publication.Spine && publication.Spine.length) {
        var ll = publication.Spine.find(function (l) {
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
exports.findInManifestByID = function (publication, rootfile, opf, ID, zip, addLinkData) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var item, linkItem, itemHrefDecoded;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(opf.Manifest && opf.Manifest.length)) return [3, 2];
                item = opf.Manifest.find(function (manItem) {
                    if (manItem.ID === ID) {
                        return true;
                    }
                    return false;
                });
                if (!(item && opf.ZipPath)) return [3, 2];
                linkItem = new publication_link_1.Link();
                linkItem.TypeLink = item.MediaType;
                itemHrefDecoded = item.HrefDecoded;
                if (!itemHrefDecoded) {
                    return [2, Promise.reject("item.Href?!")];
                }
                linkItem.setHrefDecoded(path.join(path.dirname(opf.ZipPath), itemHrefDecoded)
                    .replace(/\\/g, "/"));
                return [4, addLinkData(publication, rootfile, opf, zip, linkItem, item)];
            case 1:
                _a.sent();
                return [2, linkItem];
            case 2: return [2, Promise.reject("ID " + ID + " not found")];
        }
    });
}); };
exports.fillSpineAndResource = function (publication, rootfile, opf, zip, addLinkData) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _i, _a, item, linkItem, err_1, _b, _c, item, itemHrefDecoded, zipPath, linkSpine, linkItem;
    return tslib_1.__generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!opf.ZipPath) {
                    return [2];
                }
                if (!(opf.Spine && opf.Spine.Items && opf.Spine.Items.length)) return [3, 7];
                _i = 0, _a = opf.Spine.Items;
                _d.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3, 7];
                item = _a[_i];
                if (!(!item.Linear || item.Linear === "yes")) return [3, 6];
                linkItem = void 0;
                _d.label = 2;
            case 2:
                _d.trys.push([2, 4, , 5]);
                return [4, exports.findInManifestByID(publication, rootfile, opf, item.IDref, zip, addLinkData)];
            case 3:
                linkItem = _d.sent();
                return [3, 5];
            case 4:
                err_1 = _d.sent();
                debug(err_1);
                return [3, 6];
            case 5:
                if (linkItem && linkItem.Href) {
                    if (!publication.Spine) {
                        publication.Spine = [];
                    }
                    publication.Spine.push(linkItem);
                }
                _d.label = 6;
            case 6:
                _i++;
                return [3, 1];
            case 7:
                if (!(opf.Manifest && opf.Manifest.length)) return [3, 11];
                _b = 0, _c = opf.Manifest;
                _d.label = 8;
            case 8:
                if (!(_b < _c.length)) return [3, 11];
                item = _c[_b];
                itemHrefDecoded = item.HrefDecoded;
                if (!itemHrefDecoded) {
                    debug("!? item.Href");
                    return [3, 10];
                }
                zipPath = path.join(path.dirname(opf.ZipPath), itemHrefDecoded)
                    .replace(/\\/g, "/");
                linkSpine = exports.findInSpineByHref(publication, zipPath);
                if (!(!linkSpine || !linkSpine.Href)) return [3, 10];
                linkItem = new publication_link_1.Link();
                linkItem.TypeLink = item.MediaType;
                linkItem.setHrefDecoded(zipPath);
                return [4, addLinkData(publication, rootfile, opf, zip, linkItem, item)];
            case 9:
                _d.sent();
                if (!publication.Resources) {
                    publication.Resources = [];
                }
                publication.Resources.push(linkItem);
                _d.label = 10;
            case 10:
                _b++;
                return [3, 8];
            case 11: return [2];
        }
    });
}); };
exports.addLanguage = function (publication, opf) {
    var _a, _b, _c, _d, _e;
    var opfMetadataLanguage = ((_c = (_b = (_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.DCMetadata) === null || _b === void 0 ? void 0 : _b.Language) === null || _c === void 0 ? void 0 : _c.length) ?
        opf.Metadata.DCMetadata.Language :
        (((_e = (_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Language) === null || _e === void 0 ? void 0 : _e.length) ?
            opf.Metadata.Language :
            undefined);
    if (opfMetadataLanguage) {
        publication.Metadata.Language = opfMetadataLanguage;
    }
};
exports.addIdentifier = function (publication, opf) {
    var _a, _b, _c, _d, _e;
    var opfMetadataIdentifier = ((_c = (_b = (_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.DCMetadata) === null || _b === void 0 ? void 0 : _b.Identifier) === null || _c === void 0 ? void 0 : _c.length) ?
        opf.Metadata.DCMetadata.Identifier :
        (((_e = (_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Identifier) === null || _e === void 0 ? void 0 : _e.length) ?
            opf.Metadata.Identifier :
            undefined);
    if (opfMetadataIdentifier) {
        if (opf.UniqueIdentifier && opfMetadataIdentifier.length > 1) {
            opfMetadataIdentifier.forEach(function (iden) {
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
exports.addTitle = function (publication, rootfile, opf) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var opfMetadataTitle = ((_c = (_b = (_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.DCMetadata) === null || _b === void 0 ? void 0 : _b.Title) === null || _c === void 0 ? void 0 : _c.length) ?
        opf.Metadata.DCMetadata.Title :
        (((_e = (_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Title) === null || _e === void 0 ? void 0 : _e.length) ?
            opf.Metadata.Title :
            undefined);
    if (rootfile && exports.isEpub3OrMore(rootfile, opf)) {
        var mainTitle = void 0;
        var subTitle_1;
        var subTitleDisplaySeq_1 = 0;
        if (opfMetadataTitle) {
            if (((_f = opf.Metadata) === null || _f === void 0 ? void 0 : _f.Meta) || ((_h = (_g = opf.Metadata) === null || _g === void 0 ? void 0 : _g.XMetadata) === null || _h === void 0 ? void 0 : _h.Meta)) {
                var tt = opfMetadataTitle.find(function (title) {
                    var _a, _b, _c;
                    var refineID = "#" + title.ID;
                    var func0 = function (meta) {
                        if (meta.Data === "main" && meta.Refine === refineID) {
                            return true;
                        }
                        return false;
                    };
                    var m = ((_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.Meta) ? opf.Metadata.Meta.find(func0) : undefined;
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
                opfMetadataTitle.forEach(function (title) {
                    var _a, _b, _c, _d, _e, _f;
                    var refineID = "#" + title.ID;
                    var func1 = function (meta) {
                        if (meta.Data === "subtitle" && meta.Refine === refineID) {
                            return true;
                        }
                        return false;
                    };
                    var m = ((_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.Meta) ? opf.Metadata.Meta.find(func1) : undefined;
                    if (!m && ((_c = (_b = opf.Metadata) === null || _b === void 0 ? void 0 : _b.XMetadata) === null || _c === void 0 ? void 0 : _c.Meta)) {
                        m = opf.Metadata.XMetadata.Meta.find(func1);
                    }
                    if (m) {
                        var titleDisplaySeq = 0;
                        var func2 = function (meta) {
                            if (meta.Property === "display-seq" && meta.Refine === refineID) {
                                return true;
                            }
                            return false;
                        };
                        var mds = ((_d = opf.Metadata) === null || _d === void 0 ? void 0 : _d.Meta) ? opf.Metadata.Meta.find(func2) : undefined;
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
                        if (!subTitle_1 || titleDisplaySeq < subTitleDisplaySeq_1) {
                            subTitle_1 = title;
                            subTitleDisplaySeq_1 = titleDisplaySeq;
                        }
                    }
                });
            }
            if (!mainTitle) {
                mainTitle = opfMetadataTitle[0];
            }
        }
        if (mainTitle) {
            var metaAlt = exports.findAllMetaByRefineAndProperty(opf, mainTitle.ID, "alternate-script");
            if (metaAlt && metaAlt.length) {
                publication.Metadata.Title = {};
                metaAlt.forEach(function (m) {
                    if (m.Lang) {
                        publication.Metadata.Title[m.Lang.toLowerCase()] = m.Data;
                    }
                });
                var xmlLang = mainTitle.Lang || opf.Lang;
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
        if (subTitle_1) {
            var metaAlt = exports.findAllMetaByRefineAndProperty(opf, subTitle_1.ID, "alternate-script");
            if (metaAlt && metaAlt.length) {
                publication.Metadata.SubTitle = {};
                metaAlt.forEach(function (m) {
                    if (m.Lang) {
                        publication.Metadata.SubTitle[m.Lang.toLowerCase()] = m.Data;
                    }
                });
                var xmlLang = subTitle_1.Lang || opf.Lang;
                if (xmlLang) {
                    publication.Metadata.SubTitle[xmlLang.toLowerCase()] = subTitle_1.Data;
                }
                else if (publication.Metadata.Language &&
                    publication.Metadata.Language.length &&
                    !publication.Metadata.SubTitle[publication.Metadata.Language[0].toLowerCase()]) {
                    publication.Metadata.SubTitle[publication.Metadata.Language[0].toLowerCase()] = subTitle_1.Data;
                }
                else {
                    publication.Metadata.SubTitle[exports.BCP47_UNKNOWN_LANG] = subTitle_1.Data;
                }
            }
            else {
                publication.Metadata.SubTitle = subTitle_1.Data;
            }
        }
    }
    else {
        if (opfMetadataTitle) {
            publication.Metadata.Title = opfMetadataTitle[0].Data;
        }
    }
};
exports.setPublicationDirection = function (publication, opf) {
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
        var lang = publication.Metadata.Language[0].toLowerCase();
        if ((lang === "ar" || lang.startsWith("ar-") ||
            lang === "he" || lang.startsWith("he-") ||
            lang === "fa" || lang.startsWith("fa-")) ||
            lang === "zh-Hant" ||
            lang === "zh-TW") {
            publication.Metadata.Direction = metadata_1.DirectionEnum.RTL;
        }
    }
};
exports.getNcx = function (ncxManItem, opf, zip) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var dname, ncxManItemHrefDecoded, ncxFilePath, has, err, zipEntries, _i, zipEntries_1, zipEntry, ncxZipStream_, err_2, ncxZipStream, ncxZipData, err_3, ncxStr, ncxDoc, ncx;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!opf.ZipPath) {
                    return [2, Promise.reject("?!!opf.ZipPath")];
                }
                dname = path.dirname(opf.ZipPath);
                ncxManItemHrefDecoded = ncxManItem.HrefDecoded;
                if (!ncxManItemHrefDecoded) {
                    return [2, Promise.reject("?!ncxManItem.Href")];
                }
                ncxFilePath = path.join(dname, ncxManItemHrefDecoded).replace(/\\/g, "/");
                return [4, zipHasEntry_1.zipHasEntry(zip, ncxFilePath, undefined)];
            case 1:
                has = _a.sent();
                if (!!has) return [3, 3];
                err = "NOT IN ZIP (NCX): " + ncxManItem.Href + " --- " + ncxFilePath;
                debug(err);
                return [4, zip.getEntries()];
            case 2:
                zipEntries = _a.sent();
                for (_i = 0, zipEntries_1 = zipEntries; _i < zipEntries_1.length; _i++) {
                    zipEntry = zipEntries_1[_i];
                    debug(zipEntry);
                }
                return [2, Promise.reject(err)];
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4, zip.entryStreamPromise(ncxFilePath)];
            case 4:
                ncxZipStream_ = _a.sent();
                return [3, 6];
            case 5:
                err_2 = _a.sent();
                debug(err_2);
                return [2, Promise.reject(err_2)];
            case 6:
                ncxZipStream = ncxZipStream_.stream;
                _a.label = 7;
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4, BufferUtils_1.streamToBufferPromise(ncxZipStream)];
            case 8:
                ncxZipData = _a.sent();
                return [3, 10];
            case 9:
                err_3 = _a.sent();
                debug(err_3);
                return [2, Promise.reject(err_3)];
            case 10:
                ncxStr = ncxZipData.toString("utf8");
                ncxDoc = new xmldom.DOMParser().parseFromString(ncxStr);
                ncx = xml_js_mapper_1.XML.deserialize(ncxDoc, ncx_1.NCX);
                ncx.ZipPath = ncxFilePath;
                return [2, ncx];
        }
    });
}); };
exports.getOpf = function (zip, rootfilePathDecoded, rootfilePath) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var has, err, zipEntries, _i, zipEntries_2, zipEntry, opfZipStream_, err_4, opfZipStream, opfZipData, err_5, opfStr, opfDoc, opf;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, zipHasEntry_1.zipHasEntry(zip, rootfilePathDecoded, rootfilePath)];
            case 1:
                has = _a.sent();
                if (!!has) return [3, 3];
                err = "NOT IN ZIP (container OPF rootfile): " + rootfilePath + " --- " + rootfilePathDecoded;
                debug(err);
                return [4, zip.getEntries()];
            case 2:
                zipEntries = _a.sent();
                for (_i = 0, zipEntries_2 = zipEntries; _i < zipEntries_2.length; _i++) {
                    zipEntry = zipEntries_2[_i];
                    debug(zipEntry);
                }
                return [2, Promise.reject(err)];
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4, zip.entryStreamPromise(rootfilePathDecoded)];
            case 4:
                opfZipStream_ = _a.sent();
                return [3, 6];
            case 5:
                err_4 = _a.sent();
                debug(err_4);
                return [2, Promise.reject(err_4)];
            case 6:
                opfZipStream = opfZipStream_.stream;
                _a.label = 7;
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4, BufferUtils_1.streamToBufferPromise(opfZipStream)];
            case 8:
                opfZipData = _a.sent();
                return [3, 10];
            case 9:
                err_5 = _a.sent();
                debug(err_5);
                return [2, Promise.reject(err_5)];
            case 10:
                opfStr = opfZipData.toString("utf8");
                opfDoc = new xmldom.DOMParser().parseFromString(opfStr);
                opf = xml_js_mapper_1.XML.deserialize(opfDoc, opf_1.OPF);
                opf.ZipPath = rootfilePathDecoded;
                return [2, opf];
        }
    });
}); };
exports.addOtherMetadata = function (publication, rootfile, opf) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7;
    if (!((_a = opf.Metadata) === null || _a === void 0 ? void 0 : _a.DCMetadata)) {
        return;
    }
    var opfMetadataRights = ((_d = (_c = (_b = opf.Metadata) === null || _b === void 0 ? void 0 : _b.DCMetadata) === null || _c === void 0 ? void 0 : _c.Rights) === null || _d === void 0 ? void 0 : _d.length) ?
        opf.Metadata.DCMetadata.Rights :
        (((_f = (_e = opf.Metadata) === null || _e === void 0 ? void 0 : _e.Rights) === null || _f === void 0 ? void 0 : _f.length) ?
            opf.Metadata.Rights :
            undefined);
    if (opfMetadataRights) {
        publication.Metadata.Rights = opfMetadataRights.join(" ");
    }
    var opfMetadataDescription = ((_j = (_h = (_g = opf.Metadata) === null || _g === void 0 ? void 0 : _g.DCMetadata) === null || _h === void 0 ? void 0 : _h.Description) === null || _j === void 0 ? void 0 : _j.length) ?
        opf.Metadata.DCMetadata.Description :
        (((_l = (_k = opf.Metadata) === null || _k === void 0 ? void 0 : _k.Description) === null || _l === void 0 ? void 0 : _l.length) ?
            opf.Metadata.Description :
            undefined);
    if (opfMetadataDescription) {
        publication.Metadata.Description = opfMetadataDescription[0];
    }
    var opfMetadataPublisher = ((_p = (_o = (_m = opf.Metadata) === null || _m === void 0 ? void 0 : _m.DCMetadata) === null || _o === void 0 ? void 0 : _o.Publisher) === null || _p === void 0 ? void 0 : _p.length) ?
        opf.Metadata.DCMetadata.Publisher :
        (((_r = (_q = opf.Metadata) === null || _q === void 0 ? void 0 : _q.Publisher) === null || _r === void 0 ? void 0 : _r.length) ?
            opf.Metadata.Publisher :
            undefined);
    if (opfMetadataPublisher) {
        publication.Metadata.Publisher = [];
        opfMetadataPublisher.forEach(function (pub) {
            var contrib = new metadata_contributor_1.Contributor();
            contrib.Name = pub;
            publication.Metadata.Publisher.push(contrib);
        });
    }
    var opfMetadataSource = ((_u = (_t = (_s = opf.Metadata) === null || _s === void 0 ? void 0 : _s.DCMetadata) === null || _t === void 0 ? void 0 : _t.Source) === null || _u === void 0 ? void 0 : _u.length) ?
        opf.Metadata.DCMetadata.Source :
        (((_w = (_v = opf.Metadata) === null || _v === void 0 ? void 0 : _v.Source) === null || _w === void 0 ? void 0 : _w.length) ?
            opf.Metadata.Source :
            undefined);
    if (opfMetadataSource) {
        publication.Metadata.Source = opfMetadataSource[0];
    }
    var opfMetadataContributor = ((_z = (_y = (_x = opf.Metadata) === null || _x === void 0 ? void 0 : _x.DCMetadata) === null || _y === void 0 ? void 0 : _y.Contributor) === null || _z === void 0 ? void 0 : _z.length) ?
        opf.Metadata.DCMetadata.Contributor :
        (((_1 = (_0 = opf.Metadata) === null || _0 === void 0 ? void 0 : _0.Contributor) === null || _1 === void 0 ? void 0 : _1.length) ?
            opf.Metadata.Contributor :
            undefined);
    if (opfMetadataContributor) {
        opfMetadataContributor.forEach(function (cont) {
            exports.addContributor(publication, rootfile, opf, cont, undefined);
        });
    }
    var opfMetadataCreator = ((_4 = (_3 = (_2 = opf.Metadata) === null || _2 === void 0 ? void 0 : _2.DCMetadata) === null || _3 === void 0 ? void 0 : _3.Creator) === null || _4 === void 0 ? void 0 : _4.length) ?
        opf.Metadata.DCMetadata.Creator :
        (((_6 = (_5 = opf.Metadata) === null || _5 === void 0 ? void 0 : _5.Creator) === null || _6 === void 0 ? void 0 : _6.length) ?
            opf.Metadata.Creator :
            undefined);
    if (opfMetadataCreator) {
        opfMetadataCreator.forEach(function (cont) {
            exports.addContributor(publication, rootfile, opf, cont, "aut");
        });
    }
    if ((_7 = opf.Metadata) === null || _7 === void 0 ? void 0 : _7.Link) {
        opf.Metadata.Link.forEach(function (metaLink) {
            if (metaLink.Property === "a11y:certifierCredential") {
                var val = metaLink.Href;
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
                var val = metaLink.Href;
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
                var val = metaLink.Href;
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
        var AccessibilitySummarys_1 = [];
        var metaFunc = function (metaTag) {
            if (metaTag.Name === "schema:accessMode" ||
                metaTag.Property === "schema:accessMode") {
                var val = metaTag.Property ? metaTag.Data : metaTag.Content;
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
                var val = metaTag.Property ? metaTag.Data : metaTag.Content;
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
                var val = metaTag.Property ? metaTag.Data : metaTag.Content;
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
                var val = metaTag.Property ? metaTag.Data : metaTag.Content;
                if (!val) {
                    return;
                }
                val = val.trim();
                if (!val) {
                    return;
                }
                AccessibilitySummarys_1.push({
                    metaTag: metaTag,
                    val: val,
                });
            }
            else if (metaTag.Name === "schema:accessModeSufficient" ||
                metaTag.Property === "schema:accessModeSufficient") {
                var val = metaTag.Property ? metaTag.Data : metaTag.Content;
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
                var val = metaTag.Property ? metaTag.Data : metaTag.Content;
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
                var val = metaTag.Property ? metaTag.Data : metaTag.Content;
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
                var val = metaTag.Property ? metaTag.Data : metaTag.Content;
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
                var val = metaTag.Property ? metaTag.Data : metaTag.Content;
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
        if (AccessibilitySummarys_1.length === 1) {
            var tuple = AccessibilitySummarys_1[0];
            if (tuple.metaTag.Lang) {
                publication.Metadata.AccessibilitySummary = {};
                publication.Metadata.AccessibilitySummary[tuple.metaTag.Lang.toLowerCase()] = tuple.val;
            }
            else {
                publication.Metadata.AccessibilitySummary = tuple.val;
            }
        }
        else if (AccessibilitySummarys_1.length) {
            publication.Metadata.AccessibilitySummary = {};
            AccessibilitySummarys_1.forEach(function (tuple) {
                var xmlLang = tuple.metaTag.Lang || opf.Lang;
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
        var metasDuration_1 = [];
        var metasNarrator_1 = [];
        var metasActiveClass_1 = [];
        var metasPlaybackActiveClass_1 = [];
        var mFunc = function (metaTag) {
            if (metaTag.Name === "dtb:totalTime") {
                metasDuration_1.push(metaTag);
            }
            if (metaTag.Name === "dtb:multimediaType" ||
                metaTag.Name === "dtb:multimediaContent") {
                if (!publication.Metadata.AdditionalJSON) {
                    publication.Metadata.AdditionalJSON = {};
                }
                publication.Metadata.AdditionalJSON[metaTag.Name] = metaTag.Content;
            }
            if (metaTag.Property === "media:duration" && !metaTag.Refine) {
                metasDuration_1.push(metaTag);
            }
            if (metaTag.Property === "media:narrator") {
                metasNarrator_1.push(metaTag);
            }
            if (metaTag.Property === "media:active-class") {
                metasActiveClass_1.push(metaTag);
            }
            if (metaTag.Property === "media:playback-active-class") {
                metasPlaybackActiveClass_1.push(metaTag);
            }
        };
        if (opf.Metadata.Meta) {
            opf.Metadata.Meta.forEach(mFunc);
        }
        if (opf.Metadata.XMetadata.Meta) {
            opf.Metadata.XMetadata.Meta.forEach(mFunc);
        }
        if (metasDuration_1.length) {
            publication.Metadata.Duration = media_overlay_1.timeStrToSeconds(metasDuration_1[0].Property ? metasDuration_1[0].Data : metasDuration_1[0].Content);
        }
        if (metasNarrator_1.length) {
            if (!publication.Metadata.Narrator) {
                publication.Metadata.Narrator = [];
            }
            metasNarrator_1.forEach(function (metaNarrator) {
                var cont = new metadata_contributor_1.Contributor();
                cont.Name = metaNarrator.Data;
                publication.Metadata.Narrator.push(cont);
            });
        }
        if (metasActiveClass_1.length) {
            if (!publication.Metadata.MediaOverlay) {
                publication.Metadata.MediaOverlay = new metadata_media_overlay_1.MediaOverlay();
            }
            publication.Metadata.MediaOverlay.ActiveClass = metasActiveClass_1[0].Data;
        }
        if (metasPlaybackActiveClass_1.length) {
            if (!publication.Metadata.MediaOverlay) {
                publication.Metadata.MediaOverlay = new metadata_media_overlay_1.MediaOverlay();
            }
            publication.Metadata.MediaOverlay.PlaybackActiveClass = metasPlaybackActiveClass_1[0].Data;
        }
    }
};
exports.loadFileStrFromZipPath = function (linkHref, linkHrefDecoded, zip) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var zipData, err_6;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4, exports.loadFileBufferFromZipPath(linkHref, linkHrefDecoded, zip)];
            case 1:
                zipData = _a.sent();
                return [3, 3];
            case 2:
                err_6 = _a.sent();
                debug(err_6);
                return [2, Promise.reject(err_6)];
            case 3:
                if (zipData) {
                    return [2, zipData.toString("utf8")];
                }
                return [2, Promise.reject("?!zipData loadFileStrFromZipPath()")];
        }
    });
}); };
exports.loadFileBufferFromZipPath = function (linkHref, linkHrefDecoded, zip) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var has, zipEntries, _i, zipEntries_3, zipEntry, zipStream_, err_7, zipStream, zipData, err_8;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!linkHrefDecoded) {
                    debug("!?link.HrefDecoded");
                    return [2, undefined];
                }
                return [4, zipHasEntry_1.zipHasEntry(zip, linkHrefDecoded, linkHref)];
            case 1:
                has = _a.sent();
                if (!!has) return [3, 3];
                debug("NOT IN ZIP (loadFileBufferFromZipPath): " + linkHref + " --- " + linkHrefDecoded);
                return [4, zip.getEntries()];
            case 2:
                zipEntries = _a.sent();
                for (_i = 0, zipEntries_3 = zipEntries; _i < zipEntries_3.length; _i++) {
                    zipEntry = zipEntries_3[_i];
                    debug(zipEntry);
                }
                return [2, undefined];
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4, zip.entryStreamPromise(linkHrefDecoded)];
            case 4:
                zipStream_ = _a.sent();
                return [3, 6];
            case 5:
                err_7 = _a.sent();
                debug(err_7);
                return [2, Promise.reject(err_7)];
            case 6:
                zipStream = zipStream_.stream;
                _a.label = 7;
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4, BufferUtils_1.streamToBufferPromise(zipStream)];
            case 8:
                zipData = _a.sent();
                return [3, 10];
            case 9:
                err_8 = _a.sent();
                debug(err_8);
                return [2, Promise.reject(err_8)];
            case 10: return [2, zipData];
        }
    });
}); };
var fillLandmarksFromGuide = function (publication, opf) {
    if (opf.Guide && opf.Guide.length) {
        opf.Guide.forEach(function (ref) {
            if (ref.Href && opf.ZipPath) {
                var refHrefDecoded = ref.HrefDecoded;
                if (!refHrefDecoded) {
                    debug("ref.Href?!");
                    return;
                }
                var link = new publication_link_1.Link();
                var zipPath = path.join(path.dirname(opf.ZipPath), refHrefDecoded)
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
var fillTOCFromNCX = function (publication, ncx) {
    if (ncx.Points && ncx.Points.length) {
        ncx.Points.forEach(function (point) {
            if (!publication.TOC) {
                publication.TOC = [];
            }
            fillTOCFromNavPoint(publication, ncx, point, publication.TOC);
        });
    }
};
var fillTOCFromNavPoint = function (publication, ncx, point, node) {
    var srcDecoded = point.Content.SrcDecoded;
    if (!srcDecoded) {
        debug("?!point.Content.Src");
        return;
    }
    var link = new publication_link_1.Link();
    var zipPath = path.join(path.dirname(ncx.ZipPath), srcDecoded)
        .replace(/\\/g, "/");
    link.setHrefDecoded(zipPath);
    link.Title = point.Text;
    if (point.Points && point.Points.length) {
        point.Points.forEach(function (p) {
            if (!link.Children) {
                link.Children = [];
            }
            fillTOCFromNavPoint(publication, ncx, p, link.Children);
        });
    }
    node.push(link);
};
var fillPageListFromNCX = function (publication, ncx) {
    if (ncx.PageList && ncx.PageList.PageTarget && ncx.PageList.PageTarget.length) {
        ncx.PageList.PageTarget.forEach(function (pageTarget) {
            var link = new publication_link_1.Link();
            var srcDecoded = pageTarget.Content.SrcDecoded;
            if (!srcDecoded) {
                debug("!?srcDecoded");
                return;
            }
            var zipPath = path.join(path.dirname(ncx.ZipPath), srcDecoded)
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
exports.fillTOC = function (publication, opf, ncx) {
    if (ncx) {
        fillTOCFromNCX(publication, ncx);
        if (!publication.PageList) {
            fillPageListFromNCX(publication, ncx);
        }
    }
    fillLandmarksFromGuide(publication, opf);
};
exports.addMediaOverlaySMIL = function (link, manItemSmil, opf, zip) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var manItemSmilHrefDecoded, smilFilePath, has, zipEntries, _i, zipEntries_4, zipEntry, mo, moURL, moLink;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(manItemSmil && manItemSmil.MediaType && manItemSmil.MediaType.startsWith("application/smil"))) return [3, 4];
                if (!opf.ZipPath) return [3, 4];
                manItemSmilHrefDecoded = manItemSmil.HrefDecoded;
                if (!manItemSmilHrefDecoded) {
                    debug("!?manItemSmil.HrefDecoded");
                    return [2];
                }
                smilFilePath = path.join(path.dirname(opf.ZipPath), manItemSmilHrefDecoded)
                    .replace(/\\/g, "/");
                return [4, zipHasEntry_1.zipHasEntry(zip, smilFilePath, smilFilePath)];
            case 1:
                has = _a.sent();
                if (!!has) return [3, 3];
                debug("NOT IN ZIP (addMediaOverlay): " + smilFilePath);
                return [4, zip.getEntries()];
            case 2:
                zipEntries = _a.sent();
                for (_i = 0, zipEntries_4 = zipEntries; _i < zipEntries_4.length; _i++) {
                    zipEntry = zipEntries_4[_i];
                    debug(zipEntry);
                }
                return [2];
            case 3:
                mo = new media_overlay_1.MediaOverlayNode();
                mo.SmilPathInZip = smilFilePath;
                mo.initialized = false;
                link.MediaOverlays = mo;
                moURL = exports.mediaOverlayURLPath + "?" +
                    exports.mediaOverlayURLParam + "=" +
                    UrlUtils_1.encodeURIComponent_RFC3986(link.HrefDecoded ? link.HrefDecoded : link.Href);
                if (!link.Properties) {
                    link.Properties = new metadata_properties_1.Properties();
                }
                link.Properties.MediaOverlay = moURL;
                if (!link.Alternate) {
                    link.Alternate = [];
                }
                moLink = new publication_link_1.Link();
                moLink.Href = moURL;
                moLink.TypeLink = "application/vnd.syncnarr+json";
                moLink.Duration = link.Duration;
                link.Alternate.push(moLink);
                if (link.Properties && link.Properties.Encrypted) {
                    debug("ENCRYPTED SMIL MEDIA OVERLAY: " + (link.HrefDecoded ? link.HrefDecoded : link.Href));
                }
                _a.label = 4;
            case 4: return [2];
        }
    });
}); };
//# sourceMappingURL=epub-daisy-common.js.map