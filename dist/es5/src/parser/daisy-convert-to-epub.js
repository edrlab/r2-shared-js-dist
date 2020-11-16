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
var epub_1 = require("./epub");
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
                var zipInternal, zip, outputZipPath, timeoutId, zipfile, writeStream, select, elementNames, combinedMediaOverlays, patchMediaOverlaysTextHref_1, _i, _a, linkItem, _b, _c, altLink, resourcesToKeep, _d, _e, resLink, cssText, _f, elementNames_1, elementName, regex, dtBookStr, dtBookDoc, title, listElements, i, listElement, type, _g, elementNames_2, elementName, els, _h, els_1, el, cls, stylesheets, cssHrefs, _j, stylesheets_1, stylesheet, match, href, smilRefs, _k, smilRefs_1, smilRef, ref, dtbookNowXHTML, xhtmlFilePath, resLinkJson, resLinkClone, moURL, moLink, jsonObjMO, jsonStrMO, buff, findFirstDescendantText_1, smilDocs_1, processLink_1, processLinks_1, _l, _m, link, _o, _p, link, jsonObj, jsonStr, erreur_1;
                var _q, _r;
                return tslib_1.__generator(this, function (_s) {
                    switch (_s.label) {
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
                            _s.label = 1;
                        case 1:
                            _s.trys.push([1, 26, 27, 28]);
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
                            combinedMediaOverlays = void 0;
                            patchMediaOverlaysTextHref_1 = function (mo) {
                                if (mo.Text) {
                                    mo.Text = mo.Text.replace(/\.xml/, ".xhtml");
                                }
                                if (mo.Children) {
                                    for (var _i = 0, _a = mo.Children; _i < _a.length; _i++) {
                                        var child = _a[_i];
                                        patchMediaOverlaysTextHref_1(child);
                                    }
                                }
                            };
                            if (!(publication.Spine && ((_q = publication.Metadata) === null || _q === void 0 ? void 0 : _q.AdditionalJSON) &&
                                publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioFullText")) return [3, 7];
                            combinedMediaOverlays = new media_overlay_1.MediaOverlayNode();
                            combinedMediaOverlays.SmilPathInZip = undefined;
                            combinedMediaOverlays.initialized = true;
                            combinedMediaOverlays.Role = [];
                            combinedMediaOverlays.Role.push("section");
                            combinedMediaOverlays.duration = 0;
                            _i = 0, _a = publication.Spine;
                            _s.label = 2;
                        case 2:
                            if (!(_i < _a.length)) return [3, 6];
                            linkItem = _a[_i];
                            if (!linkItem.MediaOverlays) return [3, 5];
                            if (!!linkItem.MediaOverlays.initialized) return [3, 4];
                            return [4, epub_1.lazyLoadMediaOverlays(publication, linkItem.MediaOverlays)];
                        case 3:
                            _s.sent();
                            if (linkItem.MediaOverlays.duration) {
                                if (!linkItem.Duration) {
                                    linkItem.Duration = linkItem.MediaOverlays.duration;
                                }
                                if (linkItem.Alternate) {
                                    for (_b = 0, _c = linkItem.Alternate; _b < _c.length; _b++) {
                                        altLink = _c[_b];
                                        if (altLink.TypeLink === "application/vnd.syncnarr+json") {
                                            if (!altLink.Duration) {
                                                altLink.Duration = linkItem.MediaOverlays.duration;
                                            }
                                        }
                                    }
                                }
                            }
                            _s.label = 4;
                        case 4:
                            if (linkItem.MediaOverlays.Children) {
                                if (!combinedMediaOverlays.Children) {
                                    combinedMediaOverlays.Children = [];
                                }
                                combinedMediaOverlays.Children =
                                    combinedMediaOverlays.Children.concat(linkItem.MediaOverlays.Children);
                                if (linkItem.MediaOverlays.duration) {
                                    combinedMediaOverlays.duration += linkItem.MediaOverlays.duration;
                                }
                            }
                            _s.label = 5;
                        case 5:
                            _i++;
                            return [3, 2];
                        case 6:
                            patchMediaOverlaysTextHref_1(combinedMediaOverlays);
                            _s.label = 7;
                        case 7:
                            publication.Spine = [];
                            resourcesToKeep = [];
                            _d = 0, _e = publication.Resources;
                            _s.label = 8;
                        case 8:
                            if (!(_d < _e.length)) return [3, 15];
                            resLink = _e[_d];
                            if (!resLink.HrefDecoded) {
                                return [3, 14];
                            }
                            if (!(resLink.TypeLink === "text/css" || resLink.HrefDecoded.endsWith(".css"))) return [3, 10];
                            return [4, epub_daisy_common_1.loadFileStrFromZipPath(resLink.Href, resLink.HrefDecoded, zip)];
                        case 9:
                            cssText = _s.sent();
                            if (!cssText) {
                                debug("!loadFileStrFromZipPath", resLink.HrefDecoded);
                                return [3, 14];
                            }
                            cssText = cssText.replace(/\/\*([\s\S]+?)\*\//gm, function (_match, p1, _offset, _string) {
                                var base64 = Buffer.from(p1).toString("base64");
                                return "/*__" + base64 + "__*/";
                            });
                            for (_f = 0, elementNames_1 = elementNames; _f < elementNames_1.length; _f++) {
                                elementName = elementNames_1[_f];
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
                            return [3, 14];
                        case 10:
                            if (!(resLink.TypeLink === "application/x-dtbook+xml" || resLink.HrefDecoded.endsWith(".xml"))) return [3, 12];
                            return [4, epub_daisy_common_1.loadFileStrFromZipPath(resLink.Href, resLink.HrefDecoded, zip)];
                        case 11:
                            dtBookStr = _s.sent();
                            if (!dtBookStr) {
                                debug("!loadFileStrFromZipPath", dtBookStr);
                                return [3, 14];
                            }
                            dtBookDoc = new xmldom.DOMParser().parseFromString(dtBookStr, "application/xml");
                            title = (_r = dtBookDoc.getElementsByTagName("doctitle")[0]) === null || _r === void 0 ? void 0 : _r.textContent;
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
                            for (_g = 0, elementNames_2 = elementNames; _g < elementNames_2.length; _g++) {
                                elementName = elementNames_2[_g];
                                els = Array.from(dtBookDoc.getElementsByTagName(elementName)).filter(function (el) { return el; });
                                for (_h = 0, els_1 = els; _h < els_1.length; _h++) {
                                    el = els_1[_h];
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
                                                                "div"))))));
                                }
                            }
                            stylesheets = select("/processing-instruction('xml-stylesheet')", dtBookDoc);
                            cssHrefs = [];
                            for (_j = 0, stylesheets_1 = stylesheets; _j < stylesheets_1.length; _j++) {
                                stylesheet = stylesheets_1[_j];
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
                            for (_k = 0, smilRefs_1 = smilRefs; _k < smilRefs_1.length; _k++) {
                                smilRef = smilRefs_1[_k];
                                ref = smilRef.getAttribute("smilref");
                                if (ref) {
                                    smilRef.setAttribute("data-smilref", ref);
                                }
                                smilRef.removeAttribute("smilref");
                            }
                            dtbookNowXHTML = new xmldom.XMLSerializer().serializeToString(dtBookDoc)
                                .replace(/xmlns="http:\/\/www\.daisy\.org\/z3986\/2005\/dtbook\/"/, "xmlns=\"http://www.w3.org/1999/xhtml\"")
                                .replace(/^([\s\S]*)<html/gm, "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<!DOCTYPE xhtml>\n<html")
                                .replace(/<head([\s\S]*?)>/gm, "\n<head$1>\n<meta charset=\"UTF-8\" />\n<title>" + (title ? title : " ") + "</title>\n")
                                .replace(/<\/head[\s\S]*?>/gm, "\n" + cssHrefs.reduce(function (pv, cv) {
                                return pv + "\n" + ("<link rel=\"stylesheet\" type=\"text/css\" href=\"" + cv + "\" />");
                            }, "") + "\n</head>\n");
                            xhtmlFilePath = resLink.HrefDecoded.replace(/\.(.+)$/, ".xhtml");
                            zipfile.addBuffer(Buffer.from(dtbookNowXHTML), xhtmlFilePath);
                            resLinkJson = serializable_1.TaJsonSerialize(resLink);
                            resLinkClone = serializable_1.TaJsonDeserialize(resLinkJson, publication_link_1.Link);
                            resLinkClone.setHrefDecoded(xhtmlFilePath);
                            resLinkClone.TypeLink = "application/xhtml+xml";
                            publication.Spine.push(resLinkClone);
                            if (combinedMediaOverlays && publication.Spine.length === 1) {
                                resLinkClone.MediaOverlays = combinedMediaOverlays;
                                if (combinedMediaOverlays.duration) {
                                    resLinkClone.Duration = combinedMediaOverlays.duration;
                                }
                                moURL = "smil-media-overlays.json";
                                if (!resLinkClone.Properties) {
                                    resLinkClone.Properties = new metadata_properties_1.Properties();
                                }
                                resLinkClone.Properties.MediaOverlay = moURL;
                                if (!resLinkClone.Alternate) {
                                    resLinkClone.Alternate = [];
                                }
                                moLink = new publication_link_1.Link();
                                moLink.Href = moURL;
                                moLink.TypeLink = "application/vnd.syncnarr+json";
                                moLink.Duration = resLinkClone.Duration;
                                resLinkClone.Alternate.push(moLink);
                                jsonObjMO = serializable_1.TaJsonSerialize(combinedMediaOverlays);
                                jsonStrMO = global.JSON.stringify(jsonObjMO, null, "  ");
                                zipfile.addBuffer(Buffer.from(jsonStrMO), moURL);
                            }
                            return [3, 14];
                        case 12:
                            if (!(!resLink.HrefDecoded.endsWith(".opf") &&
                                !resLink.HrefDecoded.endsWith(".res") &&
                                !resLink.HrefDecoded.endsWith(".ncx"))) return [3, 14];
                            return [4, epub_daisy_common_1.loadFileBufferFromZipPath(resLink.Href, resLink.HrefDecoded, zip)];
                        case 13:
                            buff = _s.sent();
                            if (buff) {
                                zipfile.addBuffer(buff, resLink.HrefDecoded);
                            }
                            resourcesToKeep.push(resLink);
                            _s.label = 14;
                        case 14:
                            _d++;
                            return [3, 8];
                        case 15:
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
                            if (!publication.PageList) return [3, 19];
                            _l = 0, _m = publication.PageList;
                            _s.label = 16;
                        case 16:
                            if (!(_l < _m.length)) return [3, 19];
                            link = _m[_l];
                            return [4, processLink_1(link)];
                        case 17:
                            _s.sent();
                            _s.label = 18;
                        case 18:
                            _l++;
                            return [3, 16];
                        case 19:
                            if (!publication.Landmarks) return [3, 23];
                            _o = 0, _p = publication.Landmarks;
                            _s.label = 20;
                        case 20:
                            if (!(_o < _p.length)) return [3, 23];
                            link = _p[_o];
                            return [4, processLink_1(link)];
                        case 21:
                            _s.sent();
                            _s.label = 22;
                        case 22:
                            _o++;
                            return [3, 20];
                        case 23:
                            if (!publication.TOC) return [3, 25];
                            return [4, processLinks_1(publication.TOC)];
                        case 24:
                            _s.sent();
                            _s.label = 25;
                        case 25:
                            jsonObj = serializable_1.TaJsonSerialize(publication);
                            jsonStr = global.JSON.stringify(jsonObj, null, "  ");
                            zipfile.addBuffer(Buffer.from(jsonStr), "manifest.json");
                            return [3, 28];
                        case 26:
                            erreur_1 = _s.sent();
                            debug(erreur_1);
                            return [3, 28];
                        case 27:
                            timeoutId = setTimeout(function () {
                                timeoutId = undefined;
                                reject("YAZL zip took too long!? " + outputZipPath);
                            }, 10000);
                            zipfile.end();
                            return [7];
                        case 28: return [2];
                    }
                });
            }); })];
    });
}); };
//# sourceMappingURL=daisy-convert-to-epub.js.map