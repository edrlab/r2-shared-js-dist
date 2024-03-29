"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto = require("crypto");
const deepEqual = require("fast-deep-equal");
const fs = require("fs");
const jsonDiff = require("json-diff");
const path = require("path");
const url_1 = require("url");
const util = require("util");
const media_overlay_1 = require("../models/media-overlay");
const publication_1 = require("../models/publication");
const publication_link_1 = require("../models/publication-link");
const audiobook_1 = require("../parser/audiobook");
const daisy_1 = require("../parser/daisy");
const daisy_convert_to_epub_1 = require("../parser/daisy-convert-to-epub");
const epub_1 = require("../parser/epub");
const epub_daisy_common_1 = require("../parser/epub-daisy-common");
const publication_parser_1 = require("../parser/publication-parser");
const lcp_1 = require("r2-lcp-js/dist/es7-es2016/src/parser/epub/lcp");
const serializable_1 = require("r2-lcp-js/dist/es7-es2016/src/serializable");
const UrlUtils_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/http/UrlUtils");
const BufferUtils_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/stream/BufferUtils");
const transformer_1 = require("../transform/transformer");
const init_globals_1 = require("../init-globals");
const zipHasEntry_1 = require("./zipHasEntry");
(0, init_globals_1.initGlobalConverters_SHARED)();
(0, init_globals_1.initGlobalConverters_GENERIC)();
(0, lcp_1.setLcpNativePluginPath)(path.join(process.cwd(), "LCP", "lcp.node"));
console.log("process.cwd():");
console.log(process.cwd());
console.log("__dirname: ");
console.log(__dirname);
const args = process.argv.slice(2);
console.log("args:");
console.log(args);
if (!args[0]) {
    console.log("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
const argPath = args[0].trim();
let filePath = argPath;
console.log(filePath);
if (!(0, UrlUtils_1.isHTTP)(filePath)) {
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, argPath);
        console.log(filePath);
        if (!fs.existsSync(filePath)) {
            filePath = path.join(process.cwd(), argPath);
            console.log(filePath);
            if (!fs.existsSync(filePath)) {
                console.log("FILEPATH DOES NOT EXIST.");
                process.exit(1);
            }
        }
    }
    const stats = fs.lstatSync(filePath);
    if (!stats.isFile() && !stats.isDirectory()) {
        console.log("FILEPATH MUST BE FILE OR DIRECTORY.");
        process.exit(1);
    }
}
let fileName = filePath;
if ((0, UrlUtils_1.isHTTP)(filePath)) {
    const url = new url_1.URL(filePath);
    fileName = url.pathname;
}
fileName = fileName.replace(/META-INF[\/|\\]container.xml$/, "");
fileName = path.basename(fileName);
let generateDaisyAudioManifestOnly = false;
let decryptKeys;
if (args[2]) {
    if (args[2] === "generate-daisy-audio-manifest-only") {
        generateDaisyAudioManifestOnly = true;
    }
    else {
        decryptKeys = args[2].trim().split(";");
    }
}
let outputDirPath;
if (args[1]) {
    const argDir = args[1].trim();
    let dirPath = argDir;
    console.log(dirPath);
    if (!fs.existsSync(dirPath)) {
        dirPath = path.join(__dirname, argDir);
        console.log(dirPath);
        if (!fs.existsSync(dirPath)) {
            dirPath = path.join(process.cwd(), argDir);
            console.log(dirPath);
            if (!fs.existsSync(dirPath)) {
                console.log("DIRPATH DOES NOT EXIST.");
                process.exit(1);
            }
            else {
                if (!fs.lstatSync(dirPath).isDirectory()) {
                    console.log("DIRPATH MUST BE DIRECTORY.");
                    process.exit(1);
                }
            }
        }
    }
    dirPath = fs.realpathSync(dirPath);
    if (generateDaisyAudioManifestOnly) {
        outputDirPath = dirPath;
        console.log(outputDirPath);
    }
    else {
        const fileNameNoExt = fileName + "_R2_EXTRACTED";
        console.log(fileNameNoExt);
        outputDirPath = path.join(dirPath, fileNameNoExt);
        console.log(outputDirPath);
        if (fs.existsSync(outputDirPath)) {
            console.log("OUTPUT FOLDER ALREADY EXISTS!");
            process.exit(1);
        }
    }
}
(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    let publication;
    try {
        publication = yield (0, publication_parser_1.PublicationParsePromise)(filePath);
    }
    catch (err) {
        console.log("== Publication Parser: reject");
        console.log(err);
        return;
    }
    const isAnEPUB = (0, epub_1.isEPUBlication)(filePath);
    let isAnAudioBook;
    try {
        isAnAudioBook = yield (0, audiobook_1.isAudioBookPublication)(filePath);
    }
    catch (_err) {
    }
    let isDaisyBook;
    try {
        isDaisyBook = yield (0, daisy_1.isDaisyPublication)(filePath);
    }
    catch (_err) {
    }
    if ((isDaisyBook || isAnAudioBook || isAnEPUB) && outputDirPath) {
        try {
            if (isDaisyBook) {
                yield (0, daisy_convert_to_epub_1.convertDaisyToReadiumWebPub)(outputDirPath, publication, generateDaisyAudioManifestOnly ? fileName : undefined);
            }
            else {
                yield extractEPUB((isAnEPUB || isDaisyBook) ? true : false, publication, outputDirPath, decryptKeys);
            }
        }
        catch (err) {
            console.log("== Publication extract FAIL");
            console.log(err);
            return;
        }
    }
    else {
        yield dumpPublication(publication);
    }
}))();
function extractEPUB_ManifestJSON(pub, outDir, keys) {
    const manifestJson = (0, serializable_1.TaJsonSerialize)(pub);
    const arrLinks = [];
    if (manifestJson.readingOrder) {
        arrLinks.push(...manifestJson.readingOrder);
    }
    if (manifestJson.resources) {
        arrLinks.push(...manifestJson.resources);
    }
    if (keys) {
        arrLinks.forEach((link) => {
            if (link.properties && link.properties.encrypted &&
                link.properties.encrypted.scheme === "http://readium.org/2014/01/lcp") {
                delete link.properties.encrypted;
                let atLeastOne = false;
                const jsonProps = Object.keys(link.properties);
                if (jsonProps) {
                    jsonProps.forEach((jsonProp) => {
                        if (link.properties.hasOwnProperty(jsonProp)) {
                            atLeastOne = true;
                            return false;
                        }
                        return true;
                    });
                }
                if (!atLeastOne) {
                    delete link.properties;
                }
            }
        });
        if (manifestJson.links) {
            const lks = manifestJson.links;
            let index = -1;
            for (let i = 0; i < lks.length; i++) {
                const link = lks[i];
                if (link.type === "application/vnd.readium.lcp.license.v1.0+json"
                    && link.rel === "license") {
                    index = i;
                    break;
                }
            }
            if (index >= 0) {
                lks.splice(index, 1);
            }
            if (lks.length === 0) {
                delete manifestJson.links;
            }
        }
    }
    arrLinks.forEach((link) => {
        if (link.properties && link.properties.encrypted &&
            (link.properties.encrypted.algorithm === "http://www.idpf.org/2008/embedding" ||
                link.properties.encrypted.algorithm === "http://ns.adobe.com/pdf/enc#RC")) {
            delete link.properties.encrypted;
            let atLeastOne = false;
            const jsonProps = Object.keys(link.properties);
            if (jsonProps) {
                jsonProps.forEach((jsonProp) => {
                    if (link.properties.hasOwnProperty(jsonProp)) {
                        atLeastOne = true;
                        return false;
                    }
                    return true;
                });
            }
            if (!atLeastOne) {
                delete link.properties;
            }
        }
    });
    const manifestJsonStr = JSON.stringify(manifestJson, null, "  ");
    const manifestJsonPath = path.join(outDir, "manifest.json");
    fs.writeFileSync(manifestJsonPath, manifestJsonStr, "utf8");
}
function extractEPUB_Check(zip, outDir) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let zipEntries;
        try {
            zipEntries = yield zip.getEntries();
        }
        catch (err) {
            console.log(err);
        }
        if (zipEntries) {
            for (const zipEntry of zipEntries) {
                if (zipEntry !== "mimetype" &&
                    !zipEntry.startsWith("META-INF/") &&
                    !/\.opf$/i.test(zipEntry) &&
                    !/ncc\.html$/i.test(zipEntry) &&
                    zipEntry !== "publication.json" &&
                    zipEntry !== "license.lcpl" &&
                    !zipEntry.endsWith(".DS_Store") &&
                    !zipEntry.startsWith("__MACOSX/")) {
                    const expectedOutputPath = path.join(outDir, zipEntry);
                    if (!fs.existsSync(expectedOutputPath)) {
                        console.log("Zip entry not extracted??");
                        console.log(expectedOutputPath);
                    }
                }
            }
        }
    });
}
function extractEPUB_ProcessKeys(pub, keys) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!pub.LCP || !keys) {
            return;
        }
        const keysSha256Hex = keys.map((key) => {
            console.log("@@@");
            console.log(key);
            if (key.length === 64) {
                let isHex = true;
                for (let i = 0; i < key.length; i += 2) {
                    const hexByte = key.substr(i, 2).toLowerCase();
                    const parsedInt = parseInt(hexByte, 16);
                    if (isNaN(parsedInt)) {
                        isHex = false;
                        break;
                    }
                }
                if (isHex) {
                    return key;
                }
            }
            const checkSum = crypto.createHash("sha256");
            checkSum.update(key);
            const keySha256Hex = checkSum.digest("hex");
            console.log(keySha256Hex);
            return keySha256Hex;
        });
        try {
            yield pub.LCP.tryUserKeys(keysSha256Hex);
        }
        catch (err) {
            console.log(err);
            throw Error("FAIL publication.LCP.tryUserKeys()");
        }
    });
}
function extractEPUB_Link(pub, zip, outDir, link) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const hrefDecoded = link.HrefDecoded;
        console.log("===== " + hrefDecoded);
        if (!hrefDecoded) {
            console.log("!?link.HrefDecoded");
            return;
        }
        const has = yield (0, zipHasEntry_1.zipHasEntry)(zip, hrefDecoded, link.Href);
        if (!has) {
            console.log(`NOT IN ZIP (extractEPUB_Link): ${link.Href} --- ${hrefDecoded}`);
            const zipEntries = yield zip.getEntries();
            for (const zipEntry of zipEntries) {
                if (zipEntry.startsWith("__MACOSX/")) {
                    continue;
                }
                console.log(zipEntry);
            }
            return;
        }
        let zipStream_;
        try {
            zipStream_ = yield zip.entryStreamPromise(hrefDecoded);
        }
        catch (err) {
            console.log(hrefDecoded);
            console.log(err);
            return;
        }
        let transformedStream;
        try {
            transformedStream = yield transformer_1.Transformers.tryStream(pub, link, undefined, zipStream_, false, 0, 0, undefined);
        }
        catch (err) {
            console.log(hrefDecoded);
            console.log(err);
            return;
        }
        zipStream_ = transformedStream;
        let zipData;
        try {
            zipData = yield (0, BufferUtils_1.streamToBufferPromise)(zipStream_.stream);
        }
        catch (err) {
            console.log(hrefDecoded);
            console.log(err);
            return;
        }
        const linkOutputPath = path.join(outDir, hrefDecoded);
        ensureDirs(linkOutputPath);
        fs.writeFileSync(linkOutputPath, zipData);
    });
}
function extractEPUB(isEPUB, pub, outDir, keys) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const zipInternal = pub.findFromInternal("zip");
        if (!zipInternal) {
            console.log("No publication zip!?");
            return;
        }
        const zip = zipInternal.Value;
        try {
            yield extractEPUB_ProcessKeys(pub, keys);
        }
        catch (err) {
            console.log(err);
            throw err;
        }
        ensureDirs(path.join(outDir, "DUMMY_FILE.EXT"));
        try {
            yield extractEPUB_MediaOverlays(pub, zip, outDir);
        }
        catch (err) {
            console.log(err);
        }
        extractEPUB_ManifestJSON(pub, outDir, keys);
        const links = [];
        if (pub.Resources) {
            links.push(...pub.Resources);
        }
        if (pub.Spine) {
            links.push(...pub.Spine);
        }
        if (!keys) {
            const lic = (isEPUB ? "META-INF/" : "") + "license.lcpl";
            const has = yield (0, zipHasEntry_1.zipHasEntry)(zip, lic, undefined);
            if (has) {
                const l = new publication_link_1.Link();
                l.setHrefDecoded(lic);
                links.push(l);
            }
        }
        for (const link of links) {
            try {
                yield extractEPUB_Link(pub, zip, outDir, link);
            }
            catch (err) {
                console.log(err);
            }
        }
        try {
            yield extractEPUB_Check(zip, outDir);
        }
        catch (err) {
            console.log(err);
        }
    });
}
function extractEPUB_MediaOverlays(pub, _zip, outDir) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!pub.Spine) {
            return;
        }
        let i = -1;
        for (const spineItem of pub.Spine) {
            if (spineItem.MediaOverlays) {
                const mo = spineItem.MediaOverlays;
                try {
                    yield (0, epub_daisy_common_1.lazyLoadMediaOverlays)(pub, mo);
                }
                catch (err) {
                    return Promise.reject(err);
                }
                const moJsonObj = (0, serializable_1.TaJsonSerialize)(mo);
                const moJsonStr = global.JSON.stringify(moJsonObj, null, "  ");
                i++;
                const p = `media-overlays_${i}.json`;
                const moJsonPath = path.join(outDir, p);
                fs.writeFileSync(moJsonPath, moJsonStr, "utf8");
                if (spineItem.Properties && spineItem.Properties.MediaOverlay) {
                    spineItem.Properties.MediaOverlay = p;
                }
                if (spineItem.Alternate) {
                    for (const altLink of spineItem.Alternate) {
                        if (altLink.TypeLink === "application/vnd.syncnarr+json") {
                            altLink.Href = p;
                        }
                    }
                }
            }
        }
    });
}
function ensureDirs(fspath) {
    const dirname = path.dirname(fspath);
    if (!fs.existsSync(dirname)) {
        ensureDirs(dirname);
        fs.mkdirSync(dirname);
    }
}
function dumpPublication(publication) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        console.log("#### RAW OBJECT:");
        console.log(util.inspect(publication, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
        const publicationJsonObj = (0, serializable_1.TaJsonSerialize)(publication);
        console.log(util.inspect(publicationJsonObj, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
        const publicationJsonStr = global.JSON.stringify(publicationJsonObj, null, "  ");
        const publicationReverse = (0, serializable_1.TaJsonDeserialize)(publicationJsonObj, publication_1.Publication);
        const publicationJsonObjReverse = (0, serializable_1.TaJsonSerialize)(publicationReverse);
        const eq = deepEqual(publicationJsonObj, publicationJsonObjReverse);
        if (!eq) {
            console.log("#### TA-JSON SERIALIZED JSON OBJ:");
            console.log(publicationJsonObj);
            console.log("#### STRINGIFIED JSON OBJ:");
            console.log(publicationJsonStr);
            console.log("#### TA-JSON DESERIALIZED (REVERSE):");
            console.log(util.inspect(publicationReverse, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
            console.log("#### TA-JSON SERIALIZED JSON OBJ (REVERSE):");
            console.log(publicationJsonObjReverse);
            console.log("#### REVERSE NOT DEEP EQUAL!\n\n");
            console.log("#### REVERSE NOT DEEP EQUAL!\n\n");
            console.log("#### REVERSE NOT DEEP EQUAL!\n\n");
        }
        console.log(jsonDiff.diffString(publicationJsonObj, publicationJsonObjReverse));
        if (publication.Spine) {
            for (const spineItem of publication.Spine) {
                if (spineItem.Properties && spineItem.Properties.MediaOverlay) {
                    console.log(spineItem.Href);
                    console.log(spineItem.Properties.MediaOverlay);
                    console.log(spineItem.Duration);
                }
                if (spineItem.Alternate) {
                    for (const altLink of spineItem.Alternate) {
                        if (altLink.TypeLink === "application/vnd.syncnarr+json") {
                            console.log(altLink.Href);
                            console.log(altLink.TypeLink);
                            console.log(altLink.Duration);
                        }
                    }
                }
                if (spineItem.MediaOverlays) {
                    const mo = spineItem.MediaOverlays;
                    if (!mo.initialized) {
                        console.log(util.inspect(mo, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
                    }
                    console.log(mo.SmilPathInZip);
                    try {
                        yield (0, epub_daisy_common_1.lazyLoadMediaOverlays)(publication, mo);
                    }
                    catch (err) {
                        return Promise.reject(err);
                    }
                    const moJsonObj = (0, serializable_1.TaJsonSerialize)(mo);
                    const moJsonStr = global.JSON.stringify(moJsonObj, null, "  ");
                    console.log(moJsonStr.substr(0, 1000) + "\n...\n");
                    const moReverse = (0, serializable_1.TaJsonDeserialize)(moJsonObj, media_overlay_1.MediaOverlayNode);
                    const moJsonObjReverse = (0, serializable_1.TaJsonSerialize)(moReverse);
                    const equa = deepEqual(moJsonObj, moJsonObjReverse);
                    if (!equa) {
                        console.log("#### TA-JSON SERIALIZED JSON OBJ:");
                        console.log(moJsonObj);
                        console.log("#### STRINGIFIED JSON OBJ:");
                        console.log(moJsonStr);
                        console.log("#### TA-JSON DESERIALIZED (REVERSE):");
                        console.log(util.inspect(moReverse, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
                        console.log("#### TA-JSON SERIALIZED JSON OBJ (REVERSE):");
                        console.log(moJsonObjReverse);
                        console.log("#### REVERSE NOT DEEP EQUAL!\n\n");
                        console.log("#### REVERSE NOT DEEP EQUAL!\n\n");
                        console.log("#### REVERSE NOT DEEP EQUAL!\n\n");
                    }
                    console.log(jsonDiff.diffString(moJsonObj, moJsonObjReverse));
                }
            }
        }
    });
}
//# sourceMappingURL=cli.js.map