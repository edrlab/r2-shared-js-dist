"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const publication_link_1 = require("../src/models/publication-link");
const lcp_1 = require("r2-lcp-js/dist/es8-es2017/src/parser/epub/lcp");
const ava_1 = require("ava");
const ta_json_x_1 = require("ta-json-x");
const init_globals_1 = require("../src/init-globals");
const helpers_1 = require("./helpers");
init_globals_1.initGlobalConverters_SHARED();
init_globals_1.initGlobalConverters_GENERIC();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
const relStr1 = "rel1";
const relStr2 = "rel2";
ava_1.test("JSON SERIALIZE: Publication Link.Rel => string[]", (t) => {
    const link = new publication_link_1.Link();
    link.AddRel(relStr1);
    link.AddRel(relStr2);
    helpers_1.inspect(link);
    const json = ta_json_x_1.JSON.serialize(link);
    helpers_1.logJSON(json);
    helpers_1.checkType_Array(t, json.rel);
    t.is(json.rel.length, 2);
    helpers_1.checkType_String(t, json.rel[0]);
    t.is(json.rel[0], relStr1);
    helpers_1.checkType_String(t, json.rel[1]);
    t.is(json.rel[1], relStr2);
});
ava_1.test("JSON SERIALIZE: Publication Link.Rel => string", (t) => {
    const link = new publication_link_1.Link();
    link.AddRel(relStr1);
    helpers_1.inspect(link);
    const json = ta_json_x_1.JSON.serialize(link);
    helpers_1.logJSON(json);
    helpers_1.checkType_String(t, json.rel);
    t.is(json.rel, relStr1);
});
ava_1.test("JSON DESERIALIZE: Publication Link.Rel => string[]", (t) => {
    const json = {};
    json.rel = [relStr1, relStr2];
    helpers_1.logJSON(json);
    const link = ta_json_x_1.JSON.deserialize(json, publication_link_1.Link);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 2);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
    helpers_1.checkType_String(t, link.Rel[1]);
    t.is(link.Rel[1], relStr2);
});
ava_1.test("JSON DESERIALIZE: Publication Link.Rel => string[1]", (t) => {
    const json = {};
    json.rel = [relStr1];
    helpers_1.logJSON(json);
    const link = ta_json_x_1.JSON.deserialize(json, publication_link_1.Link);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 1);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
});
ava_1.test("JSON DESERIALIZE: Publication Link.Rel => string", (t) => {
    const json = {};
    json.rel = relStr1;
    helpers_1.logJSON(json);
    const link = ta_json_x_1.JSON.deserialize(json, publication_link_1.Link);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 1);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
});
//# sourceMappingURL=test-JSON-Rel.js.map