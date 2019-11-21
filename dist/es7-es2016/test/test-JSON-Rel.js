"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const path = require("path");
const publication_link_1 = require("../src/models/publication-link");
const lcp_1 = require("r2-lcp-js/dist/es7-es2016/src/parser/epub/lcp");
const serializable_1 = require("r2-lcp-js/dist/es7-es2016/src/serializable");
const init_globals_1 = require("../src/init-globals");
const helpers_1 = require("./helpers");
init_globals_1.initGlobalConverters_SHARED();
init_globals_1.initGlobalConverters_GENERIC();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
const relStr1 = "rel1";
const relStr2 = "rel2";
ava_1.default("JSON SERIALIZE: Publication Link.Rel => string[]", (t) => {
    const link = new publication_link_1.Link();
    link.AddRel(relStr1);
    link.AddRel(relStr2);
    helpers_1.inspect(link);
    const json = serializable_1.TaJsonSerialize(link);
    helpers_1.logJSON(json);
    helpers_1.checkType_Array(t, json.rel);
    const arr = json.rel;
    t.is(arr.length, 2);
    helpers_1.checkType_String(t, arr[0]);
    t.is(arr[0], relStr1);
    helpers_1.checkType_String(t, arr[1]);
    t.is(arr[1], relStr2);
});
ava_1.default("JSON SERIALIZE: Publication Link.Rel => string", (t) => {
    const link = new publication_link_1.Link();
    link.AddRel(relStr1);
    helpers_1.inspect(link);
    const json = serializable_1.TaJsonSerialize(link);
    helpers_1.logJSON(json);
    helpers_1.checkType_String(t, json.rel);
    t.is(json.rel, relStr1);
});
ava_1.default("JSON DESERIALIZE: Publication Link.Rel => string[]", (t) => {
    const json = {};
    json.rel = [relStr1, relStr2];
    helpers_1.logJSON(json);
    const link = serializable_1.TaJsonDeserialize(json, publication_link_1.Link);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 2);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
    helpers_1.checkType_String(t, link.Rel[1]);
    t.is(link.Rel[1], relStr2);
});
ava_1.default("JSON DESERIALIZE: Publication Link.Rel => string[1]", (t) => {
    const json = {};
    json.rel = [relStr1];
    helpers_1.logJSON(json);
    const link = serializable_1.TaJsonDeserialize(json, publication_link_1.Link);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 1);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
});
ava_1.default("JSON DESERIALIZE: Publication Link.Rel => string", (t) => {
    const json = {};
    json.rel = relStr1;
    helpers_1.logJSON(json);
    const link = serializable_1.TaJsonDeserialize(json, publication_link_1.Link);
    helpers_1.inspect(link);
    helpers_1.checkType_Array(t, link.Rel);
    t.is(link.Rel.length, 1);
    helpers_1.checkType_String(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
});
//# sourceMappingURL=test-JSON-Rel.js.map