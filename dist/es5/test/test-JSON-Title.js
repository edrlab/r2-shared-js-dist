"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var metadata_1 = require("../src/models/metadata");
var opds2_publicationMetadata_1 = require("r2-opds-js/dist/es5/src/opds/opds2/opds2-publicationMetadata");
var ava_1 = require("ava");
var ta_json_1 = require("ta-json");
var lcp_1 = require("../src/parser/epub/lcp");
var init_globals_1 = require("../src/init-globals");
var helpers_1 = require("./helpers");
init_globals_1.initGlobals();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
var titleStr1 = "str1";
var titleStr2 = "str2";
var titleLang1 = "lang1";
var titleLang2 = "lang2";
var titleLangStr1 = {};
titleLangStr1[titleLang1] = titleStr1;
titleLangStr1[titleLang2] = titleStr2;
var titleLangStr2 = {};
titleLangStr2[titleLang1] = titleStr2;
titleLangStr2[titleLang2] = titleStr1;
ava_1.test("JSON SERIALIZE: OPDSPublicationMetadata.Title => string", function (t) {
    var md = new opds2_publicationMetadata_1.OPDSPublicationMetadata();
    md.Title = titleStr1;
    helpers_1.inspect(md);
    var json = ta_json_1.JSON.serialize(md);
    helpers_1.logJSON(json);
    helpers_1.checkType_String(t, json.title);
    t.is(json.title, titleStr1);
});
ava_1.test("JSON SERIALIZE: OPDSPublicationMetadata.Title => string-lang", function (t) {
    var md = new opds2_publicationMetadata_1.OPDSPublicationMetadata();
    md.Title = titleLangStr1;
    helpers_1.inspect(md);
    var json = ta_json_1.JSON.serialize(md);
    helpers_1.logJSON(json);
    helpers_1.checkType_Object(t, json.title);
    helpers_1.checkType_String(t, json.title[titleLang1]);
    t.is(json.title[titleLang1], titleStr1);
    helpers_1.checkType_String(t, json.title[titleLang2]);
    t.is(json.title[titleLang2], titleStr2);
});
ava_1.test("JSON DESERIALIZE: OPDSPublicationMetadata.Title => string", function (t) {
    var json = {};
    json.title = titleStr1;
    helpers_1.logJSON(json);
    var md = ta_json_1.JSON.deserialize(json, opds2_publicationMetadata_1.OPDSPublicationMetadata);
    helpers_1.inspect(md);
    helpers_1.checkType_String(t, md.Title);
    t.is(md.Title, titleStr1);
});
ava_1.test("JSON DESERIALIZE: OPDSPublicationMetadata.Title => string-lang", function (t) {
    var json = {};
    json.title = titleLangStr1;
    helpers_1.logJSON(json);
    var md = ta_json_1.JSON.deserialize(json, opds2_publicationMetadata_1.OPDSPublicationMetadata);
    helpers_1.inspect(md);
    helpers_1.checkType_Object(t, md.Title);
    helpers_1.checkType_String(t, md.Title[titleLang1]);
    t.is(md.Title[titleLang1], titleStr1);
    helpers_1.checkType_String(t, md.Title[titleLang2]);
    t.is(md.Title[titleLang2], titleStr2);
});
ava_1.test("JSON SERIALIZE: Metadata.Title => string", function (t) {
    var md = new metadata_1.Metadata();
    md.Title = titleStr1;
    helpers_1.inspect(md);
    var json = ta_json_1.JSON.serialize(md);
    helpers_1.logJSON(json);
    helpers_1.checkType_String(t, json.title);
    t.is(json.title, titleStr1);
});
ava_1.test("JSON SERIALIZE: Metadata.Title => string-lang", function (t) {
    var md = new metadata_1.Metadata();
    md.Title = titleLangStr1;
    helpers_1.inspect(md);
    var json = ta_json_1.JSON.serialize(md);
    helpers_1.logJSON(json);
    helpers_1.checkType_Object(t, json.title);
    helpers_1.checkType_String(t, json.title[titleLang1]);
    t.is(json.title[titleLang1], titleStr1);
    helpers_1.checkType_String(t, json.title[titleLang2]);
    t.is(json.title[titleLang2], titleStr2);
});
ava_1.test("JSON DESERIALIZE: Metadata.Title => string", function (t) {
    var json = {};
    json.title = titleStr1;
    helpers_1.logJSON(json);
    var md = ta_json_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(md);
    helpers_1.checkType_String(t, md.Title);
    t.is(md.Title, titleStr1);
});
ava_1.test("JSON DESERIALIZE: Metadata.Title => string-lang", function (t) {
    var json = {};
    json.title = titleLangStr1;
    helpers_1.logJSON(json);
    var md = ta_json_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(md);
    helpers_1.checkType_Object(t, md.Title);
    helpers_1.checkType_String(t, md.Title[titleLang1]);
    t.is(md.Title[titleLang1], titleStr1);
    helpers_1.checkType_String(t, md.Title[titleLang2]);
    t.is(md.Title[titleLang2], titleStr2);
});
//# sourceMappingURL=test-JSON-Title.js.map