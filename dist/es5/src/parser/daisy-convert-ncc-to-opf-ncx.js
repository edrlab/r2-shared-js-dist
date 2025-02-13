"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNccToOpfAndNcx = void 0;
var tslib_1 = require("tslib");
var he = require("he");
var debug_ = require("debug");
var mime = require("mime-types");
var path = require("path");
var xmldom = require("@xmldom/xmldom");
var media_overlay_1 = require("../models/media-overlay");
var BufferUtils_1 = require("r2-utils-js/dist/es5/src/_utils/stream/BufferUtils");
var bom_1 = require("r2-utils-js/dist/es5/src/_utils/bom");
var zipHasEntry_1 = require("../_utils/zipHasEntry");
var epub_daisy_common_1 = require("./epub-daisy-common");
var debug = debug_("r2:shared#parser/daisy-convert-to-epub");
var decodeHtmlAttributeValue = function (val) {
    var decoded = he.decode(val, { isAttributeValue: true });
    return decoded;
};
var decodeHtmlTextContent = function (textContent) {
    var decoded = he.decode(textContent);
    return decoded;
};
var encodeXmlAttributeValue = function (val) {
    return val.replace(/"/g, "&quot;");
};
var encodeXmlTextContent = function (textContent) {
    return textContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
var getMediaTypeFromFileExtension = function (ext) {
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
var convertNccToOpfAndNcx = function (zip, rootfilePathDecoded, rootfilePath) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var has, err, zipEntries, _i, zipEntries_1, zipEntry, nccZipStream_, err_1, nccZipStream, nccZipData, err_2, nccStr, nccDoc, metas, aElems, multimediaContent, multimediaType, zipEntriez, manifestItemsBaseStr, arrSmils, manifestItemsStr, spineItemsStr, playOrder, pCount, pageListStr, navMapStr, opfStr, opf, ncxStr, ncx;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, (0, zipHasEntry_1.zipHasEntry)(zip, rootfilePathDecoded, rootfilePath)];
            case 1:
                has = _a.sent();
                if (!!has) return [3, 3];
                err = "NOT IN ZIP (NCC.html): ".concat(rootfilePath, " --- ").concat(rootfilePathDecoded);
                debug(err);
                return [4, zip.getEntries()];
            case 2:
                zipEntries = _a.sent();
                for (_i = 0, zipEntries_1 = zipEntries; _i < zipEntries_1.length; _i++) {
                    zipEntry = zipEntries_1[_i];
                    if (zipEntry.startsWith("__MACOSX/")) {
                        continue;
                    }
                    debug(zipEntry);
                }
                return [2, Promise.reject(err)];
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4, zip.entryStreamPromise(rootfilePathDecoded)];
            case 4:
                nccZipStream_ = _a.sent();
                return [3, 6];
            case 5:
                err_1 = _a.sent();
                debug(err_1);
                return [2, Promise.reject(err_1)];
            case 6:
                nccZipStream = nccZipStream_.stream;
                _a.label = 7;
            case 7:
                _a.trys.push([7, 9, , 10]);
                return [4, (0, BufferUtils_1.streamToBufferPromise)(nccZipStream)];
            case 8:
                nccZipData = _a.sent();
                return [3, 10];
            case 9:
                err_2 = _a.sent();
                debug(err_2);
                return [2, Promise.reject(err_2)];
            case 10:
                nccStr = (0, bom_1.removeUTF8BOM)(nccZipData.toString("utf8"));
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
                metas = Array.from(nccDoc.getElementsByTagName("meta")).
                    reduce(function (prevVal, curVal) {
                    var name = curVal.getAttribute("name");
                    var content = curVal.getAttribute("content");
                    if (name && content) {
                        prevVal[name] = decodeHtmlAttributeValue(content.trim());
                    }
                    return prevVal;
                }, {});
                aElems = Array.from(nccDoc.getElementsByTagName("a"));
                multimediaContent = "";
                multimediaType = "";
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
                return [4, zip.getEntries()];
            case 11:
                zipEntriez = (_a.sent()).filter(function (e) {
                    return e && !e.endsWith("/");
                });
                manifestItemsBaseStr = zipEntriez.reduce(function (pv, cv, ci) {
                    var ext = path.extname(cv);
                    return "".concat(pv).concat(!cv.startsWith("__MACOSX/") && !/ncc\.html$/i.test(cv) && !/\.ent$/i.test(ext) && !/\.dtd$/i.test(ext) && !/\.smil$/i.test(ext) ? "\n        <item\n            href=\"".concat(encodeXmlAttributeValue(path.relative("file:///" + path.dirname(rootfilePathDecoded), "file:///" + cv).replace(/\\/g, "/")), "\"\n            id=\"opf-zip-").concat(ci, "\"\n            media-type=\"").concat(getMediaTypeFromFileExtension(ext), "\" />") : "");
                }, "");
                arrSmils = [];
                manifestItemsStr = aElems.reduce(function (pv, cv, _ci) {
                    var href = cv.getAttribute("href");
                    if (!href) {
                        return pv;
                    }
                    if (!/\.smil(#.*)?$/i.test(href)) {
                        return pv;
                    }
                    var smil = href.replace(/(.+\.smil)(#.*)?$/i, "$1");
                    if (arrSmils.indexOf(smil) >= 0) {
                        return pv;
                    }
                    arrSmils.push(smil);
                    return "".concat(pv).concat("\n            <item\n                href=\"".concat(encodeXmlAttributeValue(smil), "\"\n                id=\"opf-ncc-").concat(arrSmils.length - 1, "\"\n                media-type=\"application/smil+xml\" />"));
                }, manifestItemsBaseStr);
                spineItemsStr = arrSmils.reduce(function (pv, _cv, ci) {
                    return "".concat(pv).concat("\n            <itemref idref=\"opf-ncc-".concat(ci, "\" />"));
                }, "");
                playOrder = 0;
                pCount = 0;
                pageListStr = aElems.reduce(function (pv, cv, _ci) {
                    var href = cv.getAttribute("href");
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
                    var clazz = cv.parentNode.getAttribute("class");
                    if (!clazz || !clazz.startsWith("page")) {
                        return pv;
                    }
                    var txtContent = cv.textContent ? decodeHtmlTextContent(cv.textContent.trim()) : "";
                    pCount++;
                    return "".concat(pv).concat("\n<pageTarget class=\"pagenum\" id=\"ncx-p".concat(pCount, "\" playOrder=\"").concat(playOrder, "\" type=\"normal\" value=\"").concat(pCount, "\">\n<navLabel>\n<text>").concat(txtContent ? encodeXmlTextContent(txtContent) : pCount, "</text>\n</navLabel>\n<content src=\"").concat(encodeXmlAttributeValue(href), "\"/>\n</pageTarget>\n"));
                }, "");
                playOrder = 0;
                pCount = 0;
                navMapStr = aElems.reduce(function (pv, cv, _ci) {
                    var href = cv.getAttribute("href");
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
                    var name = cv.parentNode.localName;
                    if (!name || !name.startsWith("h")) {
                        return pv;
                    }
                    var level = parseInt(name.substr(1), 10);
                    var txtContent = cv.textContent ? decodeHtmlTextContent(cv.textContent.trim()) : "";
                    pCount++;
                    var inner = "<!-- h".concat(level - 1, "_").concat(pCount - 1, " -->");
                    if (pv.indexOf(inner) >= 0) {
                        return pv.replace(inner, "\n<navPoint class=\"".concat(name, "\" id=\"ncx-t").concat(pCount, "\" playOrder=\"").concat(playOrder, "\">\n<navLabel>\n<text>").concat(txtContent ? encodeXmlTextContent(txtContent) : "_".concat(pCount), "</text>\n</navLabel>\n<content src=\"").concat(encodeXmlAttributeValue(href), "\"/>\n<!-- ").concat(name, "_").concat(pCount, " -->\n</navPoint>\n<!-- h").concat(level - 1, "_").concat(pCount, " -->\n"));
                    }
                    else {
                        return "".concat(pv).concat("\n<navPoint class=\"".concat(name, "\" id=\"ncx-t").concat(pCount, "\" playOrder=\"").concat(playOrder, "\">\n<navLabel>\n<text>").concat(txtContent ? encodeXmlTextContent(txtContent) : "_".concat(pCount), "</text>\n</navLabel>\n<content src=\"").concat(encodeXmlAttributeValue(href), "\"/>\n<!-- ").concat(name, "_").concat(pCount, " -->\n</navPoint>\n"));
                    }
                }, "");
                opfStr = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<!DOCTYPE package\nPUBLIC \"+//ISBN 0-9673008-1-9//DTD OEB 1.2 Package//EN\"\n\"http://openebook.org/dtds/oeb-1.2/oebpkg12.dtd\">\n<package xmlns=\"http://openebook.org/namespaces/oeb-package/1.0/\" unique-identifier=\"uid\">\n\n<metadata>\n<dc-metadata xmlns:dc=\"http://purl.org/dc/elements/1.1/\"\nxmlns:oebpackage=\"http://openebook.org/namespaces/oeb-package/1.0/\">\n    <dc:Format>ANSI/NISO Z39.86-2005</dc:Format>\n    ".concat(metas["dc:date"] ? "<dc:Date>".concat(encodeXmlTextContent(metas["dc:date"]), "</dc:Date>") : "", "\n    ").concat(metas["dc:language"] ? "<dc:Language>".concat(encodeXmlTextContent(metas["dc:language"]), "</dc:Language>") : "", "\n    ").concat(metas["dc:creator"] ? "<dc:Creator>".concat(encodeXmlTextContent(metas["dc:creator"]), "</dc:Creator>") : "", "\n    ").concat(metas["dc:publisher"] ? "<dc:Publisher>".concat(encodeXmlTextContent(metas["dc:publisher"]), "</dc:Publisher>") : "", "\n    ").concat(metas["dc:title"] ? "<dc:Title>".concat(encodeXmlTextContent(metas["dc:title"]), "</dc:Title>") : "", "\n    ").concat(metas["dc:identifier"] ? "<dc:Identifier id=\"uid\">".concat(encodeXmlTextContent(metas["dc:identifier"]), "</dc:Identifier>") : "", "\n</dc-metadata>\n\n<x-metadata>\n    ").concat(metas["ncc:narrator"] ? "<meta name=\"dtb:narrator\" content=\"".concat(encodeXmlAttributeValue(metas["ncc:narrator"]), "\" />") : "", "\n    ").concat(metas["ncc:totalTime"] ? "<meta name=\"dtb:totalTime\" content=\"".concat(encodeXmlAttributeValue(metas["ncc:totalTime"]), "\" />") : "", "\n\n    <meta name=\"dtb:multimediaType\" content=\"").concat(encodeXmlAttributeValue(multimediaType), "\" />\n    <meta name=\"dtb:multimediaContent\" content=\"").concat(encodeXmlAttributeValue(multimediaContent), "\" />\n\n    <!-- RAW COPY FROM DAISY2: -->\n    ").concat(Object.keys(metas).reduce(function (pv, cv) {
                    return "".concat(pv, "\n    <meta name=\"").concat(cv, "\" content=\"").concat(encodeXmlAttributeValue(metas[cv]), "\" />");
                }, ""), "\n</x-metadata>\n\n</metadata>\n\n<manifest>\n<!-- item href=\"package.opf\" id=\"opf\" media-type=\"text/xml\" />\n<item href=\"navigation.ncx\" id=\"ncx\" media-type=\"application/x-dtbncx+xml\" / -->\n\n").concat(manifestItemsStr, "\n</manifest>\n\n<spine>\n").concat(spineItemsStr, "\n</spine>\n\n</package>");
                opf = (0, epub_daisy_common_1.getOpf_)(opfStr, rootfilePathDecoded);
                ncxStr = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<ncx xmlns=\"http://www.daisy.org/z3986/2005/ncx/\" version=\"2005-1\">\n<head>\n    ".concat(metas["dc:identifier"] ? "<meta name=\"dtb:uid\" content=\"".concat(encodeXmlAttributeValue(metas["dc:identifier"]), "\" />") : "", "\n    ").concat(metas["ncc:generator"] ? "<meta name=\"dtb:generator\" content=\"".concat(encodeXmlAttributeValue(metas["ncc:generator"]), "\"/>") : "", "\n    ").concat(metas["ncc:depth"] ? "<meta name=\"dtb:depth\" content=\"".concat(encodeXmlAttributeValue(metas["ncc:depth"]), "\"/>") : "", "\n    ").concat(metas["ncc:pageNormal"] ? "<meta name=\"dtb:totalPageCount\" content=\"".concat(encodeXmlAttributeValue(metas["ncc:pageNormal"]), "\"/>") : "", "\n    ").concat(metas["ncc:maxPageNormal"] ? "<meta name=\"dtb:maxPageNumber\" content=\"".concat(encodeXmlAttributeValue(metas["ncc:maxPageNormal"]), "\"/>") : "", "\n</head>\n\n<docTitle>\n<text>").concat(metas["dc:title"] ? encodeXmlTextContent(metas["dc:title"]) : "_", "</text>\n</docTitle>\n\n<docAuthor>\n<text>").concat(metas["dc:creator"] ? encodeXmlTextContent(metas["dc:creator"]) : "-", "</text>\n</docAuthor>\n\n<navMap id=\"navMap\">\n").concat(navMapStr, "\n</navMap>\n\n<pageList id=\"pageList\">\n").concat(pageListStr, "\n</pageList>\n\n</ncx>");
                ncx = (0, epub_daisy_common_1.getNcx_)(ncxStr, rootfilePathDecoded);
                return [2, [opf, ncx]];
        }
    });
}); };
exports.convertNccToOpfAndNcx = convertNccToOpfAndNcx;
//# sourceMappingURL=daisy-convert-ncc-to-opf-ncx.js.map