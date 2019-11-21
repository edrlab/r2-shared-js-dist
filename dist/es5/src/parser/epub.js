"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var debug_ = require("debug");
var fs = require("fs");
var image_size_1 = require("image-size");
var moment = require("moment");
var path = require("path");
var querystring = require("querystring");
var url_1 = require("url");
var xmldom = require("xmldom");
var xpath = require("xpath");
var media_overlay_1 = require("../models/media-overlay");
var metadata_1 = require("../models/metadata");
var metadata_belongsto_1 = require("../models/metadata-belongsto");
var metadata_contributor_1 = require("../models/metadata-contributor");
var metadata_media_overlay_1 = require("../models/metadata-media-overlay");
var metadata_properties_1 = require("../models/metadata-properties");
var metadata_subject_1 = require("../models/metadata-subject");
var publication_1 = require("../models/publication");
var publication_link_1 = require("../models/publication-link");
var metadata_encrypted_1 = require("r2-lcp-js/dist/es5/src/models/metadata-encrypted");
var lcp_1 = require("r2-lcp-js/dist/es5/src/parser/epub/lcp");
var serializable_1 = require("r2-lcp-js/dist/es5/src/serializable");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var BufferUtils_1 = require("r2-utils-js/dist/es5/src/_utils/stream/BufferUtils");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var zipFactory_1 = require("r2-utils-js/dist/es5/src/_utils/zip/zipFactory");
var transformer_1 = require("../transform/transformer");
var decodeURI_1 = require("../_utils/decodeURI");
var zipHasEntry_1 = require("../_utils/zipHasEntry");
var container_1 = require("./epub/container");
var display_options_1 = require("./epub/display-options");
var encryption_1 = require("./epub/encryption");
var ncx_1 = require("./epub/ncx");
var opf_1 = require("./epub/opf");
var opf_author_1 = require("./epub/opf-author");
var smil_1 = require("./epub/smil");
var smil_seq_1 = require("./epub/smil-seq");
var debug = debug_("r2:shared#parser/epub");
var epub3 = "3.0";
var epub301 = "3.0.1";
var epub31 = "3.1";
exports.mediaOverlayURLPath = "media-overlay.json";
exports.mediaOverlayURLParam = "resource";
exports.addCoverDimensions = function (publication, coverLink) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var zipInternal, zip, coverLinkHrefDecoded, has, zipEntries, _a, zipEntries_1, zipEntry, zipStream, err_1, zipData, imageInfo, err_2;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                zipInternal = publication.findFromInternal("zip");
                if (!zipInternal) return [3, 11];
                zip = zipInternal.Value;
                coverLinkHrefDecoded = coverLink.HrefDecoded;
                if (!coverLinkHrefDecoded) {
                    return [2];
                }
                return [4, zipHasEntry_1.zipHasEntry(zip, coverLinkHrefDecoded, coverLink.Href)];
            case 1:
                has = _b.sent();
                if (!!has) return [3, 3];
                console.log("NOT IN ZIP (addCoverDimensions): " + coverLink.Href + " --- " + coverLinkHrefDecoded);
                return [4, zip.getEntries()];
            case 2:
                zipEntries = _b.sent();
                for (_a = 0, zipEntries_1 = zipEntries; _a < zipEntries_1.length; _a++) {
                    zipEntry = zipEntries_1[_a];
                    console.log(zipEntry);
                }
                return [2];
            case 3:
                zipStream = void 0;
                _b.label = 4;
            case 4:
                _b.trys.push([4, 6, , 7]);
                return [4, zip.entryStreamPromise(coverLinkHrefDecoded)];
            case 5:
                zipStream = _b.sent();
                return [3, 7];
            case 6:
                err_1 = _b.sent();
                debug(coverLinkHrefDecoded);
                debug(coverLink.TypeLink);
                debug(err_1);
                return [2];
            case 7:
                zipData = void 0;
                _b.label = 8;
            case 8:
                _b.trys.push([8, 10, , 11]);
                return [4, BufferUtils_1.streamToBufferPromise(zipStream.stream)];
            case 9:
                zipData = _b.sent();
                imageInfo = image_size_1.imageSize(zipData);
                if (imageInfo && imageInfo.width && imageInfo.height) {
                    coverLink.Width = imageInfo.width;
                    coverLink.Height = imageInfo.height;
                    if (coverLink.TypeLink &&
                        coverLink.TypeLink.replace("jpeg", "jpg").replace("+xml", "")
                            !== ("image/" + imageInfo.type)) {
                        debug("Wrong image type? " + coverLink.TypeLink + " -- " + imageInfo.type);
                    }
                }
                return [3, 11];
            case 10:
                err_2 = _b.sent();
                debug(coverLinkHrefDecoded);
                debug(coverLink.TypeLink);
                debug(err_2);
                return [3, 11];
            case 11: return [2];
        }
    });
}); };
var EPUBis;
(function (EPUBis) {
    EPUBis["LocalExploded"] = "LocalExploded";
    EPUBis["LocalPacked"] = "LocalPacked";
    EPUBis["RemoteExploded"] = "RemoteExploded";
    EPUBis["RemotePacked"] = "RemotePacked";
})(EPUBis = exports.EPUBis || (exports.EPUBis = {}));
function isEPUBlication(urlOrPath) {
    var p = urlOrPath;
    var http = UrlUtils_1.isHTTP(urlOrPath);
    if (http) {
        var url = new url_1.URL(urlOrPath);
        p = url.pathname;
    }
    else if (fs.existsSync(path.join(urlOrPath, "META-INF", "container.xml"))) {
        return EPUBis.LocalExploded;
    }
    var fileName = path.basename(p);
    var ext = path.extname(fileName).toLowerCase();
    var epub = /\.epub[3]?$/.test(ext);
    if (epub) {
        return http ? EPUBis.RemotePacked : EPUBis.LocalPacked;
    }
    if (/META-INF[\/|\\]container.xml$/.test(p)) {
        return http ? EPUBis.RemoteExploded : EPUBis.LocalExploded;
    }
    return undefined;
}
exports.isEPUBlication = isEPUBlication;
function EpubParsePromise(filePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var isAnEPUB, filePathToLoad, url, zip, err_3, publication, lcpl, lcplZipPath, has, lcplZipStream_, err_4, lcplZipStream, lcplZipData, err_5, lcplStr, lcplJson, mime, encryption, encZipPath, encryptionXmlZipStream_, err_6, encryptionXmlZipStream, encryptionXmlZipData, err_7, encryptionXmlStr, encryptionXmlDoc, containerZipPath, containerXmlZipStream_, err_8, containerXmlZipStream, containerXmlZipData, err_9, containerXmlStr, containerXmlDoc, container, rootfile, rootfilePathDecoded, err, zipEntries, _a, zipEntries_2, zipEntry, opfZipStream_, err_10, opfZipStream, opfZipData, err_11, opfStr, opfDoc, opf, ncx, ncxManItem, dname, ncxManItemHrefDecoded, ncxFilePath, err, zipEntries, _b, zipEntries_3, zipEntry, ncxZipStream_, err_12, ncxZipStream, ncxZipData, err_13, ncxStr, ncxDoc, metasDuration_1, metasNarrator_1, metasActiveClass_1, metasPlaybackActiveClass_1, lang, pageMapLink;
        return tslib_1.__generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    isAnEPUB = isEPUBlication(filePath);
                    filePathToLoad = filePath;
                    if (isAnEPUB === EPUBis.LocalExploded) {
                        filePathToLoad = filePathToLoad.replace(/META-INF[\/|\\]container.xml$/, "");
                    }
                    else if (isAnEPUB === EPUBis.RemoteExploded) {
                        url = new url_1.URL(filePathToLoad);
                        url.pathname = url.pathname.replace(/META-INF[\/|\\]container.xml$/, "");
                        filePathToLoad = url.toString();
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4, zipFactory_1.zipLoadPromise(filePathToLoad)];
                case 2:
                    zip = _c.sent();
                    return [3, 4];
                case 3:
                    err_3 = _c.sent();
                    debug(err_3);
                    return [2, Promise.reject(err_3)];
                case 4:
                    if (!zip.hasEntries()) {
                        return [2, Promise.reject("EPUB zip empty")];
                    }
                    publication = new publication_1.Publication();
                    publication.Context = ["https://readium.org/webpub-manifest/context.jsonld"];
                    publication.Metadata = new metadata_1.Metadata();
                    publication.Metadata.RDFType = "http://schema.org/Book";
                    publication.Metadata.Modified = moment(Date.now()).toDate();
                    publication.AddToInternal("filename", path.basename(filePath));
                    publication.AddToInternal("type", "epub");
                    publication.AddToInternal("zip", zip);
                    lcplZipPath = "META-INF/license.lcpl";
                    return [4, zipHasEntry_1.zipHasEntry(zip, lcplZipPath, undefined)];
                case 5:
                    has = _c.sent();
                    if (!has) return [3, 14];
                    lcplZipStream_ = void 0;
                    _c.label = 6;
                case 6:
                    _c.trys.push([6, 8, , 9]);
                    return [4, zip.entryStreamPromise(lcplZipPath)];
                case 7:
                    lcplZipStream_ = _c.sent();
                    return [3, 9];
                case 8:
                    err_4 = _c.sent();
                    debug(err_4);
                    return [2, Promise.reject(err_4)];
                case 9:
                    lcplZipStream = lcplZipStream_.stream;
                    lcplZipData = void 0;
                    _c.label = 10;
                case 10:
                    _c.trys.push([10, 12, , 13]);
                    return [4, BufferUtils_1.streamToBufferPromise(lcplZipStream)];
                case 11:
                    lcplZipData = _c.sent();
                    return [3, 13];
                case 12:
                    err_5 = _c.sent();
                    debug(err_5);
                    return [2, Promise.reject(err_5)];
                case 13:
                    lcplStr = lcplZipData.toString("utf8");
                    lcplJson = global.JSON.parse(lcplStr);
                    lcpl = serializable_1.TaJsonDeserialize(lcplJson, lcp_1.LCP);
                    lcpl.ZipPath = lcplZipPath;
                    lcpl.JsonSource = lcplStr;
                    lcpl.init();
                    publication.LCP = lcpl;
                    mime = "application/vnd.readium.lcp.license.v1.0+json";
                    publication.AddLink(mime, ["license"], lcpl.ZipPath, undefined);
                    _c.label = 14;
                case 14:
                    encZipPath = "META-INF/encryption.xml";
                    return [4, zipHasEntry_1.zipHasEntry(zip, encZipPath, undefined)];
                case 15:
                    has = _c.sent();
                    if (!has) return [3, 24];
                    encryptionXmlZipStream_ = void 0;
                    _c.label = 16;
                case 16:
                    _c.trys.push([16, 18, , 19]);
                    return [4, zip.entryStreamPromise(encZipPath)];
                case 17:
                    encryptionXmlZipStream_ = _c.sent();
                    return [3, 19];
                case 18:
                    err_6 = _c.sent();
                    debug(err_6);
                    return [2, Promise.reject(err_6)];
                case 19:
                    encryptionXmlZipStream = encryptionXmlZipStream_.stream;
                    encryptionXmlZipData = void 0;
                    _c.label = 20;
                case 20:
                    _c.trys.push([20, 22, , 23]);
                    return [4, BufferUtils_1.streamToBufferPromise(encryptionXmlZipStream)];
                case 21:
                    encryptionXmlZipData = _c.sent();
                    return [3, 23];
                case 22:
                    err_7 = _c.sent();
                    debug(err_7);
                    return [2, Promise.reject(err_7)];
                case 23:
                    encryptionXmlStr = encryptionXmlZipData.toString("utf8");
                    encryptionXmlDoc = new xmldom.DOMParser().parseFromString(encryptionXmlStr);
                    encryption = xml_js_mapper_1.XML.deserialize(encryptionXmlDoc, encryption_1.Encryption);
                    encryption.ZipPath = encZipPath;
                    _c.label = 24;
                case 24:
                    containerZipPath = "META-INF/container.xml";
                    _c.label = 25;
                case 25:
                    _c.trys.push([25, 27, , 28]);
                    return [4, zip.entryStreamPromise(containerZipPath)];
                case 26:
                    containerXmlZipStream_ = _c.sent();
                    return [3, 28];
                case 27:
                    err_8 = _c.sent();
                    debug(err_8);
                    return [2, Promise.reject(err_8)];
                case 28:
                    containerXmlZipStream = containerXmlZipStream_.stream;
                    _c.label = 29;
                case 29:
                    _c.trys.push([29, 31, , 32]);
                    return [4, BufferUtils_1.streamToBufferPromise(containerXmlZipStream)];
                case 30:
                    containerXmlZipData = _c.sent();
                    return [3, 32];
                case 31:
                    err_9 = _c.sent();
                    debug(err_9);
                    return [2, Promise.reject(err_9)];
                case 32:
                    containerXmlStr = containerXmlZipData.toString("utf8");
                    containerXmlDoc = new xmldom.DOMParser().parseFromString(containerXmlStr);
                    container = xml_js_mapper_1.XML.deserialize(containerXmlDoc, container_1.Container);
                    container.ZipPath = containerZipPath;
                    rootfile = container.Rootfile[0];
                    rootfilePathDecoded = rootfile.PathDecoded;
                    if (!rootfilePathDecoded) {
                        return [2, Promise.reject("?!rootfile.PathDecoded")];
                    }
                    return [4, zipHasEntry_1.zipHasEntry(zip, rootfilePathDecoded, rootfile.Path)];
                case 33:
                    has = _c.sent();
                    if (!!has) return [3, 35];
                    err = "NOT IN ZIP (container OPF rootfile): " + rootfile.Path + " --- " + rootfilePathDecoded;
                    console.log(err);
                    return [4, zip.getEntries()];
                case 34:
                    zipEntries = _c.sent();
                    for (_a = 0, zipEntries_2 = zipEntries; _a < zipEntries_2.length; _a++) {
                        zipEntry = zipEntries_2[_a];
                        console.log(zipEntry);
                    }
                    return [2, Promise.reject(err)];
                case 35:
                    _c.trys.push([35, 37, , 38]);
                    return [4, zip.entryStreamPromise(rootfilePathDecoded)];
                case 36:
                    opfZipStream_ = _c.sent();
                    return [3, 38];
                case 37:
                    err_10 = _c.sent();
                    debug(err_10);
                    return [2, Promise.reject(err_10)];
                case 38:
                    opfZipStream = opfZipStream_.stream;
                    _c.label = 39;
                case 39:
                    _c.trys.push([39, 41, , 42]);
                    return [4, BufferUtils_1.streamToBufferPromise(opfZipStream)];
                case 40:
                    opfZipData = _c.sent();
                    return [3, 42];
                case 41:
                    err_11 = _c.sent();
                    debug(err_11);
                    return [2, Promise.reject(err_11)];
                case 42:
                    opfStr = opfZipData.toString("utf8");
                    opfDoc = new xmldom.DOMParser().parseFromString(opfStr);
                    opf = xml_js_mapper_1.XML.deserialize(opfDoc, opf_1.OPF);
                    opf.ZipPath = rootfilePathDecoded;
                    if (!opf.Spine.Toc) return [3, 54];
                    ncxManItem = opf.Manifest.find(function (manifestItem) {
                        return manifestItem.ID === opf.Spine.Toc;
                    });
                    if (!ncxManItem) return [3, 54];
                    dname = path.dirname(opf.ZipPath);
                    ncxManItemHrefDecoded = ncxManItem.HrefDecoded;
                    if (!ncxManItemHrefDecoded) {
                        return [2, Promise.reject("?!ncxManItem.Href")];
                    }
                    ncxFilePath = path.join(dname, ncxManItemHrefDecoded).replace(/\\/g, "/");
                    return [4, zipHasEntry_1.zipHasEntry(zip, ncxFilePath, undefined)];
                case 43:
                    has = _c.sent();
                    if (!!has) return [3, 45];
                    err = "NOT IN ZIP (NCX): " + ncxManItem.Href + " --- " + ncxFilePath;
                    console.log(err);
                    return [4, zip.getEntries()];
                case 44:
                    zipEntries = _c.sent();
                    for (_b = 0, zipEntries_3 = zipEntries; _b < zipEntries_3.length; _b++) {
                        zipEntry = zipEntries_3[_b];
                        console.log(zipEntry);
                    }
                    return [2, Promise.reject(err)];
                case 45:
                    ncxZipStream_ = void 0;
                    _c.label = 46;
                case 46:
                    _c.trys.push([46, 48, , 49]);
                    return [4, zip.entryStreamPromise(ncxFilePath)];
                case 47:
                    ncxZipStream_ = _c.sent();
                    return [3, 49];
                case 48:
                    err_12 = _c.sent();
                    debug(err_12);
                    return [2, Promise.reject(err_12)];
                case 49:
                    ncxZipStream = ncxZipStream_.stream;
                    ncxZipData = void 0;
                    _c.label = 50;
                case 50:
                    _c.trys.push([50, 52, , 53]);
                    return [4, BufferUtils_1.streamToBufferPromise(ncxZipStream)];
                case 51:
                    ncxZipData = _c.sent();
                    return [3, 53];
                case 52:
                    err_13 = _c.sent();
                    debug(err_13);
                    return [2, Promise.reject(err_13)];
                case 53:
                    ncxStr = ncxZipData.toString("utf8");
                    ncxDoc = new xmldom.DOMParser().parseFromString(ncxStr);
                    ncx = xml_js_mapper_1.XML.deserialize(ncxDoc, ncx_1.NCX);
                    ncx.ZipPath = ncxFilePath;
                    _c.label = 54;
                case 54:
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
                            opf.Metadata.Publisher.forEach(function (pub) {
                                var contrib = new metadata_contributor_1.Contributor();
                                contrib.Name = pub;
                                publication.Metadata.Publisher.push(contrib);
                            });
                        }
                        if (opf.Metadata.Source && opf.Metadata.Source.length) {
                            publication.Metadata.Source = opf.Metadata.Source[0];
                        }
                        if (opf.Metadata.Contributor && opf.Metadata.Contributor.length) {
                            opf.Metadata.Contributor.forEach(function (cont) {
                                addContributor(publication, rootfile, opf, cont, undefined);
                            });
                        }
                        if (opf.Metadata.Creator && opf.Metadata.Creator.length) {
                            opf.Metadata.Creator.forEach(function (cont) {
                                addContributor(publication, rootfile, opf, cont, "aut");
                            });
                        }
                        if (opf.Metadata.Meta) {
                            metasDuration_1 = [];
                            metasNarrator_1 = [];
                            metasActiveClass_1 = [];
                            metasPlaybackActiveClass_1 = [];
                            opf.Metadata.Meta.forEach(function (metaTag) {
                                if (metaTag.Property === "media:duration") {
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
                            });
                            if (metasDuration_1.length) {
                                publication.Metadata.Duration = media_overlay_1.timeStrToSeconds(metasDuration_1[0].Data);
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
                        lang = publication.Metadata.Language[0].toLowerCase();
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
                    return [4, fillSpineAndResource(publication, rootfile, opf)];
                case 55:
                    _c.sent();
                    return [4, addRendition(publication, rootfile, opf, zip)];
                case 56:
                    _c.sent();
                    return [4, addCoverRel(publication, rootfile, opf)];
                case 57:
                    _c.sent();
                    if (encryption) {
                        fillEncryptionInfo(publication, rootfile, opf, encryption, lcpl);
                    }
                    return [4, fillTOCFromNavDoc(publication, rootfile, opf, zip)];
                case 58:
                    _c.sent();
                    if (!publication.TOC || !publication.TOC.length) {
                        if (ncx) {
                            fillTOCFromNCX(publication, rootfile, opf, ncx);
                            if (!publication.PageList) {
                                fillPageListFromNCX(publication, rootfile, opf, ncx);
                            }
                        }
                        fillLandmarksFromGuide(publication, rootfile, opf);
                    }
                    if (!(!publication.PageList && publication.Resources)) return [3, 60];
                    pageMapLink = publication.Resources.find(function (item) {
                        return item.TypeLink === "application/oebps-page-map+xml";
                    });
                    if (!pageMapLink) return [3, 60];
                    return [4, fillPageListFromAdobePageMap(publication, rootfile, opf, zip, pageMapLink)];
                case 59:
                    _c.sent();
                    _c.label = 60;
                case 60:
                    fillCalibreSerieInfo(publication, rootfile, opf);
                    fillSubject(publication, rootfile, opf);
                    fillPublicationDate(publication, rootfile, opf);
                    return [4, fillMediaOverlay(publication, rootfile, opf, zip)];
                case 61:
                    _c.sent();
                    return [2, publication];
            }
        });
    });
}
exports.EpubParsePromise = EpubParsePromise;
function getAllMediaOverlays(publication) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var mos, _a, _b, link, _c, _d, mo, err_14;
        return tslib_1.__generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    mos = [];
                    if (!publication.Spine) return [3, 9];
                    _a = 0, _b = publication.Spine;
                    _e.label = 1;
                case 1:
                    if (!(_a < _b.length)) return [3, 9];
                    link = _b[_a];
                    if (!link.MediaOverlays) return [3, 8];
                    _c = 0, _d = link.MediaOverlays;
                    _e.label = 2;
                case 2:
                    if (!(_c < _d.length)) return [3, 8];
                    mo = _d[_c];
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 5, , 6]);
                    return [4, fillMediaOverlayParse(publication, mo)];
                case 4:
                    _e.sent();
                    return [3, 6];
                case 5:
                    err_14 = _e.sent();
                    return [2, Promise.reject(err_14)];
                case 6:
                    mos.push(mo);
                    _e.label = 7;
                case 7:
                    _c++;
                    return [3, 2];
                case 8:
                    _a++;
                    return [3, 1];
                case 9: return [2, Promise.resolve(mos)];
            }
        });
    });
}
exports.getAllMediaOverlays = getAllMediaOverlays;
function getMediaOverlay(publication, spineHref) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var mos, _a, _b, link, _c, _d, mo, err_15;
        return tslib_1.__generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    mos = [];
                    if (!publication.Spine) return [3, 9];
                    _a = 0, _b = publication.Spine;
                    _e.label = 1;
                case 1:
                    if (!(_a < _b.length)) return [3, 9];
                    link = _b[_a];
                    if (!(link.MediaOverlays && link.Href.indexOf(spineHref) >= 0)) return [3, 8];
                    _c = 0, _d = link.MediaOverlays;
                    _e.label = 2;
                case 2:
                    if (!(_c < _d.length)) return [3, 8];
                    mo = _d[_c];
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 5, , 6]);
                    return [4, fillMediaOverlayParse(publication, mo)];
                case 4:
                    _e.sent();
                    return [3, 6];
                case 5:
                    err_15 = _e.sent();
                    return [2, Promise.reject(err_15)];
                case 6:
                    mos.push(mo);
                    _e.label = 7;
                case 7:
                    _c++;
                    return [3, 2];
                case 8:
                    _a++;
                    return [3, 1];
                case 9: return [2, Promise.resolve(mos)];
            }
        });
    });
}
exports.getMediaOverlay = getMediaOverlay;
var fillMediaOverlayParse = function (publication, mo) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var link, relativePath_1, err, zipInternal, zip, has, err, zipEntries, _a, zipEntries_4, zipEntry, smilZipStream_, err_16, decryptFail, transformedStream, err_17, err, smilZipStream, smilZipData, err_18, smilStr, smilXmlDoc, smil, smilBodyTextRefDecoded, zipPath;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (mo.initialized || !mo.SmilPathInZip) {
                    return [2];
                }
                if (publication.Resources) {
                    relativePath_1 = mo.SmilPathInZip;
                    link = publication.Resources.find(function (l) {
                        if (l.Href === relativePath_1) {
                            return true;
                        }
                        return false;
                    });
                    if (!link) {
                        if (publication.Spine) {
                            link = publication.Spine.find(function (l) {
                                if (l.Href === relativePath_1) {
                                    return true;
                                }
                                return false;
                            });
                        }
                    }
                    if (!link) {
                        err = "Asset not declared in publication spine/resources! " + relativePath_1;
                        debug(err);
                        return [2, Promise.reject(err)];
                    }
                }
                zipInternal = publication.findFromInternal("zip");
                if (!zipInternal) {
                    return [2];
                }
                zip = zipInternal.Value;
                return [4, zipHasEntry_1.zipHasEntry(zip, mo.SmilPathInZip, undefined)];
            case 1:
                has = _b.sent();
                if (!!has) return [3, 3];
                err = "NOT IN ZIP (fillMediaOverlayParse): " + mo.SmilPathInZip;
                console.log(err);
                return [4, zip.getEntries()];
            case 2:
                zipEntries = _b.sent();
                for (_a = 0, zipEntries_4 = zipEntries; _a < zipEntries_4.length; _a++) {
                    zipEntry = zipEntries_4[_a];
                    console.log(zipEntry);
                }
                return [2, Promise.reject(err)];
            case 3:
                _b.trys.push([3, 5, , 6]);
                return [4, zip.entryStreamPromise(mo.SmilPathInZip)];
            case 4:
                smilZipStream_ = _b.sent();
                return [3, 6];
            case 5:
                err_16 = _b.sent();
                debug(err_16);
                return [2, Promise.reject(err_16)];
            case 6:
                if (!(link && link.Properties && link.Properties.Encrypted)) return [3, 11];
                decryptFail = false;
                transformedStream = void 0;
                _b.label = 7;
            case 7:
                _b.trys.push([7, 9, , 10]);
                return [4, transformer_1.Transformers.tryStream(publication, link, smilZipStream_, false, 0, 0)];
            case 8:
                transformedStream = _b.sent();
                return [3, 10];
            case 9:
                err_17 = _b.sent();
                debug(err_17);
                return [2, Promise.reject(err_17)];
            case 10:
                if (transformedStream) {
                    smilZipStream_ = transformedStream;
                }
                else {
                    decryptFail = true;
                }
                if (decryptFail) {
                    err = "Encryption scheme not supported.";
                    debug(err);
                    return [2, Promise.reject(err)];
                }
                _b.label = 11;
            case 11:
                smilZipStream = smilZipStream_.stream;
                _b.label = 12;
            case 12:
                _b.trys.push([12, 14, , 15]);
                return [4, BufferUtils_1.streamToBufferPromise(smilZipStream)];
            case 13:
                smilZipData = _b.sent();
                return [3, 15];
            case 14:
                err_18 = _b.sent();
                debug(err_18);
                return [2, Promise.reject(err_18)];
            case 15:
                smilStr = smilZipData.toString("utf8");
                smilXmlDoc = new xmldom.DOMParser().parseFromString(smilStr);
                smil = xml_js_mapper_1.XML.deserialize(smilXmlDoc, smil_1.SMIL);
                smil.ZipPath = mo.SmilPathInZip;
                mo.initialized = true;
                debug("PARSED SMIL: " + mo.SmilPathInZip);
                mo.Role = [];
                mo.Role.push("section");
                if (smil.Body) {
                    if (smil.Body.EpubType) {
                        smil.Body.EpubType.trim().split(" ").forEach(function (role) {
                            if (!role.length) {
                                return;
                            }
                            if (mo.Role.indexOf(role) < 0) {
                                mo.Role.push(role);
                            }
                        });
                    }
                    if (smil.Body.TextRef) {
                        smilBodyTextRefDecoded = smil.Body.TextRefDecoded;
                        if (!smilBodyTextRefDecoded) {
                            console.log("!?smilBodyTextRefDecoded");
                        }
                        else {
                            zipPath = path.join(path.dirname(smil.ZipPath), smilBodyTextRefDecoded)
                                .replace(/\\/g, "/");
                            mo.Text = zipPath;
                        }
                    }
                    if (smil.Body.Children && smil.Body.Children.length) {
                        smil.Body.Children.forEach(function (seqChild) {
                            if (!mo.Children) {
                                mo.Children = [];
                            }
                            addSeqToMediaOverlay(smil, publication, mo, mo.Children, seqChild);
                        });
                    }
                }
                return [2];
        }
    });
}); };
var fillMediaOverlay = function (publication, rootfile, opf, zip) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _loop_1, _a, _b, item;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!publication.Resources) {
                    return [2];
                }
                _loop_1 = function (item) {
                    var itemHrefDecoded, has, zipEntries, _a, zipEntries_5, zipEntry, manItemsHtmlWithSmil, mo;
                    return tslib_1.__generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (item.TypeLink !== "application/smil+xml") {
                                    return [2, "continue"];
                                }
                                itemHrefDecoded = item.HrefDecoded;
                                if (!itemHrefDecoded) {
                                    console.log("?!item.HrefDecoded");
                                    return [2, "continue"];
                                }
                                return [4, zipHasEntry_1.zipHasEntry(zip, itemHrefDecoded, item.Href)];
                            case 1:
                                has = _b.sent();
                                if (!!has) return [3, 3];
                                console.log("NOT IN ZIP (fillMediaOverlay): " + item.HrefDecoded + " --- " + itemHrefDecoded);
                                return [4, zip.getEntries()];
                            case 2:
                                zipEntries = _b.sent();
                                for (_a = 0, zipEntries_5 = zipEntries; _a < zipEntries_5.length; _a++) {
                                    zipEntry = zipEntries_5[_a];
                                    console.log(zipEntry);
                                }
                                return [2, "continue"];
                            case 3:
                                manItemsHtmlWithSmil = [];
                                opf.Manifest.forEach(function (manItemHtmlWithSmil) {
                                    if (manItemHtmlWithSmil.MediaOverlay) {
                                        var manItemSmil = opf.Manifest.find(function (mi) {
                                            if (mi.ID === manItemHtmlWithSmil.MediaOverlay) {
                                                return true;
                                            }
                                            return false;
                                        });
                                        if (manItemSmil && opf.ZipPath) {
                                            var manItemSmilHrefDecoded = manItemSmil.HrefDecoded;
                                            if (!manItemSmilHrefDecoded) {
                                                console.log("!?manItemSmil.Href");
                                                return;
                                            }
                                            var smilFilePath = path.join(path.dirname(opf.ZipPath), manItemSmilHrefDecoded)
                                                .replace(/\\/g, "/");
                                            if (smilFilePath === itemHrefDecoded) {
                                                manItemsHtmlWithSmil.push(manItemHtmlWithSmil);
                                            }
                                        }
                                    }
                                });
                                mo = new media_overlay_1.MediaOverlayNode();
                                mo.SmilPathInZip = itemHrefDecoded;
                                mo.initialized = false;
                                manItemsHtmlWithSmil.forEach(function (manItemHtmlWithSmil) {
                                    if (!opf.ZipPath) {
                                        return;
                                    }
                                    var manItemHtmlWithSmilHrefDecoded = manItemHtmlWithSmil.HrefDecoded;
                                    if (!manItemHtmlWithSmilHrefDecoded) {
                                        console.log("?!manItemHtmlWithSmil.Href");
                                        return;
                                    }
                                    var htmlPathInZip = path.join(path.dirname(opf.ZipPath), manItemHtmlWithSmilHrefDecoded)
                                        .replace(/\\/g, "/");
                                    var link = findLinKByHref(publication, rootfile, opf, htmlPathInZip);
                                    if (link) {
                                        if (!link.MediaOverlays) {
                                            link.MediaOverlays = [];
                                        }
                                        var alreadyExists = link.MediaOverlays.find(function (moo) {
                                            if (item.Href === moo.SmilPathInZip) {
                                                return true;
                                            }
                                            return false;
                                        });
                                        if (!alreadyExists) {
                                            link.MediaOverlays.push(mo);
                                        }
                                        if (!link.Properties) {
                                            link.Properties = new metadata_properties_1.Properties();
                                        }
                                        link.Properties.MediaOverlay = exports.mediaOverlayURLPath + "?" +
                                            exports.mediaOverlayURLParam + "=" + querystring.escape(link.Href);
                                    }
                                });
                                if (item.Properties && item.Properties.Encrypted) {
                                    debug("ENCRYPTED SMIL MEDIA OVERLAY: " + item.Href);
                                    return [2, "continue"];
                                }
                                return [2];
                        }
                    });
                };
                _a = 0, _b = publication.Resources;
                _c.label = 1;
            case 1:
                if (!(_a < _b.length)) return [3, 4];
                item = _b[_a];
                return [5, _loop_1(item)];
            case 2:
                _c.sent();
                _c.label = 3;
            case 3:
                _a++;
                return [3, 1];
            case 4: return [2];
        }
    });
}); };
var addSeqToMediaOverlay = function (smil, publication, rootMO, mo, seqChild) {
    if (!smil.ZipPath) {
        return;
    }
    var moc = new media_overlay_1.MediaOverlayNode();
    moc.initialized = rootMO.initialized;
    mo.push(moc);
    if (seqChild instanceof smil_seq_1.Seq) {
        moc.Role = [];
        moc.Role.push("section");
        var seq = seqChild;
        if (seq.EpubType) {
            seq.EpubType.trim().split(" ").forEach(function (role) {
                if (!role.length) {
                    return;
                }
                if (moc.Role.indexOf(role) < 0) {
                    moc.Role.push(role);
                }
            });
        }
        if (seq.TextRef) {
            var seqTextRefDecoded = seq.TextRefDecoded;
            if (!seqTextRefDecoded) {
                console.log("!?seqTextRefDecoded");
            }
            else {
                var zipPath = path.join(path.dirname(smil.ZipPath), seqTextRefDecoded)
                    .replace(/\\/g, "/");
                moc.Text = zipPath;
            }
        }
        if (seq.Children && seq.Children.length) {
            seq.Children.forEach(function (child) {
                if (!moc.Children) {
                    moc.Children = [];
                }
                addSeqToMediaOverlay(smil, publication, rootMO, moc.Children, child);
            });
        }
    }
    else {
        var par = seqChild;
        if (par.EpubType) {
            par.EpubType.trim().split(" ").forEach(function (role) {
                if (!role.length) {
                    return;
                }
                if (!moc.Role) {
                    moc.Role = [];
                }
                if (moc.Role.indexOf(role) < 0) {
                    moc.Role.push(role);
                }
            });
        }
        if (par.Text && par.Text.Src) {
            var parTextSrcDcoded = par.Text.SrcDecoded;
            if (!parTextSrcDcoded) {
                console.log("?!parTextSrcDcoded");
            }
            else {
                var zipPath = path.join(path.dirname(smil.ZipPath), parTextSrcDcoded)
                    .replace(/\\/g, "/");
                moc.Text = zipPath;
            }
        }
        if (par.Audio && par.Audio.Src) {
            var parAudioSrcDcoded = par.Audio.SrcDecoded;
            if (!parAudioSrcDcoded) {
                console.log("?!parAudioSrcDcoded");
            }
            else {
                var zipPath = path.join(path.dirname(smil.ZipPath), parAudioSrcDcoded)
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
var fillPublicationDate = function (publication, rootfile, opf) {
    if (opf.Metadata && opf.Metadata.Date && opf.Metadata.Date.length) {
        if (isEpub3OrMore(rootfile, opf) && opf.Metadata.Date[0] && opf.Metadata.Date[0].Data) {
            var token = opf.Metadata.Date[0].Data;
            try {
                var mom = moment(token);
                if (mom.isValid()) {
                    publication.Metadata.PublicationDate = mom.toDate();
                }
            }
            catch (err) {
                console.log("INVALID DATE/TIME? " + token);
            }
            return;
        }
        opf.Metadata.Date.forEach(function (date) {
            if (date.Data && date.Event && date.Event.indexOf("publication") >= 0) {
                var token = date.Data;
                try {
                    var mom = moment(token);
                    if (mom.isValid()) {
                        publication.Metadata.PublicationDate = mom.toDate();
                    }
                }
                catch (err) {
                    console.log("INVALID DATE/TIME? " + token);
                }
            }
        });
    }
};
var findContributorInMeta = function (publication, rootfile, opf) {
    if (opf.Metadata && opf.Metadata.Meta) {
        opf.Metadata.Meta.forEach(function (meta) {
            if (meta.Property === "dcterms:creator" || meta.Property === "dcterms:contributor") {
                var cont = new opf_author_1.Author();
                cont.Data = meta.Data;
                cont.ID = meta.ID;
                addContributor(publication, rootfile, opf, cont, undefined);
            }
        });
    }
};
var addContributor = function (publication, rootfile, opf, cont, forcedRole) {
    var contributor = new metadata_contributor_1.Contributor();
    var role;
    if (isEpub3OrMore(rootfile, opf)) {
        if (cont.FileAs) {
            contributor.SortAs = cont.FileAs;
        }
        else {
            var metaFileAs = findMetaByRefineAndProperty(rootfile, opf, cont.ID, "file-as");
            if (metaFileAs && metaFileAs.Property === "file-as") {
                contributor.SortAs = metaFileAs.Data;
            }
        }
        var metaRole = findMetaByRefineAndProperty(rootfile, opf, cont.ID, "role");
        if (metaRole && metaRole.Property === "role") {
            role = metaRole.Data;
        }
        if (!role && forcedRole) {
            role = forcedRole;
        }
        var metaAlt = findAllMetaByRefineAndProperty(rootfile, opf, cont.ID, "alternate-script");
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
                contributor.Name["_"] = cont.Data;
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
var addIdentifier = function (publication, _rootfile, opf) {
    if (opf.Metadata && opf.Metadata.Identifier) {
        if (opf.UniqueIdentifier && opf.Metadata.Identifier.length > 1) {
            opf.Metadata.Identifier.forEach(function (iden) {
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
var addTitle = function (publication, rootfile, opf) {
    if (isEpub3OrMore(rootfile, opf)) {
        var mainTitle = void 0;
        var subTitle_1;
        var subTitleDisplaySeq_1 = 0;
        if (opf.Metadata &&
            opf.Metadata.Title &&
            opf.Metadata.Title.length) {
            if (opf.Metadata.Meta) {
                var tt = opf.Metadata.Title.find(function (title) {
                    var refineID = "#" + title.ID;
                    var m = opf.Metadata.Meta.find(function (meta) {
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
                opf.Metadata.Title.forEach(function (title) {
                    var refineID = "#" + title.ID;
                    var m = opf.Metadata.Meta.find(function (meta) {
                        if (meta.Data === "subtitle" && meta.Refine === refineID) {
                            return true;
                        }
                        return false;
                    });
                    if (m) {
                        var titleDisplaySeq = 0;
                        var mds = opf.Metadata.Meta.find(function (meta) {
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
                        if (!subTitle_1 || titleDisplaySeq < subTitleDisplaySeq_1) {
                            subTitle_1 = title;
                            subTitleDisplaySeq_1 = titleDisplaySeq;
                        }
                    }
                });
            }
            if (!mainTitle) {
                mainTitle = opf.Metadata.Title[0];
            }
        }
        if (mainTitle) {
            var metaAlt = findAllMetaByRefineAndProperty(rootfile, opf, mainTitle.ID, "alternate-script");
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
                    publication.Metadata.Title["_"] = mainTitle.Data;
                }
            }
            else {
                publication.Metadata.Title = mainTitle.Data;
            }
        }
        if (subTitle_1) {
            var metaAlt = findAllMetaByRefineAndProperty(rootfile, opf, subTitle_1.ID, "alternate-script");
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
                    publication.Metadata.SubTitle["_"] = subTitle_1.Data;
                }
            }
            else {
                publication.Metadata.SubTitle = subTitle_1.Data;
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
var addRelAndPropertiesToLink = function (publication, link, linkEpub, rootfile, opf) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var spineProperties;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!linkEpub.Properties) return [3, 2];
                return [4, addToLinkFromProperties(publication, link, linkEpub.Properties)];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                spineProperties = findPropertiesInSpineForManifest(linkEpub, rootfile, opf);
                if (!spineProperties) return [3, 4];
                return [4, addToLinkFromProperties(publication, link, spineProperties)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2];
        }
    });
}); };
var addToLinkFromProperties = function (publication, link, propertiesString) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var properties, propertiesStruct, _a, properties_1, p, _b;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                properties = propertiesString.trim().split(" ");
                propertiesStruct = new metadata_properties_1.Properties();
                _a = 0, properties_1 = properties;
                _c.label = 1;
            case 1:
                if (!(_a < properties_1.length)) return [3, 31];
                p = properties_1[_a];
                _b = p;
                switch (_b) {
                    case "cover-image": return [3, 2];
                    case "nav": return [3, 4];
                    case "scripted": return [3, 5];
                    case "mathml": return [3, 6];
                    case "onix-record": return [3, 7];
                    case "svg": return [3, 8];
                    case "xmp-record": return [3, 9];
                    case "remote-resources": return [3, 10];
                    case "page-spread-left": return [3, 11];
                    case "page-spread-right": return [3, 12];
                    case "page-spread-center": return [3, 13];
                    case "rendition:spread-none": return [3, 14];
                    case "rendition:spread-auto": return [3, 15];
                    case "rendition:spread-landscape": return [3, 16];
                    case "rendition:spread-portrait": return [3, 17];
                    case "rendition:spread-both": return [3, 18];
                    case "rendition:layout-reflowable": return [3, 19];
                    case "rendition:layout-pre-paginated": return [3, 20];
                    case "rendition:orientation-auto": return [3, 21];
                    case "rendition:orientation-landscape": return [3, 22];
                    case "rendition:orientation-portrait": return [3, 23];
                    case "rendition:flow-auto": return [3, 24];
                    case "rendition:flow-paginated": return [3, 25];
                    case "rendition:flow-scrolled-continuous": return [3, 26];
                    case "rendition:flow-scrolled-doc": return [3, 27];
                }
                return [3, 28];
            case 2:
                link.AddRel("cover");
                return [4, exports.addCoverDimensions(publication, link)];
            case 3:
                _c.sent();
                return [3, 29];
            case 4:
                {
                    link.AddRel("contents");
                    return [3, 29];
                }
                _c.label = 5;
            case 5:
                {
                    if (!propertiesStruct.Contains) {
                        propertiesStruct.Contains = [];
                    }
                    propertiesStruct.Contains.push("js");
                    return [3, 29];
                }
                _c.label = 6;
            case 6:
                {
                    if (!propertiesStruct.Contains) {
                        propertiesStruct.Contains = [];
                    }
                    propertiesStruct.Contains.push("mathml");
                    return [3, 29];
                }
                _c.label = 7;
            case 7:
                {
                    if (!propertiesStruct.Contains) {
                        propertiesStruct.Contains = [];
                    }
                    propertiesStruct.Contains.push("onix");
                    return [3, 29];
                }
                _c.label = 8;
            case 8:
                {
                    if (!propertiesStruct.Contains) {
                        propertiesStruct.Contains = [];
                    }
                    propertiesStruct.Contains.push("svg");
                    return [3, 29];
                }
                _c.label = 9;
            case 9:
                {
                    if (!propertiesStruct.Contains) {
                        propertiesStruct.Contains = [];
                    }
                    propertiesStruct.Contains.push("xmp");
                    return [3, 29];
                }
                _c.label = 10;
            case 10:
                {
                    if (!propertiesStruct.Contains) {
                        propertiesStruct.Contains = [];
                    }
                    propertiesStruct.Contains.push("remote-resources");
                    return [3, 29];
                }
                _c.label = 11;
            case 11:
                {
                    propertiesStruct.Page = metadata_properties_1.PageEnum.Left;
                    return [3, 29];
                }
                _c.label = 12;
            case 12:
                {
                    propertiesStruct.Page = metadata_properties_1.PageEnum.Right;
                    return [3, 29];
                }
                _c.label = 13;
            case 13:
                {
                    propertiesStruct.Page = metadata_properties_1.PageEnum.Center;
                    return [3, 29];
                }
                _c.label = 14;
            case 14:
                {
                    propertiesStruct.Spread = metadata_properties_1.SpreadEnum.None;
                    return [3, 29];
                }
                _c.label = 15;
            case 15:
                {
                    propertiesStruct.Spread = metadata_properties_1.SpreadEnum.Auto;
                    return [3, 29];
                }
                _c.label = 16;
            case 16:
                {
                    propertiesStruct.Spread = metadata_properties_1.SpreadEnum.Landscape;
                    return [3, 29];
                }
                _c.label = 17;
            case 17:
                {
                    propertiesStruct.Spread = metadata_properties_1.SpreadEnum.Both;
                    return [3, 29];
                }
                _c.label = 18;
            case 18:
                {
                    propertiesStruct.Spread = metadata_properties_1.SpreadEnum.Both;
                    return [3, 29];
                }
                _c.label = 19;
            case 19:
                {
                    propertiesStruct.Layout = metadata_properties_1.LayoutEnum.Reflowable;
                    return [3, 29];
                }
                _c.label = 20;
            case 20:
                {
                    propertiesStruct.Layout = metadata_properties_1.LayoutEnum.Fixed;
                    return [3, 29];
                }
                _c.label = 21;
            case 21:
                {
                    propertiesStruct.Orientation = metadata_properties_1.OrientationEnum.Auto;
                    return [3, 29];
                }
                _c.label = 22;
            case 22:
                {
                    propertiesStruct.Orientation = metadata_properties_1.OrientationEnum.Landscape;
                    return [3, 29];
                }
                _c.label = 23;
            case 23:
                {
                    propertiesStruct.Orientation = metadata_properties_1.OrientationEnum.Portrait;
                    return [3, 29];
                }
                _c.label = 24;
            case 24:
                {
                    propertiesStruct.Overflow = metadata_properties_1.OverflowEnum.Auto;
                    return [3, 29];
                }
                _c.label = 25;
            case 25:
                {
                    propertiesStruct.Overflow = metadata_properties_1.OverflowEnum.Paginated;
                    return [3, 29];
                }
                _c.label = 26;
            case 26:
                {
                    propertiesStruct.Overflow = metadata_properties_1.OverflowEnum.ScrolledContinuous;
                    return [3, 29];
                }
                _c.label = 27;
            case 27:
                {
                    propertiesStruct.Overflow = metadata_properties_1.OverflowEnum.Scrolled;
                    return [3, 29];
                }
                _c.label = 28;
            case 28:
                {
                    return [3, 29];
                }
                _c.label = 29;
            case 29:
                if (propertiesStruct.Layout ||
                    propertiesStruct.Orientation ||
                    propertiesStruct.Overflow ||
                    propertiesStruct.Page ||
                    propertiesStruct.Spread ||
                    (propertiesStruct.Contains && propertiesStruct.Contains.length)) {
                    link.Properties = propertiesStruct;
                }
                _c.label = 30;
            case 30:
                _a++;
                return [3, 1];
            case 31: return [2];
        }
    });
}); };
var addMediaOverlay = function (link, linkEpub, rootfile, opf) {
    if (linkEpub.MediaOverlay) {
        var meta = findMetaByRefineAndProperty(rootfile, opf, linkEpub.MediaOverlay, "media:duration");
        if (meta) {
            link.Duration = media_overlay_1.timeStrToSeconds(meta.Data);
        }
    }
};
var findInManifestByID = function (publication, rootfile, opf, ID) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
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
                return [4, addRelAndPropertiesToLink(publication, linkItem, item, rootfile, opf)];
            case 1:
                _a.sent();
                addMediaOverlay(linkItem, item, rootfile, opf);
                return [2, linkItem];
            case 2: return [2, Promise.reject("ID " + ID + " not found")];
        }
    });
}); };
var addRendition = function (publication, _rootfile, opf, zip) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var rendition_1, displayOptionsZipPath, has, displayOptionsZipStream_, err_19, displayOptionsZipStream, displayOptionsZipData, err_20, displayOptionsStr, displayOptionsDoc, displayOptions, renditionPlatformAll_1, renditionPlatformIpad_1, renditionPlatformIphone_1;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(opf.Metadata && opf.Metadata.Meta && opf.Metadata.Meta.length)) return [3, 15];
                rendition_1 = new metadata_properties_1.Properties();
                opf.Metadata.Meta.forEach(function (meta) {
                    switch (meta.Property) {
                        case "rendition:layout": {
                            switch (meta.Data) {
                                case "pre-paginated": {
                                    rendition_1.Layout = metadata_properties_1.LayoutEnum.Fixed;
                                    break;
                                }
                                case "reflowable": {
                                    rendition_1.Layout = metadata_properties_1.LayoutEnum.Reflowable;
                                    break;
                                }
                            }
                            break;
                        }
                        case "rendition:orientation": {
                            switch (meta.Data) {
                                case "auto": {
                                    rendition_1.Orientation = metadata_properties_1.OrientationEnum.Auto;
                                    break;
                                }
                                case "landscape": {
                                    rendition_1.Orientation = metadata_properties_1.OrientationEnum.Landscape;
                                    break;
                                }
                                case "portrait": {
                                    rendition_1.Orientation = metadata_properties_1.OrientationEnum.Portrait;
                                    break;
                                }
                            }
                            break;
                        }
                        case "rendition:spread": {
                            switch (meta.Data) {
                                case "auto": {
                                    rendition_1.Spread = metadata_properties_1.SpreadEnum.Auto;
                                    break;
                                }
                                case "both": {
                                    rendition_1.Spread = metadata_properties_1.SpreadEnum.Both;
                                    break;
                                }
                                case "none": {
                                    rendition_1.Spread = metadata_properties_1.SpreadEnum.None;
                                    break;
                                }
                                case "landscape": {
                                    rendition_1.Spread = metadata_properties_1.SpreadEnum.Landscape;
                                    break;
                                }
                                case "portrait": {
                                    rendition_1.Spread = metadata_properties_1.SpreadEnum.Both;
                                    break;
                                }
                            }
                            break;
                        }
                        case "rendition:flow": {
                            switch (meta.Data) {
                                case "auto": {
                                    rendition_1.Overflow = metadata_properties_1.OverflowEnum.Auto;
                                    break;
                                }
                                case "paginated": {
                                    rendition_1.Overflow = metadata_properties_1.OverflowEnum.Paginated;
                                    break;
                                }
                                case "scrolled": {
                                    rendition_1.Overflow = metadata_properties_1.OverflowEnum.Scrolled;
                                    break;
                                }
                                case "scrolled-continuous": {
                                    rendition_1.Overflow = metadata_properties_1.OverflowEnum.ScrolledContinuous;
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
                if (!(!rendition_1.Layout || !rendition_1.Orientation)) return [3, 14];
                displayOptionsZipPath = "META-INF/com.apple.ibooks.display-options.xml";
                return [4, zipHasEntry_1.zipHasEntry(zip, displayOptionsZipPath, undefined)];
            case 1:
                has = _a.sent();
                if (!has) return [3, 2];
                debug("Info: found iBooks display-options XML");
                return [3, 4];
            case 2:
                displayOptionsZipPath = "META-INF/com.kobobooks.display-options.xml";
                return [4, zipHasEntry_1.zipHasEntry(zip, displayOptionsZipPath, undefined)];
            case 3:
                has = _a.sent();
                if (has) {
                    debug("Info: found Kobo display-options XML");
                }
                _a.label = 4;
            case 4:
                if (!!has) return [3, 5];
                debug("Info: not found iBooks or Kobo display-options XML");
                return [3, 14];
            case 5:
                displayOptionsZipStream_ = void 0;
                _a.label = 6;
            case 6:
                _a.trys.push([6, 8, , 9]);
                return [4, zip.entryStreamPromise(displayOptionsZipPath)];
            case 7:
                displayOptionsZipStream_ = _a.sent();
                return [3, 9];
            case 8:
                err_19 = _a.sent();
                debug(err_19);
                return [3, 9];
            case 9:
                if (!displayOptionsZipStream_) return [3, 14];
                displayOptionsZipStream = displayOptionsZipStream_.stream;
                displayOptionsZipData = void 0;
                _a.label = 10;
            case 10:
                _a.trys.push([10, 12, , 13]);
                return [4, BufferUtils_1.streamToBufferPromise(displayOptionsZipStream)];
            case 11:
                displayOptionsZipData = _a.sent();
                return [3, 13];
            case 12:
                err_20 = _a.sent();
                debug(err_20);
                return [3, 13];
            case 13:
                if (displayOptionsZipData) {
                    try {
                        displayOptionsStr = displayOptionsZipData.toString("utf8");
                        displayOptionsDoc = new xmldom.DOMParser().parseFromString(displayOptionsStr);
                        displayOptions = xml_js_mapper_1.XML.deserialize(displayOptionsDoc, display_options_1.DisplayOptions);
                        displayOptions.ZipPath = displayOptionsZipPath;
                        if (displayOptions && displayOptions.Platforms) {
                            renditionPlatformAll_1 = new metadata_properties_1.Properties();
                            renditionPlatformIpad_1 = new metadata_properties_1.Properties();
                            renditionPlatformIphone_1 = new metadata_properties_1.Properties();
                            displayOptions.Platforms.forEach(function (platform) {
                                if (platform.Options) {
                                    platform.Options.forEach(function (option) {
                                        if (!rendition_1.Layout) {
                                            if (option.Name === "fixed-layout") {
                                                if (option.Value === "true") {
                                                    rendition_1.Layout = metadata_properties_1.LayoutEnum.Fixed;
                                                }
                                                else {
                                                    rendition_1.Layout = metadata_properties_1.LayoutEnum.Reflowable;
                                                }
                                            }
                                        }
                                        if (!rendition_1.Orientation) {
                                            if (option.Name === "orientation-lock") {
                                                var rend = platform.Name === "*" ? renditionPlatformAll_1 :
                                                    (platform.Name === "ipad" ? renditionPlatformIpad_1 :
                                                        (platform.Name === "iphone" ? renditionPlatformIphone_1 :
                                                            renditionPlatformAll_1));
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
                            if (renditionPlatformAll_1.Orientation) {
                                rendition_1.Orientation = renditionPlatformAll_1.Orientation;
                            }
                            else if (renditionPlatformIpad_1.Orientation) {
                                rendition_1.Orientation = renditionPlatformIpad_1.Orientation;
                            }
                            else if (renditionPlatformIphone_1.Orientation) {
                                rendition_1.Orientation = renditionPlatformIphone_1.Orientation;
                            }
                        }
                    }
                    catch (err) {
                        debug(err);
                    }
                }
                _a.label = 14;
            case 14:
                if (rendition_1.Layout || rendition_1.Orientation || rendition_1.Overflow || rendition_1.Page || rendition_1.Spread) {
                    publication.Metadata.Rendition = rendition_1;
                }
                _a.label = 15;
            case 15: return [2];
        }
    });
}); };
var fillSpineAndResource = function (publication, rootfile, opf) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var _a, _b, item, linkItem, err_21, _c, _d, item, itemHrefDecoded, zipPath, linkSpine, linkItem;
    return tslib_1.__generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                if (!opf.ZipPath) {
                    return [2];
                }
                if (!(opf.Spine && opf.Spine.Items && opf.Spine.Items.length)) return [3, 7];
                _a = 0, _b = opf.Spine.Items;
                _e.label = 1;
            case 1:
                if (!(_a < _b.length)) return [3, 7];
                item = _b[_a];
                if (!(!item.Linear || item.Linear === "yes")) return [3, 6];
                linkItem = void 0;
                _e.label = 2;
            case 2:
                _e.trys.push([2, 4, , 5]);
                return [4, findInManifestByID(publication, rootfile, opf, item.IDref)];
            case 3:
                linkItem = _e.sent();
                return [3, 5];
            case 4:
                err_21 = _e.sent();
                debug(err_21);
                return [3, 6];
            case 5:
                if (linkItem && linkItem.Href) {
                    if (!publication.Spine) {
                        publication.Spine = [];
                    }
                    publication.Spine.push(linkItem);
                }
                _e.label = 6;
            case 6:
                _a++;
                return [3, 1];
            case 7:
                if (!(opf.Manifest && opf.Manifest.length)) return [3, 11];
                _c = 0, _d = opf.Manifest;
                _e.label = 8;
            case 8:
                if (!(_c < _d.length)) return [3, 11];
                item = _d[_c];
                itemHrefDecoded = item.HrefDecoded;
                if (!itemHrefDecoded) {
                    console.log("!? item.Href");
                    return [3, 10];
                }
                zipPath = path.join(path.dirname(opf.ZipPath), itemHrefDecoded)
                    .replace(/\\/g, "/");
                linkSpine = findInSpineByHref(publication, zipPath);
                if (!(!linkSpine || !linkSpine.Href)) return [3, 10];
                linkItem = new publication_link_1.Link();
                linkItem.TypeLink = item.MediaType;
                linkItem.setHrefDecoded(zipPath);
                return [4, addRelAndPropertiesToLink(publication, linkItem, item, rootfile, opf)];
            case 9:
                _e.sent();
                addMediaOverlay(linkItem, item, rootfile, opf);
                if (!publication.Resources) {
                    publication.Resources = [];
                }
                publication.Resources.push(linkItem);
                _e.label = 10;
            case 10:
                _c++;
                return [3, 8];
            case 11: return [2];
        }
    });
}); };
var fillEncryptionInfo = function (publication, _rootfile, _opf, encryption, lcp) {
    encryption.EncryptedData.forEach(function (encInfo) {
        var encrypted = new metadata_encrypted_1.Encrypted();
        encrypted.Algorithm = encInfo.EncryptionMethod.Algorithm;
        if (lcp &&
            encrypted.Algorithm !== "http://www.idpf.org/2008/embedding" &&
            encrypted.Algorithm !== "http://ns.adobe.com/pdf/enc#RC") {
            encrypted.Profile = lcp.Encryption.Profile;
            encrypted.Scheme = "http://readium.org/2014/01/lcp";
        }
        if (encInfo.EncryptionProperties && encInfo.EncryptionProperties.length) {
            encInfo.EncryptionProperties.forEach(function (prop) {
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
            publication.Resources.forEach(function (l, _i, _arr) {
                var filePath = l.Href;
                if (filePath === encInfo.CipherData.CipherReference.URI) {
                    if (!l.Properties) {
                        l.Properties = new metadata_properties_1.Properties();
                    }
                    l.Properties.Encrypted = encrypted;
                }
            });
        }
        if (publication.Spine) {
            publication.Spine.forEach(function (l, _i, _arr) {
                var filePath = l.Href;
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
var fillPageListFromNCX = function (publication, _rootfile, _opf, ncx) {
    if (ncx.PageList && ncx.PageList.PageTarget && ncx.PageList.PageTarget.length) {
        ncx.PageList.PageTarget.forEach(function (pageTarget) {
            var link = new publication_link_1.Link();
            var srcDecoded = pageTarget.Content.SrcDecoded;
            if (!srcDecoded) {
                console.log("!?srcDecoded");
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
var fillPageListFromAdobePageMap = function (publication, _rootfile, _opf, zip, l) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var pageMapContent, pageMapXmlDoc, pages, i, page, link, href, title, hrefDecoded, zipPath;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!l.HrefDecoded) {
                    return [2];
                }
                return [4, createDocStringFromZipPath(l, zip)];
            case 1:
                pageMapContent = _a.sent();
                if (!pageMapContent) {
                    return [2];
                }
                pageMapXmlDoc = new xmldom.DOMParser().parseFromString(pageMapContent);
                pages = pageMapXmlDoc.getElementsByTagName("page");
                if (pages && pages.length) {
                    for (i = 0; i < pages.length; i += 1) {
                        page = pages.item(i);
                        link = new publication_link_1.Link();
                        href = page.getAttribute("href");
                        title = page.getAttribute("name");
                        if (href === null || title === null) {
                            continue;
                        }
                        if (!publication.PageList) {
                            publication.PageList = [];
                        }
                        hrefDecoded = decodeURI_1.tryDecodeURI(href);
                        if (!hrefDecoded) {
                            continue;
                        }
                        zipPath = path.join(path.dirname(l.HrefDecoded), hrefDecoded)
                            .replace(/\\/g, "/");
                        link.setHrefDecoded(zipPath);
                        link.Title = title;
                        publication.PageList.push(link);
                    }
                }
                return [2];
        }
    });
}); };
var createDocStringFromZipPath = function (link, zip) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var linkHrefDecoded, has, zipEntries, _a, zipEntries_6, zipEntry, zipStream_, err_22, zipStream, zipData, err_23;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                linkHrefDecoded = link.HrefDecoded;
                if (!linkHrefDecoded) {
                    console.log("!?link.HrefDecoded");
                    return [2, undefined];
                }
                return [4, zipHasEntry_1.zipHasEntry(zip, linkHrefDecoded, link.Href)];
            case 1:
                has = _b.sent();
                if (!!has) return [3, 3];
                console.log("NOT IN ZIP (createDocStringFromZipPath): " + link.Href + " --- " + linkHrefDecoded);
                return [4, zip.getEntries()];
            case 2:
                zipEntries = _b.sent();
                for (_a = 0, zipEntries_6 = zipEntries; _a < zipEntries_6.length; _a++) {
                    zipEntry = zipEntries_6[_a];
                    console.log(zipEntry);
                }
                return [2, undefined];
            case 3:
                _b.trys.push([3, 5, , 6]);
                return [4, zip.entryStreamPromise(linkHrefDecoded)];
            case 4:
                zipStream_ = _b.sent();
                return [3, 6];
            case 5:
                err_22 = _b.sent();
                debug(err_22);
                return [2, Promise.reject(err_22)];
            case 6:
                zipStream = zipStream_.stream;
                _b.label = 7;
            case 7:
                _b.trys.push([7, 9, , 10]);
                return [4, BufferUtils_1.streamToBufferPromise(zipStream)];
            case 8:
                zipData = _b.sent();
                return [3, 10];
            case 9:
                err_23 = _b.sent();
                debug(err_23);
                return [2, Promise.reject(err_23)];
            case 10: return [2, zipData.toString("utf8")];
        }
    });
}); };
var fillTOCFromNCX = function (publication, rootfile, opf, ncx) {
    if (ncx.Points && ncx.Points.length) {
        ncx.Points.forEach(function (point) {
            if (!publication.TOC) {
                publication.TOC = [];
            }
            fillTOCFromNavPoint(publication, rootfile, opf, ncx, point, publication.TOC);
        });
    }
};
var fillLandmarksFromGuide = function (publication, _rootfile, opf) {
    if (opf.Guide && opf.Guide.length) {
        opf.Guide.forEach(function (ref) {
            if (ref.Href && opf.ZipPath) {
                var refHrefDecoded = ref.HrefDecoded;
                if (!refHrefDecoded) {
                    console.log("ref.Href?!");
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
var fillTOCFromNavPoint = function (publication, rootfile, opf, ncx, point, node) {
    var srcDecoded = point.Content.SrcDecoded;
    if (!srcDecoded) {
        console.log("?!point.Content.Src");
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
            fillTOCFromNavPoint(publication, rootfile, opf, ncx, p, link.Children);
        });
    }
    node.push(link);
};
var fillSubject = function (publication, _rootfile, opf) {
    if (opf.Metadata && opf.Metadata.Subject && opf.Metadata.Subject.length) {
        opf.Metadata.Subject.forEach(function (s) {
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
var fillCalibreSerieInfo = function (publication, _rootfile, opf) {
    var serie;
    var seriePosition;
    if (opf.Metadata && opf.Metadata.Meta && opf.Metadata.Meta.length) {
        opf.Metadata.Meta.forEach(function (m) {
            if (m.Name === "calibre:series") {
                serie = m.Content;
            }
            if (m.Name === "calibre:series_index") {
                seriePosition = parseFloat(m.Content);
            }
        });
    }
    if (serie) {
        var contributor = new metadata_contributor_1.Contributor();
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
var fillTOCFromNavDoc = function (publication, _rootfile, _opf, zip) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var navLink, navLinkHrefDecoded, has, zipEntries, _a, zipEntries_7, zipEntry, navDocZipStream_, err_24, navDocZipStream, navDocZipData, err_25, navDocStr, navXmlDoc, select, navs;
    return tslib_1.__generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                navLink = publication.GetNavDoc();
                if (!navLink) {
                    return [2];
                }
                navLinkHrefDecoded = navLink.HrefDecoded;
                if (!navLinkHrefDecoded) {
                    console.log("!?navLink.HrefDecoded");
                    return [2];
                }
                return [4, zipHasEntry_1.zipHasEntry(zip, navLinkHrefDecoded, navLink.Href)];
            case 1:
                has = _b.sent();
                if (!!has) return [3, 3];
                console.log("NOT IN ZIP (fillTOCFromNavDoc): " + navLink.Href + " --- " + navLinkHrefDecoded);
                return [4, zip.getEntries()];
            case 2:
                zipEntries = _b.sent();
                for (_a = 0, zipEntries_7 = zipEntries; _a < zipEntries_7.length; _a++) {
                    zipEntry = zipEntries_7[_a];
                    console.log(zipEntry);
                }
                return [2];
            case 3:
                _b.trys.push([3, 5, , 6]);
                return [4, zip.entryStreamPromise(navLinkHrefDecoded)];
            case 4:
                navDocZipStream_ = _b.sent();
                return [3, 6];
            case 5:
                err_24 = _b.sent();
                debug(err_24);
                return [2, Promise.reject(err_24)];
            case 6:
                navDocZipStream = navDocZipStream_.stream;
                _b.label = 7;
            case 7:
                _b.trys.push([7, 9, , 10]);
                return [4, BufferUtils_1.streamToBufferPromise(navDocZipStream)];
            case 8:
                navDocZipData = _b.sent();
                return [3, 10];
            case 9:
                err_25 = _b.sent();
                debug(err_25);
                return [2, Promise.reject(err_25)];
            case 10:
                navDocStr = navDocZipData.toString("utf8");
                navXmlDoc = new xmldom.DOMParser().parseFromString(navDocStr);
                select = xpath.useNamespaces({
                    epub: "http://www.idpf.org/2007/ops",
                    xhtml: "http://www.w3.org/1999/xhtml",
                });
                navs = select("/xhtml:html/xhtml:body//xhtml:nav", navXmlDoc);
                if (navs && navs.length) {
                    navs.forEach(function (navElement) {
                        var typeNav = select("@epub:type", navElement);
                        if (typeNav && typeNav.length) {
                            var olElem = select("xhtml:ol", navElement);
                            var roles = typeNav[0].value;
                            var role = roles.trim().split(" ")[0];
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
                    });
                }
                return [2];
        }
    });
}); };
var fillTOCFromNavDocWithOL = function (select, olElems, node, navDocPath) {
    olElems.forEach(function (olElem) {
        var liElems = select("xhtml:li", olElem);
        if (liElems && liElems.length) {
            liElems.forEach(function (liElem) {
                var link = new publication_link_1.Link();
                node.push(link);
                var aElems = select("xhtml:a", liElem);
                if (aElems && aElems.length > 0) {
                    var aHref = select("@href", aElems[0]);
                    if (aHref && aHref.length) {
                        var val = aHref[0].value;
                        var valDecoded = decodeURI_1.tryDecodeURI(val);
                        if (!valDecoded) {
                            console.log("!?valDecoded");
                            return;
                        }
                        if (val[0] === "#") {
                            valDecoded = path.basename(navDocPath) + valDecoded;
                        }
                        var zipPath = path.join(path.dirname(navDocPath), valDecoded)
                            .replace(/\\/g, "/");
                        link.setHrefDecoded(zipPath);
                    }
                    var aText = aElems[0].textContent;
                    if (aText && aText.length) {
                        aText = aText.trim();
                        aText = aText.replace(/\s\s+/g, " ");
                        link.Title = aText;
                    }
                }
                else {
                    var liFirstChild = select("xhtml:*[1]", liElem);
                    if (liFirstChild && liFirstChild.length && liFirstChild[0].textContent) {
                        link.Title = liFirstChild[0].textContent.trim();
                    }
                }
                var olElemsNext = select("xhtml:ol", liElem);
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
var addCoverRel = function (publication, rootfile, opf) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var coverID, manifestInfo, err_26, href_1, linky;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (opf.Metadata && opf.Metadata.Meta && opf.Metadata.Meta.length) {
                    opf.Metadata.Meta.find(function (meta) {
                        if (meta.Name === "cover") {
                            coverID = meta.Content;
                            return true;
                        }
                        return false;
                    });
                }
                if (!coverID) return [3, 6];
                manifestInfo = void 0;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4, findInManifestByID(publication, rootfile, opf, coverID)];
            case 2:
                manifestInfo = _a.sent();
                return [3, 4];
            case 3:
                err_26 = _a.sent();
                debug(err_26);
                return [2];
            case 4:
                if (!(manifestInfo && manifestInfo.Href && publication.Resources && publication.Resources.length)) return [3, 6];
                href_1 = manifestInfo.Href;
                linky = publication.Resources.find(function (item, _i, _arr) {
                    if (item.Href === href_1) {
                        return true;
                    }
                    return false;
                });
                if (!linky) return [3, 6];
                linky.AddRel("cover");
                return [4, exports.addCoverDimensions(publication, linky)];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6: return [2];
        }
    });
}); };
var findPropertiesInSpineForManifest = function (linkEpub, _rootfile, opf) {
    if (opf.Spine && opf.Spine.Items && opf.Spine.Items.length) {
        var it = opf.Spine.Items.find(function (item) {
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
var findInSpineByHref = function (publication, href) {
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
var findMetaByRefineAndProperty = function (rootfile, opf, ID, property) {
    var ret = findAllMetaByRefineAndProperty(rootfile, opf, ID, property);
    if (ret.length) {
        return ret[0];
    }
    return undefined;
};
var findAllMetaByRefineAndProperty = function (_rootfile, opf, ID, property) {
    var metas = [];
    var refineID = "#" + ID;
    if (opf.Metadata && opf.Metadata.Meta) {
        opf.Metadata.Meta.forEach(function (metaTag) {
            if (metaTag.Refine === refineID && metaTag.Property === property) {
                metas.push(metaTag);
            }
        });
    }
    return metas;
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
var isEpub3OrMore = function (rootfile, opf) {
    var version = getEpubVersion(rootfile, opf);
    return (version === epub3 || version === epub301 || version === epub31);
};
var findLinKByHref = function (publication, _rootfile, _opf, href) {
    if (publication.Spine && publication.Spine.length) {
        var ll = publication.Spine.find(function (l) {
            if (href === l.HrefDecoded) {
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
//# sourceMappingURL=epub.js.map