"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNccToOpfAndNcx = void 0;
const tslib_1 = require("tslib");
const he = require("he");
const debug_ = require("debug");
const mime = require("mime-types");
const path = require("path");
const xmldom = require("@xmldom/xmldom");
const media_overlay_1 = require("../models/media-overlay");
const BufferUtils_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/stream/BufferUtils");
const bom_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/bom");
const zipHasEntry_1 = require("../_utils/zipHasEntry");
const epub_daisy_common_1 = require("./epub-daisy-common");
const debug = debug_("r2:shared#parser/daisy-convert-to-epub");
const decodeHtmlAttributeValue = (val) => {
    const decoded = he.decode(val, { isAttributeValue: true });
    return decoded;
};
const decodeHtmlTextContent = (textContent) => {
    const decoded = he.decode(textContent);
    return decoded;
};
const encodeXmlAttributeValue = (val) => {
    return val.replace(/"/g, "&quot;");
};
const encodeXmlTextContent = (textContent) => {
    return textContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
const getMediaTypeFromFileExtension = (ext) => {
    if (/\.smil$/i.test(ext)) {
        return "application/smil+xml";
    }
    if (/\.css$/i.test(ext)) {
        return "text/css";
    }
    if (/\.mp3$/i.test(ext)) {
        return "audio/mpeg";
    }
    if (/\.wav$/i.test(ext)) {
        return "audio/wav";
    }
    if (/\.jpe?g$/i.test(ext)) {
        return "image/jpeg";
    }
    if (/\.png$/i.test(ext)) {
        return "image/png";
    }
    if (/\.xml$/i.test(ext)) {
        return "application/x-dtbook+xml";
    }
    if (/\.html$/i.test(ext)) {
        return "text/html";
    }
    if (/\.xhtml$/i.test(ext)) {
        return "application/xhtml+xml";
    }
    return mime.lookup("dummy" + ext);
};
const convertNccToOpfAndNcx = (zip, rootfilePathDecoded, rootfilePath) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const has = yield (0, zipHasEntry_1.zipHasEntry)(zip, rootfilePathDecoded, rootfilePath);
    if (!has) {
        const err = `NOT IN ZIP (NCC.html): ${rootfilePath} --- ${rootfilePathDecoded}`;
        debug(err);
        const zipEntries = yield zip.getEntries();
        for (const zipEntry of zipEntries) {
            if (zipEntry.startsWith("__MACOSX/")) {
                continue;
            }
            debug(zipEntry);
        }
        return Promise.reject(err);
    }
    let nccZipStream_;
    try {
        nccZipStream_ = yield zip.entryStreamPromise(rootfilePathDecoded);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    const nccZipStream = nccZipStream_.stream;
    let nccZipData;
    try {
        nccZipData = yield (0, BufferUtils_1.streamToBufferPromise)(nccZipStream);
    }
    catch (err) {
        debug(err);
        return Promise.reject(err);
    }
    let nccStr = (0, bom_1.removeUTF8BOM)(nccZipData.toString("utf8"));
    let nccDoc;
    try {
        nccDoc = new xmldom.DOMParser().parseFromString(nccStr, "text/html");
    }
    catch (err1) {
        console.log("xmldom.DOMParser().parseFromString text/html ERROR1, attempting DOCTYPE fix...");
        console.log(err1);
        nccStr = nccStr.replace(/(<!DOCTYPE\s+[^>]+\s*)\[\s*\]\s*>/, "$1>");
        try {
            nccDoc = new xmldom.DOMParser().parseFromString(nccStr, "text/html");
        }
        catch (err2) {
            console.log("xmldom.DOMParser().parseFromString text/html ERROR2, fallback to application/xml...");
            console.log(err2);
            nccDoc = new xmldom.DOMParser().parseFromString(nccStr, "application/xml");
        }
    }
    const metas = Array.from(nccDoc.getElementsByTagName("meta")).
        reduce((prevVal, curVal) => {
        const name = curVal.getAttribute("name");
        const content = curVal.getAttribute("content");
        if (name && content) {
            prevVal[name] = decodeHtmlAttributeValue(content.trim());
        }
        return prevVal;
    }, {});
    const aElems = Array.from(nccDoc.getElementsByTagName("a"));
    let multimediaContent = "";
    let multimediaType = "";
    if (metas["ncc:multimediaType"] === "audioFullText" ||
        metas["ncc:multimediaType"] === "audioNcc" ||
        metas["ncc:totalTime"] && (0, media_overlay_1.timeStrToSeconds)(metas["ncc:totalTime"]) > 0) {
        if (metas["ncc:multimediaType"] === "audioFullText" || !metas["ncc:multimediaType"]) {
            multimediaContent = "audio,text,image";
            multimediaType = "audioFullText";
        }
        else {
            multimediaContent = "audio,image";
            multimediaType = "audioNCX";
        }
    }
    else if (metas["ncc:multimediaType"] === "textNcc" ||
        metas["ncc:totalTime"] && (0, media_overlay_1.timeStrToSeconds)(metas["ncc:totalTime"]) === 0) {
        multimediaContent = "text,image";
        multimediaType = "textNCX";
    }
    const zipEntriez = (yield zip.getEntries()).filter((e) => {
        return e && !e.endsWith("/");
    });
    const manifestItemsBaseStr = zipEntriez.reduce((pv, cv, ci) => {
        const ext = path.extname(cv);
        return `${pv}${!cv.startsWith("__MACOSX/") && !/ncc\.html$/i.test(cv) && !/\.ent$/i.test(ext) && !/\.dtd$/i.test(ext) && !/\.smil$/i.test(ext) ? `
        <item
            href="${encodeXmlAttributeValue(path.relative("file:///" + path.dirname(rootfilePathDecoded), "file:///" + cv).replace(/\\/g, "/"))}"
            id="opf-zip-${ci}"
            media-type="${getMediaTypeFromFileExtension(ext)}" />` : ""}`;
    }, "");
    const arrSmils = [];
    const manifestItemsStr = aElems.reduce((pv, cv, _ci) => {
        const href = cv.getAttribute("href");
        if (!href) {
            return pv;
        }
        if (!/\.smil(#.*)?$/i.test(href)) {
            return pv;
        }
        const smil = href.replace(/(.+\.smil)(#.*)?$/i, "$1");
        if (arrSmils.indexOf(smil) >= 0) {
            return pv;
        }
        arrSmils.push(smil);
        return `${pv}${`
            <item
                href="${encodeXmlAttributeValue(smil)}"
                id="opf-ncc-${arrSmils.length - 1}"
                media-type="application/smil+xml" />`}`;
    }, manifestItemsBaseStr);
    const spineItemsStr = arrSmils.reduce((pv, _cv, ci) => {
        return `${pv}${`
            <itemref idref="opf-ncc-${ci}" />`}`;
    }, "");
    let playOrder = 0;
    let pCount = 0;
    const pageListStr = aElems.reduce((pv, cv, _ci) => {
        const href = cv.getAttribute("href");
        if (!href) {
            return pv;
        }
        if (!/\.smil(#.*)?$/i.test(href)) {
            return pv;
        }
        if (!cv.parentNode) {
            return pv;
        }
        playOrder++;
        const clazz = cv.parentNode.getAttribute("class");
        if (!clazz || !clazz.startsWith("page")) {
            return pv;
        }
        const txtContent = cv.textContent ? decodeHtmlTextContent(cv.textContent.trim()) : "";
        pCount++;
        return `${pv}${`
<pageTarget class="pagenum" id="ncx-p${pCount}" playOrder="${playOrder}" type="normal" value="${pCount}">
<navLabel>
<text>${txtContent ? encodeXmlTextContent(txtContent) : pCount}</text>
</navLabel>
<content src="${encodeXmlAttributeValue(href)}"/>
</pageTarget>
`}`;
    }, "");
    playOrder = 0;
    pCount = 0;
    const navMapStr = aElems.reduce((pv, cv, _ci) => {
        const href = cv.getAttribute("href");
        if (!href) {
            return pv;
        }
        if (!/\.smil(#.*)?$/i.test(href)) {
            return pv;
        }
        if (!cv.parentNode) {
            return pv;
        }
        playOrder++;
        const name = cv.parentNode.localName;
        if (!name || !name.startsWith("h")) {
            return pv;
        }
        const level = parseInt(name.substr(1), 10);
        const txtContent = cv.textContent ? decodeHtmlTextContent(cv.textContent.trim()) : "";
        pCount++;
        const inner = `<!-- h${level - 1}_${pCount - 1} -->`;
        if (pv.indexOf(inner) >= 0) {
            return pv.replace(inner, `
<navPoint class="${name}" id="ncx-t${pCount}" playOrder="${playOrder}">
<navLabel>
<text>${txtContent ? encodeXmlTextContent(txtContent) : `_${pCount}`}</text>
</navLabel>
<content src="${encodeXmlAttributeValue(href)}"/>
<!-- ${name}_${pCount} -->
</navPoint>
<!-- h${level - 1}_${pCount} -->
`);
        }
        else {
            return `${pv}${`
<navPoint class="${name}" id="ncx-t${pCount}" playOrder="${playOrder}">
<navLabel>
<text>${txtContent ? encodeXmlTextContent(txtContent) : `_${pCount}`}</text>
</navLabel>
<content src="${encodeXmlAttributeValue(href)}"/>
<!-- ${name}_${pCount} -->
</navPoint>
`}`;
        }
    }, "");
    const opfStr = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE package
PUBLIC "+//ISBN 0-9673008-1-9//DTD OEB 1.2 Package//EN"
"http://openebook.org/dtds/oeb-1.2/oebpkg12.dtd">
<package xmlns="http://openebook.org/namespaces/oeb-package/1.0/" unique-identifier="uid">

<metadata>
<dc-metadata xmlns:dc="http://purl.org/dc/elements/1.1/"
xmlns:oebpackage="http://openebook.org/namespaces/oeb-package/1.0/">
    <dc:Format>ANSI/NISO Z39.86-2005</dc:Format>
    ${metas["dc:date"] ? `<dc:Date>${encodeXmlTextContent(metas["dc:date"])}</dc:Date>` : ""}
    ${metas["dc:language"] ? `<dc:Language>${encodeXmlTextContent(metas["dc:language"])}</dc:Language>` : ""}
    ${metas["dc:creator"] ? `<dc:Creator>${encodeXmlTextContent(metas["dc:creator"])}</dc:Creator>` : ""}
    ${metas["dc:publisher"] ? `<dc:Publisher>${encodeXmlTextContent(metas["dc:publisher"])}</dc:Publisher>` : ""}
    ${metas["dc:title"] ? `<dc:Title>${encodeXmlTextContent(metas["dc:title"])}</dc:Title>` : ""}
    ${metas["dc:identifier"] ? `<dc:Identifier id="uid">${encodeXmlTextContent(metas["dc:identifier"])}</dc:Identifier>` : ""}
</dc-metadata>

<x-metadata>
    ${metas["ncc:narrator"] ? `<meta name="dtb:narrator" content="${encodeXmlAttributeValue(metas["ncc:narrator"])}" />` : ""}
    ${metas["ncc:totalTime"] ? `<meta name="dtb:totalTime" content="${encodeXmlAttributeValue(metas["ncc:totalTime"])}" />` : ""}

    <meta name="dtb:multimediaType" content="${encodeXmlAttributeValue(multimediaType)}" />
    <meta name="dtb:multimediaContent" content="${encodeXmlAttributeValue(multimediaContent)}" />

    <!-- RAW COPY FROM DAISY2: -->
    ${Object.keys(metas).reduce((pv, cv) => {
        return `${pv}
    <meta name="${cv}" content="${encodeXmlAttributeValue(metas[cv])}" />`;
    }, "")}
</x-metadata>

</metadata>

<manifest>
<!-- item href="package.opf" id="opf" media-type="text/xml" />
<item href="navigation.ncx" id="ncx" media-type="application/x-dtbncx+xml" / -->

${manifestItemsStr}
</manifest>

<spine>
${spineItemsStr}
</spine>

</package>`;
    const opf = (0, epub_daisy_common_1.getOpf_)(opfStr, rootfilePathDecoded);
    const ncxStr = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
<head>
    ${metas["dc:identifier"] ? `<meta name="dtb:uid" content="${encodeXmlAttributeValue(metas["dc:identifier"])}" />` : ""}
    ${metas["ncc:generator"] ? `<meta name="dtb:generator" content="${encodeXmlAttributeValue(metas["ncc:generator"])}"/>` : ""}
    ${metas["ncc:depth"] ? `<meta name="dtb:depth" content="${encodeXmlAttributeValue(metas["ncc:depth"])}"/>` : ""}
    ${metas["ncc:pageNormal"] ? `<meta name="dtb:totalPageCount" content="${encodeXmlAttributeValue(metas["ncc:pageNormal"])}"/>` : ""}
    ${metas["ncc:maxPageNormal"] ? `<meta name="dtb:maxPageNumber" content="${encodeXmlAttributeValue(metas["ncc:maxPageNormal"])}"/>` : ""}
</head>

<docTitle>
<text>${metas["dc:title"] ? encodeXmlTextContent(metas["dc:title"]) : "_"}</text>
</docTitle>

<docAuthor>
<text>${metas["dc:creator"] ? encodeXmlTextContent(metas["dc:creator"]) : "-"}</text>
</docAuthor>

<navMap id="navMap">
${navMapStr}
</navMap>

<pageList id="pageList">
${pageListStr}
</pageList>

</ncx>`;
    const ncx = (0, epub_daisy_common_1.getNcx_)(ncxStr, rootfilePathDecoded);
    return [opf, ncx];
});
exports.convertNccToOpfAndNcx = convertNccToOpfAndNcx;
//# sourceMappingURL=daisy-convert-ncc-to-opf-ncx.js.map