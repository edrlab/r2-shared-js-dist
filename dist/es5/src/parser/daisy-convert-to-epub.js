"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDaisyToReadiumWebPub = void 0;
var tslib_1 = require("tslib");
var debug_ = require("debug");
var fs = require("fs");
var mime = require("mime-types");
var path = require("path");
var xmldom = require("@xmldom/xmldom");
var xpath = require("xpath");
var yazl_1 = require("yazl");
var media_overlay_1 = require("../models/media-overlay");
var metadata_1 = require("../models/metadata");
var metadata_properties_1 = require("../models/metadata-properties");
var publication_1 = require("../models/publication");
var publication_link_1 = require("../models/publication-link");
var serializable_1 = require("r2-lcp-js/dist/es5/src/serializable");
var bom_1 = require("r2-utils-js/dist/es5/src/_utils/bom");
var epub_daisy_common_1 = require("./epub-daisy-common");
var debug = debug_("r2:shared#parser/daisy-convert-to-epub");
function ensureDirs(fspath) {
    var dirname = path.dirname(fspath);
    if (!fs.existsSync(dirname)) {
        ensureDirs(dirname);
        fs.mkdirSync(dirname);
    }
}
var convertDaisyToReadiumWebPub = function (outputDirPath, publication, generateDaisyAudioManifestOnly, forceAudioOnly) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2, new Promise(function (resolve, reject) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                var isFullTextAudio, isAudioOnly, isTextOnly, zipInternal, zip, nccZipEntry, outputZipPath, timeoutId, zipfile, writeStream, select, elementNames, mediaOverlaysMap_1, getMediaOverlaysDuration_1, patchMediaOverlaysTextHref_1, smilDocs_1, loadOrGetCachedSmil_1, findLinkInToc_1, createHtmlFromSmilFile, audioOnlySmilHtmls, previousLinkItem, spineIndex, _i, _a, linkItem, computedDur, dur, smilTextRef, isAudioOnly_1, audioOnlySmilHtmlHref, smilHtml, resourcesToKeep, dtBooks, _b, _c, resLink, cssText, zipErr_1, _d, elementNames_1, elementName, regex, dtBookStr, zipErr_2, dtBookDoc, title, listElements, i, listElement, type, _e, elementNames_2, elementName, els, _f, els_1, el, cls, stylesheets, cssHrefs, _g, stylesheets_1, stylesheet, match, href, _h, stylesheets_2, stylesheet, smilRefs, _j, smilRefs_1, smilRef, ref, dtbookNowXHTML, xhtmlFilePath, resLinkJson, resLinkClone, buff, _k, mediaOverlaysSequence, _loop_1, _l, mediaOverlaysSequence_1, mediaOverlay, findFirstDescendantTextOrAudio_1, processLink_1, processLinks_1, _m, _o, link, _p, _q, link, jsonObj, jsonStr, isAudioOnly_, transformPublicationToAudioBook, audioPublication, jsonObjAudio, jsonStrAudio, outputManifestPath, ero_1, erreur_1;
                var _r, _s, _t, _u, _v;
                return tslib_1.__generator(this, function (_w) {
                    switch (_w.label) {
                        case 0:
                            isFullTextAudio = !forceAudioOnly && ((_r = publication.Metadata) === null || _r === void 0 ? void 0 : _r.AdditionalJSON) &&
                                (publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioFullText" ||
                                    publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "audioFullText" || (!publication.Metadata.AdditionalJSON["dtb:multimediaType"] &&
                                    !publication.Metadata.AdditionalJSON["ncc:multimediaType"]));
                            isAudioOnly = forceAudioOnly || ((_s = publication.Metadata) === null || _s === void 0 ? void 0 : _s.AdditionalJSON) &&
                                (publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioNCX" ||
                                    publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "audioNcc");
                            isTextOnly = !forceAudioOnly && ((_t = publication.Metadata) === null || _t === void 0 ? void 0 : _t.AdditionalJSON) &&
                                (publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "textNCX" ||
                                    publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "textNcc");
                            if (generateDaisyAudioManifestOnly) {
                                if (isTextOnly) {
                                    debug("generateDaisyAudioManifestOnly FATAL! text-only publication?? ", publication.Metadata.AdditionalJSON["dtb:multimediaType"], publication.Metadata.AdditionalJSON["ncc:multimediaType"]);
                                    return [2, reject("generateDaisyAudioManifestOnly cannot process text-only publication")];
                                }
                                if (!isAudioOnly || isFullTextAudio) {
                                    debug("generateDaisyAudioManifestOnly WARNING! not audio-only publication?? ", publication.Metadata.AdditionalJSON["dtb:multimediaType"], publication.Metadata.AdditionalJSON["ncc:multimediaType"]);
                                }
                            }
                            zipInternal = publication.findFromInternal("zip");
                            if (!zipInternal) {
                                debug("No publication zip!?");
                                return [2, reject("No publication zip!?")];
                            }
                            zip = zipInternal.Value;
                            return [4, zip.getEntries()];
                        case 1:
                            nccZipEntry = (_w.sent()).find(function (entry) {
                                return /ncc\.html$/i.test(entry);
                            });
                            outputZipPath = path.join(outputDirPath, "".concat(isAudioOnly ? "daisy_audioNCX" : (isTextOnly ? "daisy_textNCX" : "daisy_audioFullText"), "-to-epub.webpub"));
                            if (!generateDaisyAudioManifestOnly) {
                                ensureDirs(outputZipPath);
                            }
                            zipfile = generateDaisyAudioManifestOnly ? undefined : new yazl_1.ZipFile();
                            _w.label = 2;
                        case 2:
                            _w.trys.push([2, 40, 41, 42]);
                            if (!generateDaisyAudioManifestOnly) {
                                writeStream = fs.createWriteStream(outputZipPath);
                                zipfile.outputStream.pipe(writeStream)
                                    .on("close", function () {
                                    debug("ZIP close");
                                    if (timeoutId) {
                                        clearTimeout(timeoutId);
                                        timeoutId = undefined;
                                        resolve(outputZipPath);
                                    }
                                })
                                    .on("error", function (e) {
                                    debug("ZIP error", e);
                                    reject(e);
                                });
                            }
                            select = xpath.useNamespaces({
                                dtbook: "http://www.daisy.org/z3986/2005/dtbook/",
                            });
                            elementNames = [
                                "address",
                                "annoref",
                                "annotation",
                                "author",
                                "bdo",
                                "bodymatter",
                                "book",
                                "bridgehead",
                                "byline",
                                "caption",
                                "cite",
                                "col",
                                "colgroup",
                                "covertitle",
                                "dateline",
                                "dfn",
                                "docauthor",
                                "doctitle",
                                "dtbook",
                                "epigraph",
                                "frontmatter",
                                "hd",
                                "imggroup",
                                "kbd",
                                "level",
                                "levelhd",
                                "level1",
                                "level2",
                                "level3",
                                "level4",
                                "level5",
                                "level6",
                                "lic",
                                "line",
                                "linegroup",
                                "linenum",
                                "link",
                                "list",
                                "note",
                                "noteref",
                                "pagenum",
                                "poem",
                                "prodnote",
                                "rearmatter",
                                "samp",
                                "sent",
                                "sub",
                                "sup",
                                "q",
                                "w",
                                "notice",
                                "sidebar",
                                "blockquote",
                                "abbr",
                                "acronym",
                                "title",
                            ];
                            getMediaOverlaysDuration_1 = function (mo) {
                                var duration = 0;
                                if (typeof mo.AudioClipBegin !== "undefined" &&
                                    typeof mo.AudioClipEnd !== "undefined") {
                                    duration = mo.AudioClipEnd - mo.AudioClipBegin;
                                }
                                else if (mo.Children) {
                                    for (var _i = 0, _a = mo.Children; _i < _a.length; _i++) {
                                        var child = _a[_i];
                                        duration += getMediaOverlaysDuration_1(child);
                                    }
                                }
                                return duration;
                            };
                            patchMediaOverlaysTextHref_1 = function (mo, audioOnlySmilHtmlHref) {
                                var smilTextRef;
                                if (audioOnlySmilHtmlHref) {
                                    smilTextRef = audioOnlySmilHtmlHref;
                                    mo.Text = "".concat(smilTextRef, "#").concat(mo.ParID || mo.TextID || "_yyy_");
                                }
                                else if (mo.Text) {
                                    mo.Text = mo.Text.replace(/((\.xml)|(\.html))(#.*)?$/i, ".xhtml$4");
                                    smilTextRef = mo.Text;
                                    var k = smilTextRef.indexOf("#");
                                    if (k > 0) {
                                        smilTextRef = smilTextRef.substr(0, k);
                                    }
                                }
                                if (mo.Children) {
                                    for (var _i = 0, _a = mo.Children; _i < _a.length; _i++) {
                                        var child = _a[_i];
                                        var smilTextRef_ = patchMediaOverlaysTextHref_1(child, audioOnlySmilHtmlHref);
                                        if (!smilTextRef_) {
                                            debug("########## WARNING: !smilTextRef ???!!", smilTextRef_, child);
                                        }
                                        else if (smilTextRef && smilTextRef !== smilTextRef_) {
                                            debug("########## WARNING: smilTextRef !== smilTextRef_ ???!!", smilTextRef, smilTextRef_);
                                        }
                                        if (!smilTextRef) {
                                            smilTextRef = smilTextRef_;
                                        }
                                    }
                                }
                                return smilTextRef;
                            };
                            smilDocs_1 = {};
                            loadOrGetCachedSmil_1 = function (smilPathInZip) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                var smilDoc, smilStr, zipErr_3;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            smilDoc = smilDocs_1[smilPathInZip];
                                            if (!!smilDoc) return [3, 5];
                                            smilStr = undefined;
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            return [4, (0, epub_daisy_common_1.loadFileStrFromZipPath)(smilPathInZip, smilPathInZip, zip)];
                                        case 2:
                                            smilStr = _a.sent();
                                            return [3, 4];
                                        case 3:
                                            zipErr_3 = _a.sent();
                                            debug(zipErr_3);
                                            return [3, 4];
                                        case 4:
                                            if (!smilStr) {
                                                debug("!loadFileStrFromZipPath 1", smilPathInZip);
                                                return [2, Promise.reject("!loadFileStrFromZipPath 1 " + smilPathInZip)];
                                            }
                                            smilDoc = new xmldom.DOMParser().parseFromString((0, bom_1.removeUTF8BOM)(smilStr), "application/xml");
                                            if (nccZipEntry) {
                                                (0, epub_daisy_common_1.flattenDaisy2SmilAudioSeq)(smilPathInZip, smilDoc);
                                            }
                                            smilDocs_1[smilPathInZip] = smilDoc;
                                            _a.label = 5;
                                        case 5: return [2, Promise.resolve(smilDoc)];
                                    }
                                });
                            }); };
                            findLinkInToc_1 = function (links, hrefDecoded) {
                                for (var _i = 0, links_1 = links; _i < links_1.length; _i++) {
                                    var link = links_1[_i];
                                    if (link.HrefDecoded === hrefDecoded) {
                                        return link;
                                    }
                                    else if (link.Children) {
                                        var foundLink = findLinkInToc_1(link.Children, hrefDecoded);
                                        if (foundLink) {
                                            return foundLink;
                                        }
                                    }
                                }
                                return undefined;
                            };
                            createHtmlFromSmilFile = function (smilPathInZip) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                var smilDoc, zipErr_4, smilDocClone, txtCounter, parEls, _i, parEls_1, parEl, audioElements, _a, audioElements_1, audioElement, textId, textElements, _b, textElements_1, textElement, src, elmId, hrefDecoded, tocLinkItem, hrefDecoded_, text, textNode, bodyContent, bodyContentStr, contentStr, htmlDoc, htmlFilePath;
                                return tslib_1.__generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            if (generateDaisyAudioManifestOnly) {
                                                return [2, undefined];
                                            }
                                            smilDoc = undefined;
                                            _c.label = 1;
                                        case 1:
                                            _c.trys.push([1, 3, , 4]);
                                            return [4, loadOrGetCachedSmil_1(smilPathInZip)];
                                        case 2:
                                            smilDoc = _c.sent();
                                            return [3, 4];
                                        case 3:
                                            zipErr_4 = _c.sent();
                                            debug(zipErr_4);
                                            return [3, 4];
                                        case 4:
                                            if (!smilDoc) {
                                                return [2, undefined];
                                            }
                                            smilDocClone = smilDoc.cloneNode(true);
                                            txtCounter = 0;
                                            parEls = Array.from(smilDocClone.getElementsByTagName("par"));
                                            for (_i = 0, parEls_1 = parEls; _i < parEls_1.length; _i++) {
                                                parEl = parEls_1[_i];
                                                audioElements = Array.from(parEl.getElementsByTagName("audio")).filter(function (el) { return el; });
                                                for (_a = 0, audioElements_1 = audioElements; _a < audioElements_1.length; _a++) {
                                                    audioElement = audioElements_1[_a];
                                                    if (audioElement.parentNode) {
                                                        audioElement.parentNode.removeChild(audioElement);
                                                    }
                                                }
                                                textId = void 0;
                                                textElements = Array.from(parEl.getElementsByTagName("text")).filter(function (el) { return el; });
                                                for (_b = 0, textElements_1 = textElements; _b < textElements_1.length; _b++) {
                                                    textElement = textElements_1[_b];
                                                    src = textElement.getAttribute("src");
                                                    if (src) {
                                                        textElement.setAttribute("data-src", src.replace(/((\.xml)|(\.html))(#.*)?$/i, ".xhtml$4"));
                                                        textElement.removeAttribute("src");
                                                    }
                                                    if (!textId) {
                                                        textId = textElement.getAttribute("id");
                                                    }
                                                }
                                                elmId = parEl.getAttribute("id");
                                                hrefDecoded = "".concat(smilPathInZip, "#").concat(elmId);
                                                tocLinkItem = publication.TOC ? findLinkInToc_1(publication.TOC, hrefDecoded) : undefined;
                                                if (!tocLinkItem && textId) {
                                                    hrefDecoded_ = "".concat(smilPathInZip, "#").concat(textId);
                                                    tocLinkItem = publication.TOC ? findLinkInToc_1(publication.TOC, hrefDecoded_) : undefined;
                                                }
                                                text = tocLinkItem ? tocLinkItem.Title : undefined;
                                                if (text) {
                                                    txtCounter = 0;
                                                }
                                                textNode = smilDocClone.createTextNode(text ? text : "... [".concat(++txtCounter, "]"));
                                                parEl.appendChild(textNode);
                                            }
                                            bodyContent = smilDocClone.getElementsByTagName("body")[0];
                                            bodyContentStr = new xmldom.XMLSerializer().serializeToString(bodyContent);
                                            contentStr = bodyContentStr
                                                .replace("xmlns=\"http://www.w3.org/2001/SMIL20/\"", "")
                                                .replace(/dur=/g, "data-dur=")
                                                .replace(/endsync=/g, "data-endsync=")
                                                .replace(/fill=/g, "data-fill=")
                                                .replace(/system-required=/g, "data-system-required=")
                                                .replace(/customTest=/g, "data-customTest=")
                                                .replace(/class=/g, "data-class=")
                                                .replace(/<seq/g, "<div class=\"smil-seq\"")
                                                .replace(/<text/g, "<hr class=\"smil-text\"")
                                                .replace(/<par/g, "<p class=\"smil-par\"")
                                                .replace(/<\/seq>/g, "</div>")
                                                .replace(/<\/par>/g, "</p>");
                                            htmlDoc = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE html>\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:epub=\"http://www.idpf.org/2007/ops\" xml:lang=\"en\" lang=\"en\">\n    <head>\n        <title>".concat(smilPathInZip, "</title>\n    </head>\n    ").concat(contentStr, "\n</html>\n");
                                            htmlFilePath = smilPathInZip.replace(/\.smil$/i, ".xhtml");
                                            zipfile.addBuffer(Buffer.from(htmlDoc), htmlFilePath);
                                            return [2, htmlFilePath];
                                    }
                                });
                            }); };
                            audioOnlySmilHtmls = [];
                            if (!publication.Spine) return [3, 9];
                            mediaOverlaysMap_1 = {};
                            previousLinkItem = void 0;
                            spineIndex = -1;
                            _i = 0, _a = publication.Spine;
                            _w.label = 3;
                        case 3:
                            if (!(_i < _a.length)) return [3, 9];
                            linkItem = _a[_i];
                            spineIndex++;
                            if (!linkItem.MediaOverlays) {
                                return [3, 8];
                            }
                            if (!!linkItem.MediaOverlays.initialized) return [3, 5];
                            return [4, (0, epub_daisy_common_1.lazyLoadMediaOverlays)(publication, linkItem.MediaOverlays)];
                        case 4:
                            _w.sent();
                            if (isFullTextAudio || isAudioOnly) {
                                (0, epub_daisy_common_1.updateDurations)(linkItem.MediaOverlays.duration, linkItem);
                            }
                            _w.label = 5;
                        case 5:
                            if (isFullTextAudio || isAudioOnly) {
                                computedDur = getMediaOverlaysDuration_1(linkItem.MediaOverlays);
                                if (computedDur) {
                                    if (!linkItem.MediaOverlays.duration) {
                                        linkItem.MediaOverlays.duration = computedDur;
                                        (0, epub_daisy_common_1.updateDurations)(computedDur, linkItem);
                                    }
                                    else {
                                        if (linkItem.MediaOverlays.duration !== computedDur) {
                                            debug("linkItem.MediaOverlays.duration !== computedDur", linkItem.MediaOverlays.duration, computedDur);
                                        }
                                    }
                                }
                                if (previousLinkItem && previousLinkItem.MediaOverlays &&
                                    typeof previousLinkItem.MediaOverlays.totalElapsedTime !== "undefined" &&
                                    typeof linkItem.MediaOverlays.totalElapsedTime !== "undefined") {
                                    dur = linkItem.MediaOverlays.totalElapsedTime -
                                        previousLinkItem.MediaOverlays.totalElapsedTime;
                                    if (dur > 0) {
                                        if (!previousLinkItem.MediaOverlays.duration) {
                                            previousLinkItem.MediaOverlays.duration = dur;
                                            (0, epub_daisy_common_1.updateDurations)(dur, previousLinkItem);
                                        }
                                        else {
                                            if (previousLinkItem.MediaOverlays.duration !== dur) {
                                                debug("previousLinkItem.MediaOverlays.duration !== dur", previousLinkItem.MediaOverlays.duration, dur);
                                            }
                                        }
                                    }
                                }
                                previousLinkItem = linkItem;
                            }
                            smilTextRef = void 0;
                            isAudioOnly_1 = isAudioOnly || (isFullTextAudio && generateDaisyAudioManifestOnly);
                            if (isAudioOnly_1) {
                                audioOnlySmilHtmlHref = (_u = linkItem.MediaOverlays.SmilPathInZip) === null || _u === void 0 ? void 0 : _u.replace(/\.smil$/i, ".xhtml");
                                if (audioOnlySmilHtmlHref) {
                                    smilTextRef = patchMediaOverlaysTextHref_1(linkItem.MediaOverlays, audioOnlySmilHtmlHref);
                                }
                            }
                            else {
                                smilTextRef = patchMediaOverlaysTextHref_1(linkItem.MediaOverlays, undefined);
                            }
                            if (!smilTextRef) return [3, 8];
                            if (!(isAudioOnly_1 && linkItem.MediaOverlays.SmilPathInZip)) return [3, 7];
                            return [4, createHtmlFromSmilFile(linkItem.MediaOverlays.SmilPathInZip)];
                        case 6:
                            _w.sent();
                            smilHtml = new publication_link_1.Link();
                            smilHtml.Href = smilTextRef;
                            smilHtml.TypeLink = "application/xhtml+xml";
                            audioOnlySmilHtmls.push(smilHtml);
                            _w.label = 7;
                        case 7:
                            if (!mediaOverlaysMap_1[smilTextRef]) {
                                mediaOverlaysMap_1[smilTextRef] = {
                                    index: spineIndex,
                                    mos: [],
                                };
                            }
                            mediaOverlaysMap_1[smilTextRef].index = spineIndex;
                            mediaOverlaysMap_1[smilTextRef].mos.push(linkItem.MediaOverlays);
                            _w.label = 8;
                        case 8:
                            _i++;
                            return [3, 3];
                        case 9:
                            publication.Spine = [];
                            resourcesToKeep = [];
                            dtBooks = tslib_1.__spreadArray([], audioOnlySmilHtmls, true);
                            _b = 0, _c = publication.Resources;
                            _w.label = 10;
                        case 10:
                            if (!(_b < _c.length)) return [3, 25];
                            resLink = _c[_b];
                            if (!resLink.HrefDecoded) {
                                return [3, 24];
                            }
                            if (!(resLink.TypeLink === "text/css" || /\.css$/i.test(resLink.HrefDecoded))) return [3, 15];
                            if (generateDaisyAudioManifestOnly) {
                                debug("generateDaisyAudioManifestOnly => skip resource: ", resLink.HrefDecoded);
                                return [3, 24];
                            }
                            cssText = undefined;
                            _w.label = 11;
                        case 11:
                            _w.trys.push([11, 13, , 14]);
                            return [4, (0, epub_daisy_common_1.loadFileStrFromZipPath)(resLink.Href, resLink.HrefDecoded, zip)];
                        case 12:
                            cssText = _w.sent();
                            return [3, 14];
                        case 13:
                            zipErr_1 = _w.sent();
                            debug(zipErr_1);
                            return [3, 14];
                        case 14:
                            if (!cssText) {
                                debug("!loadFileStrFromZipPath 2", resLink.HrefDecoded);
                                return [3, 24];
                            }
                            cssText = cssText.replace(/\/\*([\s\S]+?)\*\//gm, function (_match, p1, _offset, _string) {
                                var base64 = Buffer.from(p1).toString("base64");
                                return "/*__".concat(base64, "__*/");
                            });
                            for (_d = 0, elementNames_1 = elementNames; _d < elementNames_1.length; _d++) {
                                elementName = elementNames_1[_d];
                                regex = new RegExp("([^#.a-zA-Z0-9-_])(".concat(elementName, ")([^a-zA-Z0-9-_;])"), "g");
                                cssText = cssText.replace(regex, "$1.$2_R2$3");
                                cssText = cssText.replace(regex, "$1.$2_R2$3");
                            }
                            cssText = cssText.replace(/\/\*__([\s\S]+?)__\*\//g, function (_match, p1, _offset, _string) {
                                var comment = Buffer.from(p1, "base64").toString("utf8");
                                return "/*".concat(comment, "*/");
                            });
                            zipfile.addBuffer(Buffer.from(cssText), resLink.HrefDecoded);
                            resourcesToKeep.push(resLink);
                            return [3, 24];
                        case 15:
                            if (!(resLink.TypeLink === "application/x-dtbook+xml" || /\.xml$/i.test(resLink.HrefDecoded))) return [3, 20];
                            if (isAudioOnly || generateDaisyAudioManifestOnly) {
                                debug("generateDaisyAudioManifestOnly or isAudioOnly => skip resource: ", resLink.HrefDecoded);
                                return [3, 24];
                            }
                            dtBookStr = undefined;
                            _w.label = 16;
                        case 16:
                            _w.trys.push([16, 18, , 19]);
                            return [4, (0, epub_daisy_common_1.loadFileStrFromZipPath)(resLink.Href, resLink.HrefDecoded, zip)];
                        case 17:
                            dtBookStr = _w.sent();
                            return [3, 19];
                        case 18:
                            zipErr_2 = _w.sent();
                            debug(zipErr_2);
                            return [3, 19];
                        case 19:
                            if (!dtBookStr) {
                                debug("!loadFileStrFromZipPath 3", dtBookStr);
                                return [3, 24];
                            }
                            dtBookStr = (0, bom_1.removeUTF8BOM)(dtBookStr);
                            dtBookStr = dtBookStr.replace(/xmlns=""/, " ");
                            dtBookStr = dtBookStr.replace(/<dtbook/, "<dtbook xmlns:epub=\"http://www.idpf.org/2007/ops\" ");
                            dtBookDoc = new xmldom.DOMParser().parseFromString(dtBookStr, "application/xml");
                            title = (_v = dtBookDoc.getElementsByTagName("doctitle")[0]) === null || _v === void 0 ? void 0 : _v.textContent;
                            if (title) {
                                title = title.trim();
                                if (!title.length) {
                                    title = null;
                                }
                            }
                            listElements = dtBookDoc.getElementsByTagName("list");
                            for (i = 0; i < listElements.length; i++) {
                                listElement = listElements.item(i);
                                if (!listElement) {
                                    continue;
                                }
                                type = listElement.getAttribute("type");
                                if (type) {
                                    listElement.tagName = type;
                                }
                            }
                            for (_e = 0, elementNames_2 = elementNames; _e < elementNames_2.length; _e++) {
                                elementName = elementNames_2[_e];
                                els = Array.from(dtBookDoc.getElementsByTagName(elementName)).filter(function (el) { return el; });
                                for (_f = 0, els_1 = els; _f < els_1.length; _f++) {
                                    el = els_1[_f];
                                    el.setAttribute("data-dtbook", elementName);
                                    cls = el.getAttribute("class");
                                    el.setAttribute("class", "".concat(cls ? (cls + " ") : "").concat(elementName, "_R2"));
                                    el.tagName =
                                        ((elementName === "dtbook") ? "html" :
                                            ((elementName === "book") ? "body" :
                                                ((elementName === "pagenum") ? "span" :
                                                    ((elementName === "sent") ? "span" :
                                                        ((elementName === "caption") ? "figcaption" :
                                                            ((elementName === "imggroup") ? "figure" :
                                                                (elementName === "sidebar") ? "aside" :
                                                                    "div"))))));
                                    if (elementName === "pagenum") {
                                        el.setAttribute("epub:type", "pagebreak");
                                    }
                                    else if (elementName === "annotation") {
                                        el.setAttribute("epub:type", "annotation");
                                    }
                                    else if (elementName === "note") {
                                        el.setAttribute("epub:type", "note");
                                    }
                                    else if (elementName === "prodnote") {
                                        el.setAttribute("epub:type", "note");
                                    }
                                    else if (elementName === "sidebar") {
                                        el.setAttribute("epub:type", "sidebar");
                                    }
                                }
                            }
                            stylesheets = select("/processing-instruction('xml-stylesheet')", dtBookDoc);
                            cssHrefs = [];
                            for (_g = 0, stylesheets_1 = stylesheets; _g < stylesheets_1.length; _g++) {
                                stylesheet = stylesheets_1[_g];
                                if (!stylesheet.nodeValue) {
                                    continue;
                                }
                                if (!stylesheet.nodeValue.includes("text/css")) {
                                    continue;
                                }
                                match = stylesheet.nodeValue.match(/href=("|')(.*?)("|')/);
                                if (!match) {
                                    continue;
                                }
                                href = match[2].trim();
                                if (href) {
                                    cssHrefs.push(href);
                                }
                            }
                            for (_h = 0, stylesheets_2 = stylesheets; _h < stylesheets_2.length; _h++) {
                                stylesheet = stylesheets_2[_h];
                                if (typeof stylesheet.remove === "function") {
                                    stylesheet.remove();
                                }
                                else if (stylesheet.parentNode) {
                                    stylesheet.parentNode.removeChild(stylesheet);
                                }
                            }
                            smilRefs = select("//*[@smilref]", dtBookDoc);
                            for (_j = 0, smilRefs_1 = smilRefs; _j < smilRefs_1.length; _j++) {
                                smilRef = smilRefs_1[_j];
                                ref = smilRef.getAttribute("smilref");
                                if (ref) {
                                    smilRef.setAttribute("data-smilref", ref);
                                }
                                smilRef.removeAttribute("smilref");
                            }
                            dtbookNowXHTML = new xmldom.XMLSerializer().serializeToString(dtBookDoc)
                                .replace(/xmlns="http:\/\/www\.daisy\.org\/z3986\/2005\/dtbook\/"/, "xmlns=\"http://www.w3.org/1999/xhtml\"")
                                .replace(/xmlns="http:\/\/www\.daisy\.org\/z3986\/2005\/dtbook\/"/g, " ")
                                .replace(/^([\s\S]*)<html/m, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE html>\n<html ")
                                .replace(/<head([\s\S]*?)>/m, "\n<head$1>\n<meta charset=\"UTF-8\" />\n".concat(title ? "<title>".concat(title, "</title>") : "", "\n"))
                                .replace(/<\/head[\s\S]*?>/m, "\n".concat(cssHrefs.reduce(function (pv, cv) {
                                return pv + "\n" + "<link rel=\"stylesheet\" type=\"text/css\" href=\"".concat(cv, "\" />");
                            }, ""), "\n</head>\n"));
                            xhtmlFilePath = resLink.HrefDecoded.replace(/\.([^\.]+)$/i, ".xhtml");
                            zipfile.addBuffer(Buffer.from(dtbookNowXHTML), xhtmlFilePath);
                            resLinkJson = (0, serializable_1.TaJsonSerialize)(resLink);
                            resLinkClone = (0, serializable_1.TaJsonDeserialize)(resLinkJson, publication_link_1.Link);
                            resLinkClone.setHrefDecoded(xhtmlFilePath);
                            resLinkClone.TypeLink = "application/xhtml+xml";
                            dtBooks.push(resLinkClone);
                            return [3, 24];
                        case 20:
                            if (!(!/\.opf$/i.test(resLink.HrefDecoded) &&
                                !/\.res$/i.test(resLink.HrefDecoded) &&
                                !/\.ncx$/i.test(resLink.HrefDecoded) &&
                                !/ncc\.html$/i.test(resLink.HrefDecoded))) return [3, 24];
                            if (!generateDaisyAudioManifestOnly) return [3, 21];
                            _k = undefined;
                            return [3, 23];
                        case 21: return [4, (0, epub_daisy_common_1.loadFileBufferFromZipPath)(resLink.Href, resLink.HrefDecoded, zip)];
                        case 22:
                            _k = _w.sent();
                            _w.label = 23;
                        case 23:
                            buff = _k;
                            if (/\.html$/i.test(resLink.HrefDecoded)) {
                                resLink.setHrefDecoded(resLink.HrefDecoded.replace(/\.html$/i, ".xhtml"));
                            }
                            if (buff) {
                                zipfile.addBuffer(buff, resLink.HrefDecoded);
                            }
                            resourcesToKeep.push(resLink);
                            if (/\.x?html$/i.test(resLink.HrefDecoded) ||
                                resLink.TypeLink === "text/html" ||
                                resLink.TypeLink === "application/xhtml+xml") {
                                if (resLink.TypeLink === "text/html") {
                                    resLink.TypeLink = "application/xhtml+xml";
                                }
                                dtBooks.push(resLink);
                            }
                            _w.label = 24;
                        case 24:
                            _b++;
                            return [3, 10];
                        case 25:
                            if (mediaOverlaysMap_1) {
                                Object.keys(mediaOverlaysMap_1).forEach(function (smilTextRef) {
                                    if (!mediaOverlaysMap_1) {
                                        return;
                                    }
                                    debug("smilTextRef: " + smilTextRef);
                                    var mos = mediaOverlaysMap_1[smilTextRef].mos;
                                    if (mos.length === 1) {
                                        debug("smilTextRef [1]: " + smilTextRef);
                                        return;
                                    }
                                    var mergedMediaOverlays = new media_overlay_1.MediaOverlayNode();
                                    mergedMediaOverlays.SmilPathInZip = undefined;
                                    mergedMediaOverlays.initialized = true;
                                    mergedMediaOverlays.Role = [];
                                    mergedMediaOverlays.Role.push("section");
                                    mergedMediaOverlays.duration = 0;
                                    var i = -1;
                                    for (var _i = 0, mos_1 = mos; _i < mos_1.length; _i++) {
                                        var mo = mos_1[_i];
                                        i++;
                                        if (mo.Children) {
                                            debug("smilTextRef [".concat(i, "]: ") + smilTextRef);
                                            if (!mergedMediaOverlays.Children) {
                                                mergedMediaOverlays.Children = [];
                                            }
                                            mergedMediaOverlays.Children = mergedMediaOverlays.Children.concat(mo.Children);
                                            if (mo.duration) {
                                                mergedMediaOverlays.duration += mo.duration;
                                            }
                                        }
                                    }
                                    mediaOverlaysMap_1[smilTextRef].mos = [mergedMediaOverlays];
                                });
                                mediaOverlaysSequence = Object.keys(mediaOverlaysMap_1).map(function (smilTextRef) {
                                    if (!mediaOverlaysMap_1) {
                                        return undefined;
                                    }
                                    return {
                                        index: mediaOverlaysMap_1[smilTextRef].index,
                                        mo: mediaOverlaysMap_1[smilTextRef].mos[0],
                                        smilTextRef: smilTextRef,
                                    };
                                }).filter(function (e) { return e; }).sort(function (a, b) {
                                    if (a && b && a.index < b.index) {
                                        return -1;
                                    }
                                    if (a && b && a.index > b.index) {
                                        return 1;
                                    }
                                    return 0;
                                });
                                _loop_1 = function (mediaOverlay) {
                                    if (!mediaOverlay) {
                                        return "continue";
                                    }
                                    debug("mediaOverlay:", mediaOverlay.index, mediaOverlay.smilTextRef);
                                    var dtBookLink = dtBooks.find(function (l) {
                                        return l.HrefDecoded && mediaOverlay.smilTextRef ?
                                            l.HrefDecoded.toLowerCase() === mediaOverlay.smilTextRef.toLowerCase()
                                            : false;
                                    });
                                    if (!dtBookLink) {
                                        debug("!!dtBookLink", mediaOverlay.smilTextRef, JSON.stringify(dtBooks, null, 4));
                                    }
                                    else if (dtBookLink.HrefDecoded && mediaOverlay.smilTextRef &&
                                        dtBookLink.HrefDecoded.toLowerCase() !== mediaOverlay.smilTextRef.toLowerCase()) {
                                        debug("dtBook.HrefDecoded !== mediaOverlay.smilTextRef", dtBookLink.HrefDecoded, mediaOverlay.smilTextRef);
                                    }
                                    else {
                                        if (isFullTextAudio || isAudioOnly) {
                                            dtBookLink.MediaOverlays = mediaOverlay.mo;
                                            if (mediaOverlay.mo.duration) {
                                                dtBookLink.Duration = mediaOverlay.mo.duration;
                                            }
                                            var moURL = "smil-media-overlays_".concat(mediaOverlay.index, ".json");
                                            if (!dtBookLink.Properties) {
                                                dtBookLink.Properties = new metadata_properties_1.Properties();
                                            }
                                            dtBookLink.Properties.MediaOverlay = moURL;
                                            if (!dtBookLink.Alternate) {
                                                dtBookLink.Alternate = [];
                                            }
                                            var moLink = new publication_link_1.Link();
                                            moLink.Href = moURL;
                                            moLink.TypeLink = "application/vnd.syncnarr+json";
                                            moLink.Duration = dtBookLink.Duration;
                                            dtBookLink.Alternate.push(moLink);
                                            if (!generateDaisyAudioManifestOnly) {
                                                var jsonObjMO = (0, serializable_1.TaJsonSerialize)(mediaOverlay.mo);
                                                var jsonStrMO = global.JSON.stringify(jsonObjMO, null, "  ");
                                                zipfile.addBuffer(Buffer.from(jsonStrMO), moURL);
                                            }
                                            debug("dtBookLink IN SPINE:", mediaOverlay.index, dtBookLink.HrefDecoded, dtBookLink.Duration, moURL);
                                        }
                                        else {
                                            debug("dtBookLink IN SPINE (no audio):", mediaOverlay.index, dtBookLink.HrefDecoded);
                                        }
                                        publication.Spine.push(dtBookLink);
                                    }
                                };
                                for (_l = 0, mediaOverlaysSequence_1 = mediaOverlaysSequence; _l < mediaOverlaysSequence_1.length; _l++) {
                                    mediaOverlay = mediaOverlaysSequence_1[_l];
                                    _loop_1(mediaOverlay);
                                }
                            }
                            publication.Resources = resourcesToKeep;
                            if (!publication.Metadata) {
                                publication.Metadata = new metadata_1.Metadata();
                            }
                            if (!publication.Metadata.AdditionalJSON) {
                                publication.Metadata.AdditionalJSON = {};
                            }
                            publication.Metadata.AdditionalJSON.ReadiumWebPublicationConvertedFrom =
                                isAudioOnly ? "DAISY_audioNCX" : (isTextOnly ? "DAISY_textNCX" : "DAISY_audioFullText");
                            findFirstDescendantTextOrAudio_1 = function (parent, audio) {
                                if (parent.childNodes && parent.childNodes.length) {
                                    for (var i = 0; i < parent.childNodes.length; i++) {
                                        var child = parent.childNodes[i];
                                        if (child.nodeType === 1) {
                                            var element = child;
                                            if (element.localName &&
                                                element.localName.toLowerCase() === (audio ? "audio" : "text")) {
                                                return element;
                                            }
                                        }
                                    }
                                    for (var i = 0; i < parent.childNodes.length; i++) {
                                        var child = parent.childNodes[i];
                                        if (child.nodeType === 1) {
                                            var element = child;
                                            var found = findFirstDescendantTextOrAudio_1(element, audio);
                                            if (found) {
                                                return found;
                                            }
                                        }
                                    }
                                }
                                return undefined;
                            };
                            processLink_1 = function (link) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                var href, isAudioOnly_, fragment, arr, smilDoc, zipErr_5, targetEl, src;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            href = link.HrefDecoded;
                                            if (!href) {
                                                return [2];
                                            }
                                            isAudioOnly_ = isAudioOnly || (isFullTextAudio && generateDaisyAudioManifestOnly);
                                            if (isAudioOnly_) {
                                                link.setHrefDecoded(href.replace(/\.smil(#.*)?$/i, ".xhtml$1"));
                                                link.TypeLink = "application/xhtml+xml";
                                                return [2];
                                            }
                                            if (href.indexOf("#") >= 0) {
                                                arr = href.split("#");
                                                href = arr[0].trim();
                                                fragment = arr[1].trim();
                                            }
                                            if (!href) {
                                                return [2];
                                            }
                                            smilDoc = undefined;
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            return [4, loadOrGetCachedSmil_1(href)];
                                        case 2:
                                            smilDoc = _a.sent();
                                            return [3, 4];
                                        case 3:
                                            zipErr_5 = _a.sent();
                                            debug(zipErr_5);
                                            return [3, 4];
                                        case 4:
                                            if (!smilDoc) {
                                                return [2];
                                            }
                                            targetEl = fragment ? smilDoc.getElementById(fragment) : undefined;
                                            if (!targetEl) {
                                                targetEl = findFirstDescendantTextOrAudio_1(smilDoc.documentElement, false);
                                            }
                                            if (!targetEl) {
                                                debug("--??-- !targetEl1 ", href);
                                                return [2];
                                            }
                                            if (targetEl.nodeName !== "text") {
                                                targetEl = findFirstDescendantTextOrAudio_1(targetEl, false);
                                            }
                                            if (!targetEl || targetEl.nodeName !== "text") {
                                                debug("--??-- !targetEl2 ", href);
                                                return [2];
                                            }
                                            src = targetEl.getAttribute("src");
                                            if (!src) {
                                                return [2];
                                            }
                                            link.Href = path.join(href, "..", src.replace(/((\.xml)|(\.html))(#.*)?$/i, ".xhtml$4")).replace(/\\/g, "/");
                                            link.TypeLink = "application/xhtml+xml";
                                            return [2];
                                    }
                                });
                            }); };
                            processLinks_1 = function (links) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                var _i, links_2, link;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _i = 0, links_2 = links;
                                            _a.label = 1;
                                        case 1:
                                            if (!(_i < links_2.length)) return [3, 5];
                                            link = links_2[_i];
                                            return [4, processLink_1(link)];
                                        case 2:
                                            _a.sent();
                                            if (!link.Children) return [3, 4];
                                            return [4, processLinks_1(link.Children)];
                                        case 3:
                                            _a.sent();
                                            _a.label = 4;
                                        case 4:
                                            _i++;
                                            return [3, 1];
                                        case 5: return [2];
                                    }
                                });
                            }); };
                            if (!publication.PageList) return [3, 29];
                            _m = 0, _o = publication.PageList;
                            _w.label = 26;
                        case 26:
                            if (!(_m < _o.length)) return [3, 29];
                            link = _o[_m];
                            return [4, processLink_1(link)];
                        case 27:
                            _w.sent();
                            _w.label = 28;
                        case 28:
                            _m++;
                            return [3, 26];
                        case 29:
                            if (!publication.Landmarks) return [3, 33];
                            _p = 0, _q = publication.Landmarks;
                            _w.label = 30;
                        case 30:
                            if (!(_p < _q.length)) return [3, 33];
                            link = _q[_p];
                            return [4, processLink_1(link)];
                        case 31:
                            _w.sent();
                            _w.label = 32;
                        case 32:
                            _p++;
                            return [3, 30];
                        case 33:
                            if (!publication.TOC) return [3, 35];
                            return [4, processLinks_1(publication.TOC)];
                        case 34:
                            _w.sent();
                            _w.label = 35;
                        case 35:
                            if (!generateDaisyAudioManifestOnly) {
                                jsonObj = (0, serializable_1.TaJsonSerialize)(publication);
                                jsonStr = global.JSON.stringify(jsonObj, null, "  ");
                                zipfile.addBuffer(Buffer.from(jsonStr), "manifest.json");
                            }
                            isAudioOnly_ = isAudioOnly || (isFullTextAudio && generateDaisyAudioManifestOnly);
                            if (!isAudioOnly_) return [3, 39];
                            debug("DAISY audio only book => manifest-audio.json" + (generateDaisyAudioManifestOnly ? " (generateDaisyAudioManifestOnly ***_manifest.json)" : ""));
                            transformPublicationToAudioBook = function (pubAudio) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                var pubJson, audioPublication, processLinkAudio, processLinksAudio, i, link, keep, i, link, keep, _loop_2, _i, _a, spineLink;
                                var _b;
                                return tslib_1.__generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            pubJson = (0, serializable_1.TaJsonSerialize)(pubAudio);
                                            audioPublication = (0, serializable_1.TaJsonDeserialize)(pubJson, publication_1.Publication);
                                            if (!audioPublication.Metadata) {
                                                audioPublication.Metadata = new metadata_1.Metadata();
                                            }
                                            audioPublication.Metadata.RDFType = "http://schema.org/Audiobook";
                                            processLinkAudio = function (link) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                                var href, fragment, arr, smilHref, smilDoc, zipErr_6, targetEl, targetElOriginal, src, clipBegin, timeStamp, begin, mediaType;
                                                return tslib_1.__generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            href = link.HrefDecoded;
                                                            if (!href) {
                                                                return [2, link.Children ? null : false];
                                                            }
                                                            if (href.indexOf("#") >= 0) {
                                                                arr = href.split("#");
                                                                href = arr[0].trim();
                                                                fragment = arr[1].trim();
                                                            }
                                                            if (!href) {
                                                                return [2, link.Children ? null : false];
                                                            }
                                                            smilHref = href.replace(/\.xhtml(#.*)?$/i, ".smil$1");
                                                            smilDoc = undefined;
                                                            _a.label = 1;
                                                        case 1:
                                                            _a.trys.push([1, 3, , 4]);
                                                            return [4, loadOrGetCachedSmil_1(smilHref)];
                                                        case 2:
                                                            smilDoc = _a.sent();
                                                            return [3, 4];
                                                        case 3:
                                                            zipErr_6 = _a.sent();
                                                            debug(zipErr_6);
                                                            return [3, 4];
                                                        case 4:
                                                            if (!smilDoc) {
                                                                return [2, link.Children ? null : false];
                                                            }
                                                            targetEl = fragment ? smilDoc.getElementById(fragment) : undefined;
                                                            if (!targetEl) {
                                                                targetEl = findFirstDescendantTextOrAudio_1(smilDoc.documentElement, true);
                                                            }
                                                            if (!targetEl) {
                                                                debug("==?? !targetEl1 ", href, new xmldom.XMLSerializer().serializeToString(smilDoc.documentElement));
                                                                return [2, link.Children ? null : false];
                                                            }
                                                            targetElOriginal = targetEl;
                                                            if (targetEl.nodeName !== "audio") {
                                                                targetEl = findFirstDescendantTextOrAudio_1((targetEl.nodeName === "text" && targetEl.parentNode) ?
                                                                    targetEl.parentNode :
                                                                    targetEl, true);
                                                            }
                                                            if (!targetEl || targetEl.nodeName !== "audio") {
                                                                debug("==?? !targetEl2 ", href, new xmldom.XMLSerializer().serializeToString(targetElOriginal));
                                                                return [2, link.Children ? null : false];
                                                            }
                                                            src = targetEl.getAttribute("src");
                                                            if (!src) {
                                                                debug("==?? !src");
                                                                return [2, link.Children ? null : false];
                                                            }
                                                            clipBegin = targetEl.getAttribute("clipBegin") || targetEl.getAttribute("clip-begin");
                                                            timeStamp = "#t=";
                                                            begin = clipBegin ? (0, media_overlay_1.timeStrToSeconds)(clipBegin) : 0;
                                                            timeStamp += begin.toString();
                                                            link.Href = path.join(smilHref, "..", src + timeStamp).replace(/\\/g, "/");
                                                            link.TypeLink = "audio/?";
                                                            mediaType = mime.lookup(src);
                                                            if (mediaType) {
                                                                link.TypeLink = mediaType;
                                                            }
                                                            return [2, true];
                                                    }
                                                });
                                            }); };
                                            processLinksAudio = function (children) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                                var i, link, keep;
                                                return tslib_1.__generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            i = 0;
                                                            _a.label = 1;
                                                        case 1:
                                                            if (!(i < children.length)) return [3, 5];
                                                            link = children[i];
                                                            return [4, processLinkAudio(link)];
                                                        case 2:
                                                            keep = _a.sent();
                                                            if (!keep) {
                                                                if (keep === null) {
                                                                    debug("LINK VOID TOC: ", link.Href, typeof link.Children);
                                                                    link.HrefDecoded = undefined;
                                                                    delete link.Href1;
                                                                    delete link.TypeLink;
                                                                }
                                                                else {
                                                                    children.splice(i, 1);
                                                                    i--;
                                                                    debug("LINK DELETE TOC: ", link.Href, typeof link.Children);
                                                                }
                                                            }
                                                            if (!((keep || keep === null) && link.Children)) return [3, 4];
                                                            return [4, processLinksAudio(link.Children)];
                                                        case 3:
                                                            _a.sent();
                                                            if (link.Children.length === 0) {
                                                                delete link.Children;
                                                                if (!link.Href) {
                                                                    children.splice(i, 1);
                                                                    i--;
                                                                }
                                                            }
                                                            _a.label = 4;
                                                        case 4:
                                                            i++;
                                                            return [3, 1];
                                                        case 5: return [2];
                                                    }
                                                });
                                            }); };
                                            if (!audioPublication.PageList) return [3, 4];
                                            i = 0;
                                            _c.label = 1;
                                        case 1:
                                            if (!(i < audioPublication.PageList.length)) return [3, 4];
                                            link = audioPublication.PageList[i];
                                            return [4, processLinkAudio(link)];
                                        case 2:
                                            keep = _c.sent();
                                            if (!keep) {
                                                if (keep === null) {
                                                    debug("LINK VOID page list: ", link.Href, typeof link.Children);
                                                    link.HrefDecoded = undefined;
                                                    delete link.Href1;
                                                    delete link.TypeLink;
                                                }
                                                else {
                                                    audioPublication.PageList.splice(i, 1);
                                                    i--;
                                                    debug("LINK DELETE page list: ", link.Href, typeof link.Children);
                                                }
                                            }
                                            _c.label = 3;
                                        case 3:
                                            i++;
                                            return [3, 1];
                                        case 4:
                                            if (!audioPublication.Landmarks) return [3, 8];
                                            i = 0;
                                            _c.label = 5;
                                        case 5:
                                            if (!(i < audioPublication.Landmarks.length)) return [3, 8];
                                            link = audioPublication.Landmarks[i];
                                            return [4, processLinkAudio(link)];
                                        case 6:
                                            keep = _c.sent();
                                            if (!keep) {
                                                if (keep === null) {
                                                    debug("LINK VOID landmarks: ", link.Href, typeof link.Children);
                                                    link.HrefDecoded = undefined;
                                                    delete link.Href1;
                                                    delete link.TypeLink;
                                                }
                                                else {
                                                    audioPublication.Landmarks.splice(i, 1);
                                                    i--;
                                                    debug("LINK DELETE landmarks: ", link.Href, typeof link.Children);
                                                }
                                            }
                                            _c.label = 7;
                                        case 7:
                                            i++;
                                            return [3, 5];
                                        case 8:
                                            if (!audioPublication.TOC) return [3, 10];
                                            return [4, processLinksAudio(audioPublication.TOC)];
                                        case 9:
                                            _c.sent();
                                            _c.label = 10;
                                        case 10:
                                            audioPublication.Spine = [];
                                            if (!pubAudio.Spine) return [3, 14];
                                            _loop_2 = function (spineLink) {
                                                var smilDoc, zipErr_7, firstAudioElement, src, link, resAudioIndex, resAudio, resAudio;
                                                return tslib_1.__generator(this, function (_d) {
                                                    switch (_d.label) {
                                                        case 0:
                                                            if (!((_b = spineLink.MediaOverlays) === null || _b === void 0 ? void 0 : _b.SmilPathInZip)) {
                                                                debug("???- !spineLink.MediaOverlays?.SmilPathInZip");
                                                                return [2, "continue"];
                                                            }
                                                            smilDoc = undefined;
                                                            _d.label = 1;
                                                        case 1:
                                                            _d.trys.push([1, 3, , 4]);
                                                            return [4, loadOrGetCachedSmil_1(spineLink.MediaOverlays.SmilPathInZip)];
                                                        case 2:
                                                            smilDoc = _d.sent();
                                                            return [3, 4];
                                                        case 3:
                                                            zipErr_7 = _d.sent();
                                                            debug(zipErr_7);
                                                            return [3, 4];
                                                        case 4:
                                                            if (!smilDoc) {
                                                                return [2, "continue"];
                                                            }
                                                            firstAudioElement = findFirstDescendantTextOrAudio_1(smilDoc.documentElement, true);
                                                            if (!firstAudioElement) {
                                                                debug("???- !firstAudioElement ", spineLink.MediaOverlays.SmilPathInZip);
                                                                return [2, "continue"];
                                                            }
                                                            src = firstAudioElement.getAttribute("src");
                                                            if (!src) {
                                                                return [2, "continue"];
                                                            }
                                                            link = new publication_link_1.Link();
                                                            link.Href = path.join(spineLink.MediaOverlays.SmilPathInZip, "..", src).replace(/\\/g, "/");
                                                            link.TypeLink = "audio/?";
                                                            if (audioPublication.Resources) {
                                                                resAudioIndex = audioPublication.Resources.findIndex(function (l) {
                                                                    return l.Href === path.join(spineLink.MediaOverlays.SmilPathInZip, "..", src).replace(/\\/g, "/");
                                                                });
                                                                if (resAudioIndex >= 0) {
                                                                    resAudio = audioPublication.Resources[resAudioIndex];
                                                                    if (resAudio.TypeLink) {
                                                                        link.TypeLink = resAudio.TypeLink;
                                                                    }
                                                                    audioPublication.Resources.splice(resAudioIndex, 1);
                                                                }
                                                                else {
                                                                    resAudio = audioPublication.Spine.find(function (l) {
                                                                        return l.Href === link.Href;
                                                                    });
                                                                    if (resAudio === null || resAudio === void 0 ? void 0 : resAudio.TypeLink) {
                                                                        link.TypeLink = resAudio.TypeLink;
                                                                    }
                                                                }
                                                            }
                                                            if (spineLink.MediaOverlays.duration) {
                                                                link.Duration = spineLink.MediaOverlays.duration;
                                                            }
                                                            audioPublication.Spine.push(link);
                                                            return [2];
                                                    }
                                                });
                                            };
                                            _i = 0, _a = pubAudio.Spine;
                                            _c.label = 11;
                                        case 11:
                                            if (!(_i < _a.length)) return [3, 14];
                                            spineLink = _a[_i];
                                            return [5, _loop_2(spineLink)];
                                        case 12:
                                            _c.sent();
                                            _c.label = 13;
                                        case 13:
                                            _i++;
                                            return [3, 11];
                                        case 14: return [2, audioPublication];
                                    }
                                });
                            }); };
                            _w.label = 36;
                        case 36:
                            _w.trys.push([36, 38, , 39]);
                            return [4, transformPublicationToAudioBook(publication)];
                        case 37:
                            audioPublication = _w.sent();
                            jsonObjAudio = (0, serializable_1.TaJsonSerialize)(audioPublication);
                            jsonStrAudio = global.JSON.stringify(jsonObjAudio, null, "  ");
                            if (!generateDaisyAudioManifestOnly) {
                                zipfile.addBuffer(Buffer.from(jsonStrAudio), "manifest-audio.json");
                            }
                            else {
                                outputManifestPath = path.join(outputDirPath, generateDaisyAudioManifestOnly + "_manifest.json");
                                ensureDirs(outputManifestPath);
                                fs.writeFileSync(outputManifestPath, jsonStrAudio, "utf8");
                                debug("generateDaisyAudioManifestOnly OK: " + outputManifestPath);
                                resolve(outputManifestPath);
                            }
                            return [3, 39];
                        case 38:
                            ero_1 = _w.sent();
                            debug(ero_1);
                            return [3, 39];
                        case 39: return [3, 42];
                        case 40:
                            erreur_1 = _w.sent();
                            debug(erreur_1);
                            return [3, 42];
                        case 41:
                            debug("DAISY-EPUB-RWPM done.");
                            if (!generateDaisyAudioManifestOnly) {
                                timeoutId = setTimeout(function () {
                                    timeoutId = undefined;
                                    reject("YAZL zip took too long!? " + outputZipPath);
                                }, 10000);
                                zipfile.end();
                            }
                            return [7];
                        case 42: return [2];
                    }
                });
            }); })];
    });
}); };
exports.convertDaisyToReadiumWebPub = convertDaisyToReadiumWebPub;
//# sourceMappingURL=daisy-convert-to-epub.js.map