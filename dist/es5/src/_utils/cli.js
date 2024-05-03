"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var crypto = require("crypto");
var deepEqual = require("fast-deep-equal");
var fs = require("fs");
var jsonDiff = require("json-diff");
var path = require("path");
var url_1 = require("url");
var util = require("util");
var media_overlay_1 = require("../models/media-overlay");
var publication_1 = require("../models/publication");
var publication_link_1 = require("../models/publication-link");
var audiobook_1 = require("../parser/audiobook");
var daisy_1 = require("../parser/daisy");
var daisy_convert_to_epub_1 = require("../parser/daisy-convert-to-epub");
var epub_1 = require("../parser/epub");
var epub_daisy_common_1 = require("../parser/epub-daisy-common");
var publication_parser_1 = require("../parser/publication-parser");
var lcp_1 = require("r2-lcp-js/dist/es5/src/parser/epub/lcp");
var serializable_1 = require("r2-lcp-js/dist/es5/src/serializable");
var UrlUtils_1 = require("r2-utils-js/dist/es5/src/_utils/http/UrlUtils");
var BufferUtils_1 = require("r2-utils-js/dist/es5/src/_utils/stream/BufferUtils");
var transformer_1 = require("../transform/transformer");
var init_globals_1 = require("../init-globals");
var zipHasEntry_1 = require("./zipHasEntry");
(0, init_globals_1.initGlobalConverters_SHARED)();
(0, init_globals_1.initGlobalConverters_GENERIC)();
(0, lcp_1.setLcpNativePluginPath)(path.join(process.cwd(), "LCP", "lcp.node"));
console.log("process.cwd():");
console.log(process.cwd());
console.log("__dirname: ");
console.log(__dirname);
var args = process.argv.slice(2);
console.log("args:");
console.log(args);
if (!args[0]) {
    console.log("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
var argPath = args[0].trim();
var filePath = argPath;
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
    var stats = fs.lstatSync(filePath);
    if (!stats.isFile() && !stats.isDirectory()) {
        console.log("FILEPATH MUST BE FILE OR DIRECTORY.");
        process.exit(1);
    }
}
var fileName = filePath;
if ((0, UrlUtils_1.isHTTP)(filePath)) {
    var url = new url_1.URL(filePath);
    fileName = url.pathname;
}
fileName = fileName.replace(/META-INF[\/|\\]container.xml$/, "");
fileName = path.basename(fileName);
var generateDaisyAudioManifestOnly = false;
var decryptKeys;
if (args[2]) {
    if (args[2] === "generate-daisy-audio-manifest-only") {
        generateDaisyAudioManifestOnly = true;
    }
    else {
        decryptKeys = args[2].trim().split(";");
    }
}
var outputDirPath;
if (args[1]) {
    var argDir = args[1].trim();
    var dirPath = argDir;
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
        var fileNameNoExt = fileName + "_R2_EXTRACTED";
        console.log(fileNameNoExt);
        outputDirPath = path.join(dirPath, fileNameNoExt);
        console.log(outputDirPath);
        if (fs.existsSync(outputDirPath)) {
            console.log("OUTPUT FOLDER ALREADY EXISTS!");
            process.exit(1);
        }
    }
}
(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var publication, err_1, isAnEPUB, isAnAudioBook, _err_1, isDaisyBook, _err_2, isFullTextAudio, err_2, err_3;
    var _a, _b;
    return tslib_1.__generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4, (0, publication_parser_1.PublicationParsePromise)(filePath)];
            case 1:
                publication = _c.sent();
                return [3, 3];
            case 2:
                err_1 = _c.sent();
                console.log("== Publication Parser: reject");
                console.log(err_1);
                return [2];
            case 3:
                isAnEPUB = (0, epub_1.isEPUBlication)(filePath);
                _c.label = 4;
            case 4:
                _c.trys.push([4, 6, , 7]);
                return [4, (0, audiobook_1.isAudioBookPublication)(filePath)];
            case 5:
                isAnAudioBook = _c.sent();
                return [3, 7];
            case 6:
                _err_1 = _c.sent();
                return [3, 7];
            case 7:
                _c.trys.push([7, 9, , 10]);
                return [4, (0, daisy_1.isDaisyPublication)(filePath)];
            case 8:
                isDaisyBook = _c.sent();
                return [3, 10];
            case 9:
                _err_2 = _c.sent();
                return [3, 10];
            case 10:
                if (!((isDaisyBook || isAnAudioBook || isAnEPUB) && outputDirPath)) return [3, 24];
                _c.label = 11;
            case 11:
                _c.trys.push([11, 22, , 23]);
                if (!isDaisyBook) return [3, 19];
                return [4, (0, daisy_convert_to_epub_1.convertDaisyToReadiumWebPub)(outputDirPath, publication, generateDaisyAudioManifestOnly ? fileName : undefined)];
            case 12:
                _c.sent();
                isFullTextAudio = ((_a = publication.Metadata) === null || _a === void 0 ? void 0 : _a.AdditionalJSON) &&
                    (publication.Metadata.AdditionalJSON["dtb:multimediaType"] === "audioFullText" ||
                        publication.Metadata.AdditionalJSON["ncc:multimediaType"] === "audioFullText" || (!publication.Metadata.AdditionalJSON["dtb:multimediaType"] &&
                        !publication.Metadata.AdditionalJSON["ncc:multimediaType"]));
                if (!(isFullTextAudio && !((_b = publication.Spine) === null || _b === void 0 ? void 0 : _b.length))) return [3, 18];
                console.log("%%%%% FAILED audio+text DAISY convert, trying again as audio-only ...");
                publication.freeDestroy();
                _c.label = 13;
            case 13:
                _c.trys.push([13, 15, , 16]);
                return [4, (0, publication_parser_1.PublicationParsePromise)(filePath)];
            case 14:
                publication = _c.sent();
                return [3, 16];
            case 15:
                err_2 = _c.sent();
                console.log("== Publication Parser: reject");
                console.log(err_2);
                return [2];
            case 16: return [4, new Promise(function (reso) {
                    setTimeout(function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                        var _a;
                        return tslib_1.__generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = reso;
                                    return [4, (0, daisy_convert_to_epub_1.convertDaisyToReadiumWebPub)(outputDirPath, publication, generateDaisyAudioManifestOnly ? fileName : undefined, true)];
                                case 1:
                                    _a.apply(void 0, [_b.sent()]);
                                    return [2];
                            }
                        });
                    }); }, 500);
                })];
            case 17:
                _c.sent();
                _c.label = 18;
            case 18: return [3, 21];
            case 19: return [4, extractEPUB((isAnEPUB || isDaisyBook) ? true : false, publication, outputDirPath, decryptKeys)];
            case 20:
                _c.sent();
                _c.label = 21;
            case 21: return [3, 23];
            case 22:
                err_3 = _c.sent();
                console.log("== Publication extract FAIL");
                console.log(err_3);
                return [2];
            case 23: return [3, 26];
            case 24: return [4, dumpPublication(publication)];
            case 25:
                _c.sent();
                _c.label = 26;
            case 26: return [2];
        }
    });
}); })();
function extractEPUB_ManifestJSON(pub, outDir, keys) {
    var manifestJson = (0, serializable_1.TaJsonSerialize)(pub);
    var arrLinks = [];
    if (manifestJson.readingOrder) {
        arrLinks.push.apply(arrLinks, manifestJson.readingOrder);
    }
    if (manifestJson.resources) {
        arrLinks.push.apply(arrLinks, manifestJson.resources);
    }
    if (keys) {
        arrLinks.forEach(function (link) {
            if (link.properties && link.properties.encrypted &&
                link.properties.encrypted.scheme === "http://readium.org/2014/01/lcp") {
                delete link.properties.encrypted;
                var atLeastOne_1 = false;
                var jsonProps = Object.keys(link.properties);
                if (jsonProps) {
                    jsonProps.forEach(function (jsonProp) {
                        if (link.properties.hasOwnProperty(jsonProp)) {
                            atLeastOne_1 = true;
                            return false;
                        }
                        return true;
                    });
                }
                if (!atLeastOne_1) {
                    delete link.properties;
                }
            }
        });
        if (manifestJson.links) {
            var lks = manifestJson.links;
            var index = -1;
            for (var i = 0; i < lks.length; i++) {
                var link = lks[i];
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
    arrLinks.forEach(function (link) {
        if (link.properties && link.properties.encrypted &&
            (link.properties.encrypted.algorithm === "http://www.idpf.org/2008/embedding" ||
                link.properties.encrypted.algorithm === "http://ns.adobe.com/pdf/enc#RC")) {
            delete link.properties.encrypted;
            var atLeastOne_2 = false;
            var jsonProps = Object.keys(link.properties);
            if (jsonProps) {
                jsonProps.forEach(function (jsonProp) {
                    if (link.properties.hasOwnProperty(jsonProp)) {
                        atLeastOne_2 = true;
                        return false;
                    }
                    return true;
                });
            }
            if (!atLeastOne_2) {
                delete link.properties;
            }
        }
    });
    var manifestJsonStr = JSON.stringify(manifestJson, null, "  ");
    var manifestJsonPath = path.join(outDir, "manifest.json");
    fs.writeFileSync(manifestJsonPath, manifestJsonStr, "utf8");
}
function extractEPUB_Check(zip, outDir) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var zipEntries, err_4, _i, zipEntries_1, zipEntry, expectedOutputPath;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, zip.getEntries()];
                case 1:
                    zipEntries = _a.sent();
                    return [3, 3];
                case 2:
                    err_4 = _a.sent();
                    console.log(err_4);
                    return [3, 3];
                case 3:
                    if (zipEntries) {
                        for (_i = 0, zipEntries_1 = zipEntries; _i < zipEntries_1.length; _i++) {
                            zipEntry = zipEntries_1[_i];
                            if (zipEntry !== "mimetype" &&
                                !zipEntry.startsWith("META-INF/") &&
                                !/\.opf$/i.test(zipEntry) &&
                                !/ncc\.html$/i.test(zipEntry) &&
                                zipEntry !== "publication.json" &&
                                zipEntry !== "license.lcpl" &&
                                !zipEntry.endsWith(".DS_Store") &&
                                !zipEntry.startsWith("__MACOSX/")) {
                                expectedOutputPath = path.join(outDir, zipEntry);
                                if (!fs.existsSync(expectedOutputPath)) {
                                    console.log("Zip entry not extracted??");
                                    console.log(expectedOutputPath);
                                }
                            }
                        }
                    }
                    return [2];
            }
        });
    });
}
function extractEPUB_ProcessKeys(pub, keys) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var keysSha256Hex, err_5;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pub.LCP || !keys) {
                        return [2];
                    }
                    keysSha256Hex = keys.map(function (key) {
                        console.log("@@@");
                        console.log(key);
                        if (key.length === 64) {
                            var isHex = true;
                            for (var i = 0; i < key.length; i += 2) {
                                var hexByte = key.substr(i, 2).toLowerCase();
                                var parsedInt = parseInt(hexByte, 16);
                                if (isNaN(parsedInt)) {
                                    isHex = false;
                                    break;
                                }
                            }
                            if (isHex) {
                                return key;
                            }
                        }
                        var checkSum = crypto.createHash("sha256");
                        checkSum.update(key);
                        var keySha256Hex = checkSum.digest("hex");
                        console.log(keySha256Hex);
                        return keySha256Hex;
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, pub.LCP.tryUserKeys(keysSha256Hex)];
                case 2:
                    _a.sent();
                    return [3, 4];
                case 3:
                    err_5 = _a.sent();
                    console.log(err_5);
                    throw Error("FAIL publication.LCP.tryUserKeys()");
                case 4: return [2];
            }
        });
    });
}
function extractEPUB_Link(pub, zip, outDir, link) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var hrefDecoded, has, zipEntries, _i, zipEntries_2, zipEntry, zipStream_, err_6, transformedStream, err_7, zipData, err_8, linkOutputPath;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hrefDecoded = link.HrefDecoded;
                    console.log("===== " + hrefDecoded);
                    if (!hrefDecoded) {
                        console.log("!?link.HrefDecoded");
                        return [2];
                    }
                    return [4, (0, zipHasEntry_1.zipHasEntry)(zip, hrefDecoded, link.Href)];
                case 1:
                    has = _a.sent();
                    if (!!has) return [3, 3];
                    console.log("NOT IN ZIP (extractEPUB_Link): ".concat(link.Href, " --- ").concat(hrefDecoded));
                    return [4, zip.getEntries()];
                case 2:
                    zipEntries = _a.sent();
                    for (_i = 0, zipEntries_2 = zipEntries; _i < zipEntries_2.length; _i++) {
                        zipEntry = zipEntries_2[_i];
                        if (zipEntry.startsWith("__MACOSX/")) {
                            continue;
                        }
                        console.log(zipEntry);
                    }
                    return [2];
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4, zip.entryStreamPromise(hrefDecoded)];
                case 4:
                    zipStream_ = _a.sent();
                    return [3, 6];
                case 5:
                    err_6 = _a.sent();
                    console.log(hrefDecoded);
                    console.log(err_6);
                    return [2];
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4, transformer_1.Transformers.tryStream(pub, link, undefined, zipStream_, false, 0, 0, undefined)];
                case 7:
                    transformedStream = _a.sent();
                    return [3, 9];
                case 8:
                    err_7 = _a.sent();
                    console.log(hrefDecoded);
                    console.log(err_7);
                    return [2];
                case 9:
                    zipStream_ = transformedStream;
                    _a.label = 10;
                case 10:
                    _a.trys.push([10, 12, , 13]);
                    return [4, (0, BufferUtils_1.streamToBufferPromise)(zipStream_.stream)];
                case 11:
                    zipData = _a.sent();
                    return [3, 13];
                case 12:
                    err_8 = _a.sent();
                    console.log(hrefDecoded);
                    console.log(err_8);
                    return [2];
                case 13:
                    linkOutputPath = path.join(outDir, hrefDecoded);
                    ensureDirs(linkOutputPath);
                    fs.writeFileSync(linkOutputPath, zipData);
                    return [2];
            }
        });
    });
}
function extractEPUB(isEPUB, pub, outDir, keys) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var zipInternal, zip, err_9, err_10, links, lic, has, l, _i, links_1, link, err_11, err_12;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    zipInternal = pub.findFromInternal("zip");
                    if (!zipInternal) {
                        console.log("No publication zip!?");
                        return [2];
                    }
                    zip = zipInternal.Value;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4, extractEPUB_ProcessKeys(pub, keys)];
                case 2:
                    _a.sent();
                    return [3, 4];
                case 3:
                    err_9 = _a.sent();
                    console.log(err_9);
                    throw err_9;
                case 4:
                    ensureDirs(path.join(outDir, "DUMMY_FILE.EXT"));
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4, extractEPUB_MediaOverlays(pub, zip, outDir)];
                case 6:
                    _a.sent();
                    return [3, 8];
                case 7:
                    err_10 = _a.sent();
                    console.log(err_10);
                    return [3, 8];
                case 8:
                    extractEPUB_ManifestJSON(pub, outDir, keys);
                    links = [];
                    if (pub.Resources) {
                        links.push.apply(links, pub.Resources);
                    }
                    if (pub.Spine) {
                        links.push.apply(links, pub.Spine);
                    }
                    if (!!keys) return [3, 10];
                    lic = (isEPUB ? "META-INF/" : "") + "license.lcpl";
                    return [4, (0, zipHasEntry_1.zipHasEntry)(zip, lic, undefined)];
                case 9:
                    has = _a.sent();
                    if (has) {
                        l = new publication_link_1.Link();
                        l.setHrefDecoded(lic);
                        links.push(l);
                    }
                    _a.label = 10;
                case 10:
                    _i = 0, links_1 = links;
                    _a.label = 11;
                case 11:
                    if (!(_i < links_1.length)) return [3, 16];
                    link = links_1[_i];
                    _a.label = 12;
                case 12:
                    _a.trys.push([12, 14, , 15]);
                    return [4, extractEPUB_Link(pub, zip, outDir, link)];
                case 13:
                    _a.sent();
                    return [3, 15];
                case 14:
                    err_11 = _a.sent();
                    console.log(err_11);
                    return [3, 15];
                case 15:
                    _i++;
                    return [3, 11];
                case 16:
                    _a.trys.push([16, 18, , 19]);
                    return [4, extractEPUB_Check(zip, outDir)];
                case 17:
                    _a.sent();
                    return [3, 19];
                case 18:
                    err_12 = _a.sent();
                    console.log(err_12);
                    return [3, 19];
                case 19: return [2];
            }
        });
    });
}
function extractEPUB_MediaOverlays(pub, _zip, outDir) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var i, _i, _a, spineItem, mo, err_13, moJsonObj, moJsonStr, p, moJsonPath, _b, _c, altLink;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!pub.Spine) {
                        return [2];
                    }
                    i = -1;
                    _i = 0, _a = pub.Spine;
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3, 7];
                    spineItem = _a[_i];
                    if (!spineItem.MediaOverlays) return [3, 6];
                    mo = spineItem.MediaOverlays;
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4, (0, epub_daisy_common_1.lazyLoadMediaOverlays)(pub, mo)];
                case 3:
                    _d.sent();
                    return [3, 5];
                case 4:
                    err_13 = _d.sent();
                    return [2, Promise.reject(err_13)];
                case 5:
                    moJsonObj = (0, serializable_1.TaJsonSerialize)(mo);
                    moJsonStr = global.JSON.stringify(moJsonObj, null, "  ");
                    i++;
                    p = "media-overlays_".concat(i, ".json");
                    moJsonPath = path.join(outDir, p);
                    fs.writeFileSync(moJsonPath, moJsonStr, "utf8");
                    if (spineItem.Properties && spineItem.Properties.MediaOverlay) {
                        spineItem.Properties.MediaOverlay = p;
                    }
                    if (spineItem.Alternate) {
                        for (_b = 0, _c = spineItem.Alternate; _b < _c.length; _b++) {
                            altLink = _c[_b];
                            if (altLink.TypeLink === "application/vnd.syncnarr+json") {
                                altLink.Href = p;
                            }
                        }
                    }
                    _d.label = 6;
                case 6:
                    _i++;
                    return [3, 1];
                case 7: return [2];
            }
        });
    });
}
function ensureDirs(fspath) {
    var dirname = path.dirname(fspath);
    if (!fs.existsSync(dirname)) {
        ensureDirs(dirname);
        fs.mkdirSync(dirname);
    }
}
function dumpPublication(publication) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var publicationJsonObj, publicationJsonStr, publicationReverse, publicationJsonObjReverse, eq, _i, _a, spineItem, _b, _c, altLink, mo, err_14, moJsonObj, moJsonStr, moReverse, moJsonObjReverse, equa;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log("#### RAW OBJECT:");
                    console.log(util.inspect(publication, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
                    publicationJsonObj = (0, serializable_1.TaJsonSerialize)(publication);
                    console.log(util.inspect(publicationJsonObj, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
                    publicationJsonStr = global.JSON.stringify(publicationJsonObj, null, "  ");
                    publicationReverse = (0, serializable_1.TaJsonDeserialize)(publicationJsonObj, publication_1.Publication);
                    publicationJsonObjReverse = (0, serializable_1.TaJsonSerialize)(publicationReverse);
                    eq = deepEqual(publicationJsonObj, publicationJsonObjReverse);
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
                    if (!publication.Spine) return [3, 7];
                    _i = 0, _a = publication.Spine;
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3, 7];
                    spineItem = _a[_i];
                    if (spineItem.Properties && spineItem.Properties.MediaOverlay) {
                        console.log(spineItem.Href);
                        console.log(spineItem.Properties.MediaOverlay);
                        console.log(spineItem.Duration);
                    }
                    if (spineItem.Alternate) {
                        for (_b = 0, _c = spineItem.Alternate; _b < _c.length; _b++) {
                            altLink = _c[_b];
                            if (altLink.TypeLink === "application/vnd.syncnarr+json") {
                                console.log(altLink.Href);
                                console.log(altLink.TypeLink);
                                console.log(altLink.Duration);
                            }
                        }
                    }
                    if (!spineItem.MediaOverlays) return [3, 6];
                    mo = spineItem.MediaOverlays;
                    if (!mo.initialized) {
                        console.log(util.inspect(mo, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
                    }
                    console.log(mo.SmilPathInZip);
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 4, , 5]);
                    return [4, (0, epub_daisy_common_1.lazyLoadMediaOverlays)(publication, mo)];
                case 3:
                    _d.sent();
                    return [3, 5];
                case 4:
                    err_14 = _d.sent();
                    return [2, Promise.reject(err_14)];
                case 5:
                    moJsonObj = (0, serializable_1.TaJsonSerialize)(mo);
                    moJsonStr = global.JSON.stringify(moJsonObj, null, "  ");
                    console.log(moJsonStr.substr(0, 1000) + "\n...\n");
                    moReverse = (0, serializable_1.TaJsonDeserialize)(moJsonObj, media_overlay_1.MediaOverlayNode);
                    moJsonObjReverse = (0, serializable_1.TaJsonSerialize)(moReverse);
                    equa = deepEqual(moJsonObj, moJsonObjReverse);
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
                    _d.label = 6;
                case 6:
                    _i++;
                    return [3, 1];
                case 7: return [2];
            }
        });
    });
}
//# sourceMappingURL=cli.js.map