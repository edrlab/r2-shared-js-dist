"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDaisyToReadiumWebPub = void 0;
const tslib_1 = require("tslib");
const debug_ = require("debug");
const fs = require("fs");
const path = require("path");
const xmldom = require("xmldom");
const xpath = require("xpath");
const yazl_1 = require("yazl");
const media_overlay_1 = require("../models/media-overlay");
const metadata_1 = require("../models/metadata");
const metadata_properties_1 = require("../models/metadata-properties");
const publication_link_1 = require("../models/publication-link");
const serializable_1 = require("r2-lcp-js/dist/es6-es2015/src/serializable");
const epub_1 = require("./epub");
const epub_daisy_common_1 = require("./epub-daisy-common");
const debug = debug_("r2:shared#parser/daisy-convert-to-epub");
function ensureDirs(fspath) {
    const dirname = path.dirname(fspath);
    if (!fs.existsSync(dirname)) {
        ensureDirs(dirname);
        fs.mkdirSync(dirname);
    }
}
exports.convertDaisyToReadiumWebPub = (outputDirPath, publication) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const zipInternal = publication.findFromInternal("zip");
        if (!zipInternal) {
            debug("No publication zip!?");
            return reject("No publication zip!?");
        }
        const zip = zipInternal.Value;
        const outputZipPath = path.join(outputDirPath, "daisy-to-epub.webpub");
        ensureDirs(outputZipPath);
        let timeoutId;
        const zipfile = new yazl_1.ZipFile();
        try {
            const writeStream = fs.createWriteStream(outputZipPath);
            zipfile.outputStream.pipe(writeStream)
                .on("close", () => {
                debug("ZIP close");
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = undefined;
                    resolve(outputZipPath);
                }
            })
                .on("error", (e) => {
                debug("ZIP error", e);
                reject(e);
            });
            const select = xpath.useNamespaces({
                dtbook: "http://www.daisy.org/z3986/2005/dtbook/",
            });
            const elementNames = [
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
            let combinedMediaOverlays;
            const patchMediaOverlaysTextHref = (mo) => {
                if (mo.Text) {
                    mo.Text = mo.Text.replace(/\.xml/, ".xhtml");
                }
                if (mo.Children) {
                    for (const child of mo.Children) {
                        patchMediaOverlaysTextHref(child);
                    }
                }
            };
            if (publication.Spine && ((_a = publication.Metadata) === null || _a === void 0 ? void 0 : _a.AdditionalJSON) &&
                publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioFullText") {
                combinedMediaOverlays = new media_overlay_1.MediaOverlayNode();
                combinedMediaOverlays.SmilPathInZip = undefined;
                combinedMediaOverlays.initialized = true;
                combinedMediaOverlays.Role = [];
                combinedMediaOverlays.Role.push("section");
                combinedMediaOverlays.duration = 0;
                for (const linkItem of publication.Spine) {
                    if (linkItem.MediaOverlays) {
                        if (!linkItem.MediaOverlays.initialized) {
                            yield epub_1.lazyLoadMediaOverlays(publication, linkItem.MediaOverlays);
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
                    }
                }
                patchMediaOverlaysTextHref(combinedMediaOverlays);
            }
            publication.Spine = [];
            const resourcesToKeep = [];
            for (const resLink of publication.Resources) {
                if (!resLink.HrefDecoded) {
                    continue;
                }
                if (resLink.TypeLink === "text/css" || resLink.HrefDecoded.endsWith(".css")) {
                    let cssText = yield epub_daisy_common_1.loadFileStrFromZipPath(resLink.Href, resLink.HrefDecoded, zip);
                    if (!cssText) {
                        debug("!loadFileStrFromZipPath", resLink.HrefDecoded);
                        continue;
                    }
                    cssText = cssText.replace(/\/\*([\s\S]+?)\*\//gm, (_match, p1, _offset, _string) => {
                        const base64 = Buffer.from(p1).toString("base64");
                        return `/*__${base64}__*/`;
                    });
                    for (const elementName of elementNames) {
                        const regex = new RegExp(`([^#\.a-zA-Z0-9\-_])(${elementName})([^a-zA-Z0-9\-_;])`, "g");
                        cssText = cssText.replace(regex, `$1.$2_R2$3`);
                        cssText = cssText.replace(regex, `$1.$2_R2$3`);
                    }
                    cssText = cssText.replace(/\/\*__([\s\S]+?)__\*\//g, (_match, p1, _offset, _string) => {
                        const comment = Buffer.from(p1, "base64").toString("utf8");
                        return `/*${comment}*/`;
                    });
                    zipfile.addBuffer(Buffer.from(cssText), resLink.HrefDecoded);
                    resourcesToKeep.push(resLink);
                }
                else if (resLink.TypeLink === "application/x-dtbook+xml" || resLink.HrefDecoded.endsWith(".xml")) {
                    const dtBookStr = yield epub_daisy_common_1.loadFileStrFromZipPath(resLink.Href, resLink.HrefDecoded, zip);
                    if (!dtBookStr) {
                        debug("!loadFileStrFromZipPath", dtBookStr);
                        continue;
                    }
                    const dtBookDoc = new xmldom.DOMParser().parseFromString(dtBookStr, "application/xml");
                    const title = (_b = dtBookDoc.getElementsByTagName("doctitle")[0]) === null || _b === void 0 ? void 0 : _b.textContent;
                    const listElements = dtBookDoc.getElementsByTagName("list");
                    for (let i = 0; i < listElements.length; i++) {
                        const listElement = listElements.item(i);
                        if (!listElement) {
                            continue;
                        }
                        const type = listElement.getAttribute("type");
                        if (type) {
                            listElement.tagName = type;
                        }
                    }
                    for (const elementName of elementNames) {
                        const els = Array.from(dtBookDoc.getElementsByTagName(elementName)).filter((el) => el);
                        for (const el of els) {
                            el.setAttribute("data-dtbook", elementName);
                            const cls = el.getAttribute("class");
                            el.setAttribute("class", `${cls ? (cls + " ") : ""}${elementName}_R2`);
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
                    const stylesheets = select("/processing-instruction('xml-stylesheet')", dtBookDoc);
                    const cssHrefs = [];
                    for (const stylesheet of stylesheets) {
                        if (!stylesheet.nodeValue) {
                            continue;
                        }
                        if (!stylesheet.nodeValue.includes("text/css")) {
                            continue;
                        }
                        const match = stylesheet.nodeValue.match(/href=("|')(.*?)("|')/);
                        if (!match) {
                            continue;
                        }
                        const href = match[2].trim();
                        if (href) {
                            cssHrefs.push(href);
                        }
                    }
                    const smilRefs = select("//*[@smilref]", dtBookDoc);
                    for (const smilRef of smilRefs) {
                        const ref = smilRef.getAttribute("smilref");
                        if (ref) {
                            smilRef.setAttribute("data-smilref", ref);
                        }
                        smilRef.removeAttribute("smilref");
                    }
                    const dtbookNowXHTML = new xmldom.XMLSerializer().serializeToString(dtBookDoc)
                        .replace(/xmlns="http:\/\/www\.daisy\.org\/z3986\/2005\/dtbook\/"/, "xmlns=\"http://www.w3.org/1999/xhtml\"")
                        .replace(/^([\s\S]*)<html/gm, `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE xhtml>
<html`)
                        .replace(/<head([\s\S]*?)>/gm, `
<head$1>
<meta charset="UTF-8" />
<title>${title ? title : " "}</title>
`)
                        .replace(/<\/head[\s\S]*?>/gm, `
${cssHrefs.reduce((pv, cv) => {
                        return pv + "\n" + `<link rel="stylesheet" type="text/css" href="${cv}" />`;
                    }, "")}
</head>
`);
                    const xhtmlFilePath = resLink.HrefDecoded.replace(/\.(.+)$/, ".xhtml");
                    zipfile.addBuffer(Buffer.from(dtbookNowXHTML), xhtmlFilePath);
                    const resLinkJson = serializable_1.TaJsonSerialize(resLink);
                    const resLinkClone = serializable_1.TaJsonDeserialize(resLinkJson, publication_link_1.Link);
                    resLinkClone.setHrefDecoded(xhtmlFilePath);
                    resLinkClone.TypeLink = "application/xhtml+xml";
                    publication.Spine.push(resLinkClone);
                    if (combinedMediaOverlays && publication.Spine.length === 1) {
                        resLinkClone.MediaOverlays = combinedMediaOverlays;
                        if (combinedMediaOverlays.duration) {
                            resLinkClone.Duration = combinedMediaOverlays.duration;
                        }
                        const moURL = "smil-media-overlays.json";
                        if (!resLinkClone.Properties) {
                            resLinkClone.Properties = new metadata_properties_1.Properties();
                        }
                        resLinkClone.Properties.MediaOverlay = moURL;
                        if (!resLinkClone.Alternate) {
                            resLinkClone.Alternate = [];
                        }
                        const moLink = new publication_link_1.Link();
                        moLink.Href = moURL;
                        moLink.TypeLink = "application/vnd.syncnarr+json";
                        moLink.Duration = resLinkClone.Duration;
                        resLinkClone.Alternate.push(moLink);
                        const jsonObjMO = serializable_1.TaJsonSerialize(combinedMediaOverlays);
                        const jsonStrMO = global.JSON.stringify(jsonObjMO, null, "  ");
                        zipfile.addBuffer(Buffer.from(jsonStrMO), moURL);
                    }
                }
                else if (!resLink.HrefDecoded.endsWith(".opf") &&
                    !resLink.HrefDecoded.endsWith(".res") &&
                    !resLink.HrefDecoded.endsWith(".ncx")) {
                    const buff = yield epub_daisy_common_1.loadFileBufferFromZipPath(resLink.Href, resLink.HrefDecoded, zip);
                    if (buff) {
                        zipfile.addBuffer(buff, resLink.HrefDecoded);
                    }
                    resourcesToKeep.push(resLink);
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
            const findFirstDescendantText = (parent) => {
                if (parent.childNodes && parent.childNodes.length) {
                    for (let i = 0; i < parent.childNodes.length; i++) {
                        const child = parent.childNodes[i];
                        if (child.nodeType === 1) {
                            const element = child;
                            if (element.localName && element.localName.toLowerCase() === "text") {
                                return element;
                            }
                        }
                    }
                    for (let i = 0; i < parent.childNodes.length; i++) {
                        const child = parent.childNodes[i];
                        if (child.nodeType === 1) {
                            const element = child;
                            const found = findFirstDescendantText(element);
                            if (found) {
                                return found;
                            }
                        }
                    }
                }
                return undefined;
            };
            const smilDocs = {};
            const processLink = (link) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                let href = link.HrefDecoded;
                if (!href) {
                    return;
                }
                let fragment;
                if (href.indexOf("#") >= 0) {
                    const arr = href.split("#");
                    href = arr[0].trim();
                    fragment = arr[1].trim();
                }
                if (!href) {
                    return;
                }
                let smilDoc = smilDocs[href];
                if (!smilDoc) {
                    const smilStr = yield epub_daisy_common_1.loadFileStrFromZipPath(href, href, zip);
                    if (!smilStr) {
                        debug("!loadFileStrFromZipPath", smilStr);
                        return;
                    }
                    smilDoc = new xmldom.DOMParser().parseFromString(smilStr, "application/xml");
                    smilDocs[href] = smilDoc;
                }
                let targetEl = fragment ? smilDoc.getElementById(fragment) : undefined;
                if (!targetEl) {
                    targetEl = findFirstDescendantText(smilDoc.documentElement);
                }
                if (!targetEl) {
                    return;
                }
                if (targetEl.nodeName !== "text") {
                    targetEl = findFirstDescendantText(targetEl);
                }
                if (!targetEl || targetEl.nodeName !== "text") {
                    return;
                }
                const src = targetEl.getAttribute("src");
                if (!src) {
                    return;
                }
                link.Href = src.replace(/\.xml/, ".xhtml");
            });
            const processLinks = (links) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
                for (const link of links) {
                    yield processLink(link);
                    if (link.Children) {
                        yield processLinks(link.Children);
                    }
                }
            });
            if (publication.PageList) {
                for (const link of publication.PageList) {
                    yield processLink(link);
                }
            }
            if (publication.Landmarks) {
                for (const link of publication.Landmarks) {
                    yield processLink(link);
                }
            }
            if (publication.TOC) {
                yield processLinks(publication.TOC);
            }
            const jsonObj = serializable_1.TaJsonSerialize(publication);
            const jsonStr = global.JSON.stringify(jsonObj, null, "  ");
            zipfile.addBuffer(Buffer.from(jsonStr), "manifest.json");
        }
        catch (erreur) {
            debug(erreur);
        }
        finally {
            timeoutId = setTimeout(() => {
                timeoutId = undefined;
                reject("YAZL zip took too long!? " + outputZipPath);
            }, 10000);
            zipfile.end();
        }
    }));
});
//# sourceMappingURL=daisy-convert-to-epub.js.map