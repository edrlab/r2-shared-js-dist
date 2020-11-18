"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDaisyToReadiumWebPub = void 0;
var tslib_1 = require("tslib");
var debug_ = require("debug");
var fs = require("fs");
var path = require("path");
var xmldom = require("xmldom");
var xpath = require("xpath");
var yazl_1 = require("yazl");
var media_overlay_1 = require("../models/media-overlay");
var metadata_1 = require("../models/metadata");
var metadata_properties_1 = require("../models/metadata-properties");
var publication_link_1 = require("../models/publication-link");
var serializable_1 = require("r2-lcp-js/dist/es5/src/serializable");
var epub_daisy_common_1 = require("./epub-daisy-common");
var debug = debug_("r2:shared#parser/daisy-convert-to-epub");
function ensureDirs(fspath) {
    var dirname = path.dirname(fspath);
    if (!fs.existsSync(dirname)) {
        ensureDirs(dirname);
        fs.mkdirSync(dirname);
    }
}
exports.convertDaisyToReadiumWebPub = function (outputDirPath, publication) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    return tslib_1.__generator(this, function (_a) {
        return [2, new Promise(function (resolve, reject) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                var zipInternal, zip, outputZipPath, timeoutId, zipfile, writeStream, select, elementNames, mediaOverlaysMap_1, getMediaOverlaysDuration_1, patchMediaOverlaysTextHref_1, isFullTextAudio, previousLinkItem, spineIndex, _i, _a, linkItem, computedDur, dur, smilTextRef, resourcesToKeep, dtBooks, _b, _c, resLink, cssText, _d, elementNames_1, elementName, regex, dtBookStr, dtBookDoc, title, listElements, i, listElement, type, _e, elementNames_2, elementName, els, _f, els_1, el, cls, stylesheets, cssHrefs, _g, stylesheets_1, stylesheet, match, href, smilRefs, _h, smilRefs_1, smilRef, ref, dtbookNowXHTML, xhtmlFilePath, resLinkJson, resLinkClone, buff, mediaOverlaysSequence, _loop_1, _j, mediaOverlaysSequence_1, mediaOverlay, findFirstDescendantText_1, smilDocs_1, processLink_1, processLinks_1, _k, _l, link, _m, _o, link, jsonObj, jsonStr, erreur_1;
                var _p, _q;
                return tslib_1.__generator(this, function (_r) {
                    switch (_r.label) {
                        case 0:
                            zipInternal = publication.findFromInternal("zip");
                            if (!zipInternal) {
                                debug("No publication zip!?");
                                return [2, reject("No publication zip!?")];
                            }
                            zip = zipInternal.Value;
                            outputZipPath = path.join(outputDirPath, "daisy-to-epub.webpub");
                            ensureDirs(outputZipPath);
                            zipfile = new yazl_1.ZipFile();
                            _r.label = 1;
                        case 1:
                            _r.trys.push([1, 25, 26, 27]);
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
                            patchMediaOverlaysTextHref_1 = function (mo) {
                                var smilTextRef;
                                if (mo.Text) {
                                    mo.Text = mo.Text.replace(/\.xml/, ".xhtml");
                                    smilTextRef = mo.Text;
                                    var k = smilTextRef.indexOf("#");
                                    if (k > 0) {
                                        smilTextRef = smilTextRef.substr(0, k);
                                    }
                                }
                                if (mo.Children) {
                                    for (var _i = 0, _a = mo.Children; _i < _a.length; _i++) {
                                        var child = _a[_i];
                                        var smilTextRef_ = patchMediaOverlaysTextHref_1(child);
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
                            isFullTextAudio = ((_p = publication.Metadata) === null || _p === void 0 ? void 0 : _p.AdditionalJSON) &&
                                publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioFullText";
                            if (!publication.Spine) return [3, 6];
                            mediaOverlaysMap_1 = {};
                            previousLinkItem = void 0;
                            spineIndex = -1;
                            _i = 0, _a = publication.Spine;
                            _r.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3, 6];
                            linkItem = _a[_i];
                            spineIndex++;
                            if (!linkItem.MediaOverlays) {
                                return [3, 5];
                            }
                            if (!!linkItem.MediaOverlays.initialized) return [3, 4];
                            return [4, epub_daisy_common_1.lazyLoadMediaOverlays(publication, linkItem.MediaOverlays)];
                        case 3:
                            _r.sent();
                            if (isFullTextAudio) {
                                epub_daisy_common_1.updateDurations(linkItem.MediaOverlays.duration, linkItem);
                            }
                            _r.label = 4;
                        case 4:
                            if (isFullTextAudio) {
                                computedDur = getMediaOverlaysDuration_1(linkItem.MediaOverlays);
                                if (computedDur) {
                                    if (!linkItem.MediaOverlays.duration) {
                                        linkItem.MediaOverlays.duration = computedDur;
                                        epub_daisy_common_1.updateDurations(computedDur, linkItem);
                                    }
                                    else {
                                        if (Math.round(linkItem.MediaOverlays.duration) !== Math.round(computedDur)) {
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
                                            epub_daisy_common_1.updateDurations(dur, previousLinkItem);
                                        }
                                        else {
                                            if (Math.round(previousLinkItem.MediaOverlays.duration) !== Math.round(dur)) {
                                                debug("previousLinkItem.MediaOverlays.duration !== dur", previousLinkItem.MediaOverlays.duration, dur);
                                            }
                                        }
                                    }
                                }
                                previousLinkItem = linkItem;
                            }
                            smilTextRef = patchMediaOverlaysTextHref_1(linkItem.MediaOverlays);
                            if (smilTextRef) {
                                if (!mediaOverlaysMap_1[smilTextRef]) {
                                    mediaOverlaysMap_1[smilTextRef] = {
                                        index: spineIndex,
                                        mos: [],
                                    };
                                }
                                mediaOverlaysMap_1[smilTextRef].index = spineIndex;
                                mediaOverlaysMap_1[smilTextRef].mos.push(linkItem.MediaOverlays);
                            }
                            _r.label = 5;
                        case 5:
                            _i++;
                            return [3, 2];
                        case 6:
                            publication.Spine = [];
                            resourcesToKeep = [];
                            dtBooks = [];
                            _b = 0, _c = publication.Resources;
                            _r.label = 7;
                        case 7:
                            if (!(_b < _c.length)) return [3, 14];
                            resLink = _c[_b];
                            if (!resLink.HrefDecoded) {
                                return [3, 13];
                            }
                            if (!(resLink.TypeLink === "text/css" || resLink.HrefDecoded.endsWith(".css"))) return [3, 9];
                            return [4, epub_daisy_common_1.loadFileStrFromZipPath(resLink.Href, resLink.HrefDecoded, zip)];
                        case 8:
                            cssText = _r.sent();
                            if (!cssText) {
                                debug("!loadFileStrFromZipPath", resLink.HrefDecoded);
                                return [3, 13];
                            }
                            cssText = cssText.replace(/\/\*([\s\S]+?)\*\//gm, function (_match, p1, _offset, _string) {
                                var base64 = Buffer.from(p1).toString("base64");
                                return "/*__" + base64 + "__*/";
                            });
                            for (_d = 0, elementNames_1 = elementNames; _d < elementNames_1.length; _d++) {
                                elementName = elementNames_1[_d];
                                regex = new RegExp("([^#.a-zA-Z0-9-_])(" + elementName + ")([^a-zA-Z0-9-_;])", "g");
                                cssText = cssText.replace(regex, "$1.$2_R2$3");
                                cssText = cssText.replace(regex, "$1.$2_R2$3");
                            }
                            cssText = cssText.replace(/\/\*__([\s\S]+?)__\*\//g, function (_match, p1, _offset, _string) {
                                var comment = Buffer.from(p1, "base64").toString("utf8");
                                return "/*" + comment + "*/";
                            });
                            zipfile.addBuffer(Buffer.from(cssText), resLink.HrefDecoded);
                            resourcesToKeep.push(resLink);
                            return [3, 13];
                        case 9:
                            if (!(resLink.TypeLink === "application/x-dtbook+xml" || resLink.HrefDecoded.endsWith(".xml"))) return [3, 11];
                            return [4, epub_daisy_common_1.loadFileStrFromZipPath(resLink.Href, resLink.HrefDecoded, zip)];
                        case 10:
                            dtBookStr = _r.sent();
                            if (!dtBookStr) {
                                debug("!loadFileStrFromZipPath", dtBookStr);
                                return [3, 13];
                            }
                            dtBookStr = dtBookStr.replace(/xmlns=""/, " ");
                            dtBookStr = dtBookStr.replace(/<dtbook/, "<dtbook xmlns:epub=\"http://www.idpf.org/2007/ops\" ");
                            dtBookDoc = new xmldom.DOMParser().parseFromString(dtBookStr, "application/xml");
                            title = (_q = dtBookDoc.getElementsByTagName("doctitle")[0]) === null || _q === void 0 ? void 0 : _q.textContent;
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
                                    el.setAttribute("class", "" + (cls ? (cls + " ") : "") + elementName + "_R2");
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
                            smilRefs = select("//*[@smilref]", dtBookDoc);
                            for (_h = 0, smilRefs_1 = smilRefs; _h < smilRefs_1.length; _h++) {
                                smilRef = smilRefs_1[_h];
                                ref = smilRef.getAttribute("smilref");
                                if (ref) {
                                    smilRef.setAttribute("data-smilref", ref);
                                }
                                smilRef.removeAttribute("smilref");
                            }
                            dtbookNowXHTML = new xmldom.XMLSerializer().serializeToString(dtBookDoc)
                                .replace(/xmlns="http:\/\/www\.daisy\.org\/z3986\/2005\/dtbook\/"/, "xmlns=\"http://www.w3.org/1999/xhtml\"")
                                .replace(/xmlns="http:\/\/www\.daisy\.org\/z3986\/2005\/dtbook\/"/g, " ")
                                .replace(/^([\s\S]*)<html/gm, "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<!DOCTYPE xhtml>\n<html ")
                                .replace(/<head([\s\S]*?)>/gm, "\n<head$1>\n<meta charset=\"UTF-8\" />\n" + (title ? "<title>" + title + "</title>" : "") + "\n")
                                .replace(/<\/head[\s\S]*?>/gm, "\n" + cssHrefs.reduce(function (pv, cv) {
                                return pv + "\n" + ("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + cv + "\" />");
                            }, "") + "\n</head>\n");
                            xhtmlFilePath = resLink.HrefDecoded.replace(/\.(.+)$/, ".xhtml");
                            zipfile.addBuffer(Buffer.from(dtbookNowXHTML), xhtmlFilePath);
                            resLinkJson = serializable_1.TaJsonSerialize(resLink);
                            resLinkClone = serializable_1.TaJsonDeserialize(resLinkJson, publication_link_1.Link);
                            resLinkClone.setHrefDecoded(xhtmlFilePath);
                            resLinkClone.TypeLink = "application/xhtml+xml";
                            dtBooks.push(resLinkClone);
                            return [3, 13];
                        case 11:
                            if (!(!resLink.HrefDecoded.endsWith(".opf") &&
                                !resLink.HrefDecoded.endsWith(".res") &&
                                !resLink.HrefDecoded.endsWith(".ncx"))) return [3, 13];
                            return [4, epub_daisy_common_1.loadFileBufferFromZipPath(resLink.Href, resLink.HrefDecoded, zip)];
                        case 12:
                            buff = _r.sent();
                            if (buff) {
                                zipfile.addBuffer(buff, resLink.HrefDecoded);
                            }
                            resourcesToKeep.push(resLink);
                            _r.label = 13;
                        case 13:
                            _b++;
                            return [3, 7];
                        case 14:
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
                                            debug("smilTextRef [" + i + "]: " + smilTextRef);
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
                                        return l.HrefDecoded === mediaOverlay.smilTextRef;
                                    });
                                    if (!dtBookLink) {
                                        debug("!!dtBookLink");
                                    }
                                    else if (dtBookLink.HrefDecoded !== mediaOverlay.smilTextRef) {
                                        debug("dtBook.HrefDecoded !== mediaOverlay.smilTextRef", dtBookLink.HrefDecoded, mediaOverlay.smilTextRef);
                                    }
                                    else {
                                        if (isFullTextAudio) {
                                            dtBookLink.MediaOverlays = mediaOverlay.mo;
                                            if (mediaOverlay.mo.duration) {
                                                dtBookLink.Duration = mediaOverlay.mo.duration;
                                            }
                                            var moURL = "smil-media-overlays_" + mediaOverlay.index + ".json";
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
                                            var jsonObjMO = serializable_1.TaJsonSerialize(mediaOverlay.mo);
                                            var jsonStrMO = global.JSON.stringify(jsonObjMO, null, "  ");
                                            zipfile.addBuffer(Buffer.from(jsonStrMO), moURL);
                                            debug("dtBookLink IN SPINE:", mediaOverlay.index, dtBookLink.HrefDecoded, dtBookLink.Duration, moURL);
                                        }
                                        else {
                                            debug("dtBookLink IN SPINE (no audio):", mediaOverlay.index, dtBookLink.HrefDecoded);
                                        }
                                        publication.Spine.push(dtBookLink);
                                    }
                                };
                                for (_j = 0, mediaOverlaysSequence_1 = mediaOverlaysSequence; _j < mediaOverlaysSequence_1.length; _j++) {
                                    mediaOverlay = mediaOverlaysSequence_1[_j];
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
                            publication.Metadata.AdditionalJSON.ReadiumWebPublicationConvertedFrom = "DAISY";
                            findFirstDescendantText_1 = function (parent) {
                                if (parent.childNodes && parent.childNodes.length) {
                                    for (var i = 0; i < parent.childNodes.length; i++) {
                                        var child = parent.childNodes[i];
                                        if (child.nodeType === 1) {
                                            var element = child;
                                            if (element.localName && element.localName.toLowerCase() === "text") {
                                                return element;
                                            }
                                        }
                                    }
                                    for (var i = 0; i < parent.childNodes.length; i++) {
                                        var child = parent.childNodes[i];
                                        if (child.nodeType === 1) {
                                            var element = child;
                                            var found = findFirstDescendantText_1(element);
                                            if (found) {
                                                return found;
                                            }
                                        }
                                    }
                                }
                                return undefined;
                            };
                            smilDocs_1 = {};
                            processLink_1 = function (link) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                var href, fragment, arr, smilDoc, smilStr, targetEl, src;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            href = link.HrefDecoded;
                                            if (!href) {
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
                                            smilDoc = smilDocs_1[href];
                                            if (!!smilDoc) return [3, 2];
                                            return [4, epub_daisy_common_1.loadFileStrFromZipPath(href, href, zip)];
                                        case 1:
                                            smilStr = _a.sent();
                                            if (!smilStr) {
                                                debug("!loadFileStrFromZipPath", smilStr);
                                                return [2];
                                            }
                                            smilDoc = new xmldom.DOMParser().parseFromString(smilStr, "application/xml");
                                            smilDocs_1[href] = smilDoc;
                                            _a.label = 2;
                                        case 2:
                                            targetEl = fragment ? smilDoc.getElementById(fragment) : undefined;
                                            if (!targetEl) {
                                                targetEl = findFirstDescendantText_1(smilDoc.documentElement);
                                            }
                                            if (!targetEl) {
                                                return [2];
                                            }
                                            if (targetEl.nodeName !== "text") {
                                                targetEl = findFirstDescendantText_1(targetEl);
                                            }
                                            if (!targetEl || targetEl.nodeName !== "text") {
                                                return [2];
                                            }
                                            src = targetEl.getAttribute("src");
                                            if (!src) {
                                                return [2];
                                            }
                                            link.Href = src.replace(/\.xml/, ".xhtml");
                                            return [2];
                                    }
                                });
                            }); };
                            processLinks_1 = function (links) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                                var _i, links_1, link;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _i = 0, links_1 = links;
                                            _a.label = 1;
                                        case 1:
                                            if (!(_i < links_1.length)) return [3, 5];
                                            link = links_1[_i];
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
                            if (!publication.PageList) return [3, 18];
                            _k = 0, _l = publication.PageList;
                            _r.label = 15;
                        case 15:
                            if (!(_k < _l.length)) return [3, 18];
                            link = _l[_k];
                            return [4, processLink_1(link)];
                        case 16:
                            _r.sent();
                            _r.label = 17;
                        case 17:
                            _k++;
                            return [3, 15];
                        case 18:
                            if (!publication.Landmarks) return [3, 22];
                            _m = 0, _o = publication.Landmarks;
                            _r.label = 19;
                        case 19:
                            if (!(_m < _o.length)) return [3, 22];
                            link = _o[_m];
                            return [4, processLink_1(link)];
                        case 20:
                            _r.sent();
                            _r.label = 21;
                        case 21:
                            _m++;
                            return [3, 19];
                        case 22:
                            if (!publication.TOC) return [3, 24];
                            return [4, processLinks_1(publication.TOC)];
                        case 23:
                            _r.sent();
                            _r.label = 24;
                        case 24:
                            jsonObj = serializable_1.TaJsonSerialize(publication);
                            jsonStr = global.JSON.stringify(jsonObj, null, "  ");
                            zipfile.addBuffer(Buffer.from(jsonStr), "manifest.json");
                            return [3, 27];
                        case 25:
                            erreur_1 = _r.sent();
                            debug(erreur_1);
                            return [3, 27];
                        case 26:
                            timeoutId = setTimeout(function () {
                                timeoutId = undefined;
                                reject("YAZL zip took too long!? " + outputZipPath);
                            }, 10000);
                            zipfile.end();
                            return [7];
                        case 27: return [2];
                    }
                });
            }); })];
    });
}); };
//# sourceMappingURL=daisy-convert-to-epub.js.map