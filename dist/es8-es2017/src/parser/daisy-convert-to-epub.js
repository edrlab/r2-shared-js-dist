"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDaisyToReadiumWebPub = void 0;
const debug_ = require("debug");
const fs = require("fs");
const mime = require("mime-types");
const path = require("path");
const xmldom = require("@xmldom/xmldom");
const xpath = require("xpath");
const yazl_1 = require("yazl");
const media_overlay_1 = require("../models/media-overlay");
const metadata_1 = require("../models/metadata");
const metadata_properties_1 = require("../models/metadata-properties");
const publication_1 = require("../models/publication");
const publication_link_1 = require("../models/publication-link");
const serializable_1 = require("r2-lcp-js/dist/es8-es2017/src/serializable");
const bom_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/bom");
const epub_daisy_common_1 = require("./epub-daisy-common");
const debug = debug_("r2:shared#parser/daisy-convert-to-epub");
function ensureDirs(fspath) {
    const dirname = path.dirname(fspath);
    if (!fs.existsSync(dirname)) {
        ensureDirs(dirname);
        fs.mkdirSync(dirname);
    }
}
const convertDaisyToReadiumWebPub = async (outputDirPath, publication, generateDaisyAudioManifestOnly, forceAudioOnly) => {
    return new Promise(async (resolve, reject) => {
        var _a, _b, _c, _d, _e;
        const isFullTextAudio = !forceAudioOnly && ((_a = publication.Metadata) === null || _a === void 0 ? void 0 : _a.AdditionalJSON) &&
            (publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioFullText" ||
                publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "audioFullText" || (!publication.Metadata.AdditionalJSON["dtb:multimediaType"] &&
                !publication.Metadata.AdditionalJSON["ncc:multimediaType"]));
        const isAudioOnly = forceAudioOnly || ((_b = publication.Metadata) === null || _b === void 0 ? void 0 : _b.AdditionalJSON) &&
            (publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioNCX" ||
                publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "audioNcc");
        const isTextOnly = !forceAudioOnly && ((_c = publication.Metadata) === null || _c === void 0 ? void 0 : _c.AdditionalJSON) &&
            (publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "textNCX" ||
                publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "textNcc");
        if (generateDaisyAudioManifestOnly) {
            if (isTextOnly) {
                debug("generateDaisyAudioManifestOnly FATAL! text-only publication?? ", publication.Metadata.AdditionalJSON["dtb:multimediaType"], publication.Metadata.AdditionalJSON["ncc:multimediaType"]);
                return reject("generateDaisyAudioManifestOnly cannot process text-only publication");
            }
            if (!isAudioOnly || isFullTextAudio) {
                debug("generateDaisyAudioManifestOnly WARNING! not audio-only publication?? ", publication.Metadata.AdditionalJSON["dtb:multimediaType"], publication.Metadata.AdditionalJSON["ncc:multimediaType"]);
            }
        }
        const zipInternal = publication.findFromInternal("zip");
        if (!zipInternal) {
            debug("No publication zip!?");
            return reject("No publication zip!?");
        }
        const zip = zipInternal.Value;
        const nccZipEntry = (await zip.getEntries()).find((entry) => {
            return /ncc\.html$/i.test(entry);
        });
        const outputZipPath = path.join(outputDirPath, `${isAudioOnly ? "daisy_audioNCX" : (isTextOnly ? "daisy_textNCX" : "daisy_audioFullText")}-to-epub.webpub`);
        if (!generateDaisyAudioManifestOnly) {
            ensureDirs(outputZipPath);
        }
        let timeoutId;
        const zipfile = generateDaisyAudioManifestOnly ? undefined : new yazl_1.ZipFile();
        try {
            if (!generateDaisyAudioManifestOnly) {
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
            }
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
            let mediaOverlaysMap;
            const getMediaOverlaysDuration = (mo) => {
                let duration = 0;
                if (typeof mo.AudioClipBegin !== "undefined" &&
                    typeof mo.AudioClipEnd !== "undefined") {
                    duration = mo.AudioClipEnd - mo.AudioClipBegin;
                }
                else if (mo.Children) {
                    for (const child of mo.Children) {
                        duration += getMediaOverlaysDuration(child);
                    }
                }
                return duration;
            };
            const patchMediaOverlaysTextHref = (mo, audioOnlySmilHtmlHref) => {
                let smilTextRef;
                if (audioOnlySmilHtmlHref) {
                    smilTextRef = audioOnlySmilHtmlHref;
                    mo.Text = `${smilTextRef}#${mo.ParID || mo.TextID || "_yyy_"}`;
                }
                else if (mo.Text) {
                    mo.Text = mo.Text.replace(/((\.xml)|(\.html))(#.*)?$/i, ".xhtml$4");
                    smilTextRef = mo.Text;
                    const k = smilTextRef.indexOf("#");
                    if (k > 0) {
                        smilTextRef = smilTextRef.substr(0, k);
                    }
                }
                if (mo.Children) {
                    for (const child of mo.Children) {
                        const smilTextRef_ = patchMediaOverlaysTextHref(child, audioOnlySmilHtmlHref);
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
            const smilDocs = {};
            const loadOrGetCachedSmil = async (smilPathInZip) => {
                let smilDoc = smilDocs[smilPathInZip];
                if (!smilDoc) {
                    let smilStr = undefined;
                    try {
                        smilStr = await (0, epub_daisy_common_1.loadFileStrFromZipPath)(smilPathInZip, smilPathInZip, zip);
                    }
                    catch (zipErr) {
                        debug(zipErr);
                    }
                    if (!smilStr) {
                        debug("!loadFileStrFromZipPath 1", smilPathInZip);
                        return Promise.reject("!loadFileStrFromZipPath 1 " + smilPathInZip);
                    }
                    smilDoc = new xmldom.DOMParser().parseFromString((0, bom_1.removeUTF8BOM)(smilStr), "application/xml");
                    if (nccZipEntry) {
                        (0, epub_daisy_common_1.flattenDaisy2SmilAudioSeq)(smilPathInZip, smilDoc);
                    }
                    smilDocs[smilPathInZip] = smilDoc;
                }
                return Promise.resolve(smilDoc);
            };
            const findLinkInToc = (links, hrefDecoded) => {
                for (const link of links) {
                    if (link.HrefDecoded === hrefDecoded) {
                        return link;
                    }
                    else if (link.Children) {
                        const foundLink = findLinkInToc(link.Children, hrefDecoded);
                        if (foundLink) {
                            return foundLink;
                        }
                    }
                }
                return undefined;
            };
            const createHtmlFromSmilFile = async (smilPathInZip) => {
                if (generateDaisyAudioManifestOnly) {
                    return undefined;
                }
                let smilDoc = undefined;
                try {
                    smilDoc = await loadOrGetCachedSmil(smilPathInZip);
                }
                catch (zipErr) {
                    debug(zipErr);
                }
                if (!smilDoc) {
                    return undefined;
                }
                const smilDocClone = smilDoc.cloneNode(true);
                let txtCounter = 0;
                const parEls = Array.from(smilDocClone.getElementsByTagName("par"));
                for (const parEl of parEls) {
                    const audioElements = Array.from(parEl.getElementsByTagName("audio")).filter((el) => el);
                    for (const audioElement of audioElements) {
                        if (audioElement.parentNode) {
                            audioElement.parentNode.removeChild(audioElement);
                        }
                    }
                    let textId;
                    const textElements = Array.from(parEl.getElementsByTagName("text")).filter((el) => el);
                    for (const textElement of textElements) {
                        const src = textElement.getAttribute("src");
                        if (src) {
                            textElement.setAttribute("data-src", src.replace(/((\.xml)|(\.html))(#.*)?$/i, ".xhtml$4"));
                            textElement.removeAttribute("src");
                        }
                        if (!textId) {
                            textId = textElement.getAttribute("id");
                        }
                    }
                    const elmId = parEl.getAttribute("id");
                    const hrefDecoded = `${smilPathInZip}#${elmId}`;
                    let tocLinkItem = publication.TOC ? findLinkInToc(publication.TOC, hrefDecoded) : undefined;
                    if (!tocLinkItem && textId) {
                        const hrefDecoded_ = `${smilPathInZip}#${textId}`;
                        tocLinkItem = publication.TOC ? findLinkInToc(publication.TOC, hrefDecoded_) : undefined;
                    }
                    const text = tocLinkItem ? tocLinkItem.Title : undefined;
                    if (text) {
                        txtCounter = 0;
                    }
                    const textNode = smilDocClone.createTextNode(text ? text : `... [${++txtCounter}]`);
                    parEl.appendChild(textNode);
                }
                const bodyContent = smilDocClone.getElementsByTagName("body")[0];
                const bodyContentStr = new xmldom.XMLSerializer().serializeToString(bodyContent);
                const contentStr = bodyContentStr
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
                const htmlDoc = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">
    <head>
        <title>${smilPathInZip}</title>
    </head>
    ${contentStr}
</html>
`;
                const htmlFilePath = smilPathInZip.replace(/\.smil$/i, ".xhtml");
                zipfile.addBuffer(Buffer.from(htmlDoc), htmlFilePath);
                return htmlFilePath;
            };
            const audioOnlySmilHtmls = [];
            if (publication.Spine) {
                mediaOverlaysMap = {};
                let previousLinkItem;
                let spineIndex = -1;
                for (const linkItem of publication.Spine) {
                    spineIndex++;
                    if (!linkItem.MediaOverlays) {
                        continue;
                    }
                    if (!linkItem.MediaOverlays.initialized) {
                        await (0, epub_daisy_common_1.lazyLoadMediaOverlays)(publication, linkItem.MediaOverlays);
                        if (isFullTextAudio || isAudioOnly) {
                            (0, epub_daisy_common_1.updateDurations)(linkItem.MediaOverlays.duration, linkItem);
                        }
                    }
                    if (isFullTextAudio || isAudioOnly) {
                        const computedDur = getMediaOverlaysDuration(linkItem.MediaOverlays);
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
                            const dur = linkItem.MediaOverlays.totalElapsedTime -
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
                    let smilTextRef;
                    const isAudioOnly_ = isAudioOnly || (isFullTextAudio && generateDaisyAudioManifestOnly);
                    if (isAudioOnly_) {
                        const audioOnlySmilHtmlHref = (_d = linkItem.MediaOverlays.SmilPathInZip) === null || _d === void 0 ? void 0 : _d.replace(/\.smil$/i, ".xhtml");
                        if (audioOnlySmilHtmlHref) {
                            smilTextRef = patchMediaOverlaysTextHref(linkItem.MediaOverlays, audioOnlySmilHtmlHref);
                        }
                    }
                    else {
                        smilTextRef = patchMediaOverlaysTextHref(linkItem.MediaOverlays, undefined);
                    }
                    if (smilTextRef) {
                        if (isAudioOnly_ && linkItem.MediaOverlays.SmilPathInZip) {
                            await createHtmlFromSmilFile(linkItem.MediaOverlays.SmilPathInZip);
                            const smilHtml = new publication_link_1.Link();
                            smilHtml.Href = smilTextRef;
                            smilHtml.TypeLink = "application/xhtml+xml";
                            audioOnlySmilHtmls.push(smilHtml);
                        }
                        if (!mediaOverlaysMap[smilTextRef]) {
                            mediaOverlaysMap[smilTextRef] = {
                                index: spineIndex,
                                mos: [],
                            };
                        }
                        mediaOverlaysMap[smilTextRef].index = spineIndex;
                        mediaOverlaysMap[smilTextRef].mos.push(linkItem.MediaOverlays);
                    }
                }
            }
            publication.Spine = [];
            const resourcesToKeep = [];
            const dtBooks = [...audioOnlySmilHtmls];
            for (const resLink of publication.Resources) {
                if (!resLink.HrefDecoded) {
                    continue;
                }
                if (resLink.TypeLink === "text/css" || /\.css$/i.test(resLink.HrefDecoded)) {
                    if (generateDaisyAudioManifestOnly) {
                        debug("generateDaisyAudioManifestOnly => skip resource: ", resLink.HrefDecoded);
                        continue;
                    }
                    let cssText = undefined;
                    try {
                        cssText = await (0, epub_daisy_common_1.loadFileStrFromZipPath)(resLink.Href, resLink.HrefDecoded, zip);
                    }
                    catch (zipErr) {
                        debug(zipErr);
                    }
                    if (!cssText) {
                        debug("!loadFileStrFromZipPath 2", resLink.HrefDecoded);
                        continue;
                    }
                    cssText = cssText.replace(/\/\*([\s\S]+?)\*\//gm, (_match, p1, _offset, _string) => {
                        const base64 = Buffer.from(p1).toString("base64");
                        return `/*__${base64}__*/`;
                    });
                    for (const elementName of elementNames) {
                        const regex = new RegExp(`([^#\.a-zA-Z0-9\-_])(${elementName})([^a-zA-Z0-9\-_;])`, "g");
                        cssText = cssText.replace(regex, "$1.$2_R2$3");
                        cssText = cssText.replace(regex, "$1.$2_R2$3");
                    }
                    cssText = cssText.replace(/\/\*__([\s\S]+?)__\*\//g, (_match, p1, _offset, _string) => {
                        const comment = Buffer.from(p1, "base64").toString("utf8");
                        return `/*${comment}*/`;
                    });
                    zipfile.addBuffer(Buffer.from(cssText), resLink.HrefDecoded);
                    resourcesToKeep.push(resLink);
                }
                else if (resLink.TypeLink === "application/x-dtbook+xml" || /\.xml$/i.test(resLink.HrefDecoded)) {
                    if (isAudioOnly || generateDaisyAudioManifestOnly) {
                        debug("generateDaisyAudioManifestOnly or isAudioOnly => skip resource: ", resLink.HrefDecoded);
                        continue;
                    }
                    let dtBookStr = undefined;
                    try {
                        dtBookStr = await (0, epub_daisy_common_1.loadFileStrFromZipPath)(resLink.Href, resLink.HrefDecoded, zip);
                    }
                    catch (zipErr) {
                        debug(zipErr);
                    }
                    if (!dtBookStr) {
                        debug("!loadFileStrFromZipPath 3", dtBookStr);
                        continue;
                    }
                    dtBookStr = (0, bom_1.removeUTF8BOM)(dtBookStr);
                    dtBookStr = dtBookStr.replace(/xmlns=""/, " ");
                    dtBookStr = dtBookStr.replace(/<dtbook/, "<dtbook xmlns:epub=\"http://www.idpf.org/2007/ops\" ");
                    const dtBookDoc = new xmldom.DOMParser().parseFromString(dtBookStr, "application/xml");
                    let title = (_e = dtBookDoc.getElementsByTagName("doctitle")[0]) === null || _e === void 0 ? void 0 : _e.textContent;
                    if (title) {
                        title = title.trim();
                        if (!title.length) {
                            title = null;
                        }
                    }
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
                    for (const stylesheet of stylesheets) {
                        if (typeof stylesheet.remove === "function") {
                            stylesheet.remove();
                        }
                        else if (stylesheet.parentNode) {
                            stylesheet.parentNode.removeChild(stylesheet);
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
                        .replace(/xmlns="http:\/\/www\.daisy\.org\/z3986\/2005\/dtbook\/"/g, " ")
                        .replace(/^([\s\S]*)<html/m, `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html `)
                        .replace(/<head([\s\S]*?)>/m, `
<head$1>
<meta charset="UTF-8" />
${title ? `<title>${title}</title>` : ""}
`)
                        .replace(/<\/head[\s\S]*?>/m, `
${cssHrefs.reduce((pv, cv) => {
                        return pv + "\n" + `<link rel="stylesheet" type="text/css" href="${cv}" />`;
                    }, "")}
</head>
`);
                    const xhtmlFilePath = resLink.HrefDecoded.replace(/\.([^\.]+)$/i, ".xhtml");
                    zipfile.addBuffer(Buffer.from(dtbookNowXHTML), xhtmlFilePath);
                    const resLinkJson = (0, serializable_1.TaJsonSerialize)(resLink);
                    const resLinkClone = (0, serializable_1.TaJsonDeserialize)(resLinkJson, publication_link_1.Link);
                    resLinkClone.setHrefDecoded(xhtmlFilePath);
                    resLinkClone.TypeLink = "application/xhtml+xml";
                    dtBooks.push(resLinkClone);
                }
                else if (!/\.opf$/i.test(resLink.HrefDecoded) &&
                    !/\.res$/i.test(resLink.HrefDecoded) &&
                    !/\.ncx$/i.test(resLink.HrefDecoded) &&
                    !/ncc\.html$/i.test(resLink.HrefDecoded)) {
                    const buff = generateDaisyAudioManifestOnly ? undefined : await (0, epub_daisy_common_1.loadFileBufferFromZipPath)(resLink.Href, resLink.HrefDecoded, zip);
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
                }
            }
            if (mediaOverlaysMap) {
                Object.keys(mediaOverlaysMap).forEach((smilTextRef) => {
                    if (!mediaOverlaysMap) {
                        return;
                    }
                    debug("smilTextRef: " + smilTextRef);
                    const mos = mediaOverlaysMap[smilTextRef].mos;
                    if (mos.length === 1) {
                        debug("smilTextRef [1]: " + smilTextRef);
                        return;
                    }
                    const mergedMediaOverlays = new media_overlay_1.MediaOverlayNode();
                    mergedMediaOverlays.SmilPathInZip = undefined;
                    mergedMediaOverlays.initialized = true;
                    mergedMediaOverlays.Role = [];
                    mergedMediaOverlays.Role.push("section");
                    mergedMediaOverlays.duration = 0;
                    let i = -1;
                    for (const mo of mos) {
                        i++;
                        if (mo.Children) {
                            debug(`smilTextRef [${i}]: ` + smilTextRef);
                            if (!mergedMediaOverlays.Children) {
                                mergedMediaOverlays.Children = [];
                            }
                            mergedMediaOverlays.Children = mergedMediaOverlays.Children.concat(mo.Children);
                            if (mo.duration) {
                                mergedMediaOverlays.duration += mo.duration;
                            }
                        }
                    }
                    mediaOverlaysMap[smilTextRef].mos = [mergedMediaOverlays];
                });
                const mediaOverlaysSequence = Object.keys(mediaOverlaysMap).map((smilTextRef) => {
                    if (!mediaOverlaysMap) {
                        return undefined;
                    }
                    return {
                        index: mediaOverlaysMap[smilTextRef].index,
                        mo: mediaOverlaysMap[smilTextRef].mos[0],
                        smilTextRef,
                    };
                }).filter((e) => e).sort((a, b) => {
                    if (a && b && a.index < b.index) {
                        return -1;
                    }
                    if (a && b && a.index > b.index) {
                        return 1;
                    }
                    return 0;
                });
                for (const mediaOverlay of mediaOverlaysSequence) {
                    if (!mediaOverlay) {
                        continue;
                    }
                    debug("mediaOverlay:", mediaOverlay.index, mediaOverlay.smilTextRef);
                    const dtBookLink = dtBooks.find((l) => {
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
                            const moURL = `smil-media-overlays_${mediaOverlay.index}.json`;
                            if (!dtBookLink.Properties) {
                                dtBookLink.Properties = new metadata_properties_1.Properties();
                            }
                            dtBookLink.Properties.MediaOverlay = moURL;
                            if (!dtBookLink.Alternate) {
                                dtBookLink.Alternate = [];
                            }
                            const moLink = new publication_link_1.Link();
                            moLink.Href = moURL;
                            moLink.TypeLink = "application/vnd.syncnarr+json";
                            moLink.Duration = dtBookLink.Duration;
                            dtBookLink.Alternate.push(moLink);
                            if (!generateDaisyAudioManifestOnly) {
                                const jsonObjMO = (0, serializable_1.TaJsonSerialize)(mediaOverlay.mo);
                                const jsonStrMO = global.JSON.stringify(jsonObjMO, null, "  ");
                                zipfile.addBuffer(Buffer.from(jsonStrMO), moURL);
                            }
                            debug("dtBookLink IN SPINE:", mediaOverlay.index, dtBookLink.HrefDecoded, dtBookLink.Duration, moURL);
                        }
                        else {
                            debug("dtBookLink IN SPINE (no audio):", mediaOverlay.index, dtBookLink.HrefDecoded);
                        }
                        publication.Spine.push(dtBookLink);
                    }
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
            const findFirstDescendantTextOrAudio = (parent, audio) => {
                if (parent.childNodes && parent.childNodes.length) {
                    for (let i = 0; i < parent.childNodes.length; i++) {
                        const child = parent.childNodes[i];
                        if (child.nodeType === 1) {
                            const element = child;
                            if (element.localName &&
                                element.localName.toLowerCase() === (audio ? "audio" : "text")) {
                                return element;
                            }
                        }
                    }
                    for (let i = 0; i < parent.childNodes.length; i++) {
                        const child = parent.childNodes[i];
                        if (child.nodeType === 1) {
                            const element = child;
                            const found = findFirstDescendantTextOrAudio(element, audio);
                            if (found) {
                                return found;
                            }
                        }
                    }
                }
                return undefined;
            };
            const processLink = async (link) => {
                let href = link.HrefDecoded;
                if (!href) {
                    return;
                }
                const isAudioOnly_ = isAudioOnly || (isFullTextAudio && generateDaisyAudioManifestOnly);
                if (isAudioOnly_) {
                    link.setHrefDecoded(href.replace(/\.smil(#.*)?$/i, ".xhtml$1"));
                    link.TypeLink = "application/xhtml+xml";
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
                let smilDoc = undefined;
                try {
                    smilDoc = await loadOrGetCachedSmil(href);
                }
                catch (zipErr) {
                    debug(zipErr);
                }
                if (!smilDoc) {
                    return;
                }
                let targetEl = fragment ? smilDoc.getElementById(fragment) : undefined;
                if (!targetEl) {
                    targetEl = findFirstDescendantTextOrAudio(smilDoc.documentElement, false);
                }
                if (!targetEl) {
                    debug("--??-- !targetEl1 ", href);
                    return;
                }
                if (targetEl.nodeName !== "text") {
                    targetEl = findFirstDescendantTextOrAudio(targetEl, false);
                }
                if (!targetEl || targetEl.nodeName !== "text") {
                    debug("--??-- !targetEl2 ", href);
                    return;
                }
                const src = targetEl.getAttribute("src");
                if (!src) {
                    return;
                }
                link.Href = path.join(href, "..", src.replace(/((\.xml)|(\.html))(#.*)?$/i, ".xhtml$4")).replace(/\\/g, "/");
                link.TypeLink = "application/xhtml+xml";
            };
            const processLinks = async (links) => {
                for (const link of links) {
                    await processLink(link);
                    if (link.Children) {
                        await processLinks(link.Children);
                    }
                }
            };
            if (publication.PageList) {
                for (const link of publication.PageList) {
                    await processLink(link);
                }
            }
            if (publication.Landmarks) {
                for (const link of publication.Landmarks) {
                    await processLink(link);
                }
            }
            if (publication.TOC) {
                await processLinks(publication.TOC);
            }
            if (!generateDaisyAudioManifestOnly) {
                const jsonObj = (0, serializable_1.TaJsonSerialize)(publication);
                const jsonStr = global.JSON.stringify(jsonObj, null, "  ");
                zipfile.addBuffer(Buffer.from(jsonStr), "manifest.json");
            }
            const isAudioOnly_ = isAudioOnly || (isFullTextAudio && generateDaisyAudioManifestOnly);
            if (isAudioOnly_) {
                debug("DAISY audio only book => manifest-audio.json" + (generateDaisyAudioManifestOnly ? " (generateDaisyAudioManifestOnly ***_manifest.json)" : ""));
                const transformPublicationToAudioBook = async (pubAudio) => {
                    var _a;
                    const pubJson = (0, serializable_1.TaJsonSerialize)(pubAudio);
                    const audioPublication = (0, serializable_1.TaJsonDeserialize)(pubJson, publication_1.Publication);
                    if (!audioPublication.Metadata) {
                        audioPublication.Metadata = new metadata_1.Metadata();
                    }
                    audioPublication.Metadata.RDFType = "http://schema.org/Audiobook";
                    const processLinkAudio = async (link) => {
                        let href = link.HrefDecoded;
                        if (!href) {
                            return link.Children ? null : false;
                        }
                        let fragment;
                        if (href.indexOf("#") >= 0) {
                            const arr = href.split("#");
                            href = arr[0].trim();
                            fragment = arr[1].trim();
                        }
                        if (!href) {
                            return link.Children ? null : false;
                        }
                        const smilHref = href.replace(/\.xhtml(#.*)?$/i, ".smil$1");
                        let smilDoc = undefined;
                        try {
                            smilDoc = await loadOrGetCachedSmil(smilHref);
                        }
                        catch (zipErr) {
                            debug(zipErr);
                        }
                        if (!smilDoc) {
                            return link.Children ? null : false;
                        }
                        let targetEl = fragment ? smilDoc.getElementById(fragment) : undefined;
                        if (!targetEl) {
                            targetEl = findFirstDescendantTextOrAudio(smilDoc.documentElement, true);
                        }
                        if (!targetEl) {
                            debug("==?? !targetEl1 ", href, new xmldom.XMLSerializer().serializeToString(smilDoc.documentElement));
                            return link.Children ? null : false;
                        }
                        const targetElOriginal = targetEl;
                        if (targetEl.nodeName !== "audio") {
                            targetEl = findFirstDescendantTextOrAudio((targetEl.nodeName === "text" && targetEl.parentNode) ?
                                targetEl.parentNode :
                                targetEl, true);
                        }
                        if (!targetEl || targetEl.nodeName !== "audio") {
                            debug("==?? !targetEl2 ", href, new xmldom.XMLSerializer().serializeToString(targetElOriginal));
                            return link.Children ? null : false;
                        }
                        const src = targetEl.getAttribute("src");
                        if (!src) {
                            debug("==?? !src");
                            return link.Children ? null : false;
                        }
                        const clipBegin = targetEl.getAttribute("clipBegin") || targetEl.getAttribute("clip-begin");
                        let timeStamp = "#t=";
                        const begin = clipBegin ? (0, media_overlay_1.timeStrToSeconds)(clipBegin) : 0;
                        timeStamp += begin.toString();
                        link.Href = path.join(smilHref, "..", src + timeStamp).replace(/\\/g, "/");
                        link.TypeLink = "audio/?";
                        const mediaType = mime.lookup(src);
                        if (mediaType) {
                            link.TypeLink = mediaType;
                        }
                        return true;
                    };
                    const processLinksAudio = async (children) => {
                        for (let i = 0; i < children.length; i++) {
                            const link = children[i];
                            const keep = await processLinkAudio(link);
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
                            if ((keep || keep === null) && link.Children) {
                                await processLinksAudio(link.Children);
                                if (link.Children.length === 0) {
                                    delete link.Children;
                                    if (!link.Href) {
                                        children.splice(i, 1);
                                        i--;
                                    }
                                }
                            }
                        }
                    };
                    if (audioPublication.PageList) {
                        for (let i = 0; i < audioPublication.PageList.length; i++) {
                            const link = audioPublication.PageList[i];
                            const keep = await processLinkAudio(link);
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
                        }
                    }
                    if (audioPublication.Landmarks) {
                        for (let i = 0; i < audioPublication.Landmarks.length; i++) {
                            const link = audioPublication.Landmarks[i];
                            const keep = await processLinkAudio(link);
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
                        }
                    }
                    if (audioPublication.TOC) {
                        await processLinksAudio(audioPublication.TOC);
                    }
                    audioPublication.Spine = [];
                    if (pubAudio.Spine) {
                        for (const spineLink of pubAudio.Spine) {
                            if (!((_a = spineLink.MediaOverlays) === null || _a === void 0 ? void 0 : _a.SmilPathInZip)) {
                                debug("???- !spineLink.MediaOverlays?.SmilPathInZip");
                                continue;
                            }
                            let smilDoc = undefined;
                            try {
                                smilDoc = await loadOrGetCachedSmil(spineLink.MediaOverlays.SmilPathInZip);
                            }
                            catch (zipErr) {
                                debug(zipErr);
                            }
                            if (!smilDoc) {
                                continue;
                            }
                            const firstAudioElement = findFirstDescendantTextOrAudio(smilDoc.documentElement, true);
                            if (!firstAudioElement) {
                                debug("???- !firstAudioElement ", spineLink.MediaOverlays.SmilPathInZip);
                                continue;
                            }
                            const src = firstAudioElement.getAttribute("src");
                            if (!src) {
                                continue;
                            }
                            const link = new publication_link_1.Link();
                            link.Href = path.join(spineLink.MediaOverlays.SmilPathInZip, "..", src).replace(/\\/g, "/");
                            link.TypeLink = "audio/?";
                            if (audioPublication.Resources) {
                                const resAudioIndex = audioPublication.Resources.findIndex((l) => {
                                    return l.Href === path.join(spineLink.MediaOverlays.SmilPathInZip, "..", src).replace(/\\/g, "/");
                                });
                                if (resAudioIndex >= 0) {
                                    const resAudio = audioPublication.Resources[resAudioIndex];
                                    if (resAudio.TypeLink) {
                                        link.TypeLink = resAudio.TypeLink;
                                    }
                                    audioPublication.Resources.splice(resAudioIndex, 1);
                                }
                                else {
                                    const resAudio = audioPublication.Spine.find((l) => {
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
                        }
                    }
                    return audioPublication;
                };
                try {
                    const audioPublication = await transformPublicationToAudioBook(publication);
                    const jsonObjAudio = (0, serializable_1.TaJsonSerialize)(audioPublication);
                    const jsonStrAudio = global.JSON.stringify(jsonObjAudio, null, "  ");
                    if (!generateDaisyAudioManifestOnly) {
                        zipfile.addBuffer(Buffer.from(jsonStrAudio), "manifest-audio.json");
                    }
                    else {
                        const outputManifestPath = path.join(outputDirPath, generateDaisyAudioManifestOnly + "_manifest.json");
                        ensureDirs(outputManifestPath);
                        fs.writeFileSync(outputManifestPath, jsonStrAudio, "utf8");
                        debug("generateDaisyAudioManifestOnly OK: " + outputManifestPath);
                        resolve(outputManifestPath);
                    }
                }
                catch (ero) {
                    debug(ero);
                }
            }
        }
        catch (erreur) {
            debug(erreur);
        }
        finally {
            debug("DAISY-EPUB-RWPM done.");
            if (!generateDaisyAudioManifestOnly) {
                timeoutId = setTimeout(() => {
                    timeoutId = undefined;
                    reject("YAZL zip took too long!? " + outputZipPath);
                }, 10000);
                zipfile.end();
            }
        }
    });
};
exports.convertDaisyToReadiumWebPub = convertDaisyToReadiumWebPub;
//# sourceMappingURL=daisy-convert-to-epub.js.map