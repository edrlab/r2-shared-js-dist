"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const publication_parser_1 = require("../parser/publication-parser");
const lcp_1 = require("r2-lcp-js/dist/es6-es2015/src/parser/epub/lcp");
const transformer_1 = require("../transform/transformer");
const BufferUtils_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/stream/BufferUtils");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const ta_json_x_1 = require("ta-json-x");
const util = require("util");
const init_globals_1 = require("../init-globals");
init_globals_1.initGlobalConverters_SHARED();
init_globals_1.initGlobalConverters_GENERIC();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
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
const isHTTP = filePath.startsWith("http");
if (!isHTTP) {
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
const fileName = path.basename(filePath);
const ext = path.extname(fileName).toLowerCase();
const isEPUBPacked = /\.epub[3]?$/.test(ext);
const isEPUBExploded = isHTTP ? false : fs.existsSync(path.join(filePath, "META-INF", "container.xml"));
const isEPUB = isEPUBPacked || isEPUBExploded;
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
    const fileNameNoExt = fileName + "_R2_EXTRACTED";
    console.log(fileNameNoExt);
    outputDirPath = path.join(dirPath, fileNameNoExt);
    console.log(outputDirPath);
    if (fs.existsSync(outputDirPath)) {
        console.log("OUTPUT FOLDER ALREADY EXISTS!");
        process.exit(1);
    }
}
let decryptKeys;
if (args[2]) {
    decryptKeys = args[2].trim().split(";");
}
(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let publication;
    try {
        publication = yield publication_parser_1.PublicationParsePromise(filePath);
    }
    catch (err) {
        console.log("== Publication Parser: reject");
        console.log(err);
        return;
    }
    if (isEPUB) {
        if (outputDirPath) {
            try {
                yield extractEPUB(publication, outputDirPath, decryptKeys);
            }
            catch (err) {
                console.log("== Publication extract FAIL");
                console.log(err);
                return;
            }
        }
    }
    else if (ext === ".cbz") {
        dumpPublication(publication);
    }
}))();
function extractEPUB_ManifestJSON(pub, outDir) {
    const manifestJson = ta_json_x_1.JSON.serialize(pub);
    const arrLinks = [];
    if (manifestJson.readingOrder) {
        arrLinks.push(...manifestJson.readingOrder);
    }
    if (manifestJson.resources) {
        arrLinks.push(...manifestJson.resources);
    }
    arrLinks.forEach((link) => {
        if (link.properties && link.properties.encrypted) {
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
        const zipEntries = yield zip.getEntries();
        for (const zipEntry of zipEntries) {
            if (zipEntry !== "mimetype" && !zipEntry.startsWith("META-INF/") && !zipEntry.endsWith(".opf") &&
                zipEntry !== ".DS_Store") {
                const expectedOutputPath = path.join(outDir, zipEntry);
                if (!fs.existsSync(expectedOutputPath)) {
                    console.log("Zip entry not extracted??");
                    console.log(expectedOutputPath);
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
        const pathInZip = link.Href;
        console.log("===== " + pathInZip);
        let zipStream_;
        try {
            zipStream_ = yield zip.entryStreamPromise(pathInZip);
        }
        catch (err) {
            console.log(pathInZip);
            console.log(err);
            return;
        }
        let transformedStream;
        try {
            transformedStream = yield transformer_1.Transformers.tryStream(pub, link, zipStream_, false, 0, 0);
        }
        catch (err) {
            console.log(pathInZip);
            console.log(err);
            return;
        }
        zipStream_ = transformedStream;
        let zipData;
        try {
            zipData = yield BufferUtils_1.streamToBufferPromise(zipStream_.stream);
        }
        catch (err) {
            console.log(pathInZip);
            console.log(err);
            return;
        }
        const linkOutputPath = path.join(outDir, pathInZip);
        ensureDirs(linkOutputPath);
        fs.writeFileSync(linkOutputPath, zipData);
    });
}
function extractEPUB(pub, outDir, keys) {
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
        fs.mkdirSync(outDir);
        extractEPUB_ManifestJSON(pub, outDir);
        const links = [];
        if (pub.Resources) {
            links.push(...pub.Resources);
        }
        if (pub.Spine) {
            links.push(...pub.Spine);
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
function ensureDirs(fspath) {
    const dirname = path.dirname(fspath);
    if (!fs.existsSync(dirname)) {
        ensureDirs(dirname);
        fs.mkdirSync(dirname);
    }
}
function dumpPublication(publication) {
    console.log("#### RAW OBJECT:");
    console.log(util.inspect(publication, { showHidden: false, depth: 1000, colors: true, customInspect: true }));
}
//# sourceMappingURL=cli.js.map