"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const path = require("path");
const publication_link_1 = require("../src/models/publication-link");
const lcp_1 = require("r2-lcp-js/dist/es7-es2016/src/parser/epub/lcp");
const serializable_1 = require("r2-lcp-js/dist/es7-es2016/src/serializable");
const init_globals_1 = require("../src/init-globals");
const helpers_1 = require("./helpers");
(0, init_globals_1.initGlobalConverters_SHARED)();
(0, init_globals_1.initGlobalConverters_GENERIC)();
(0, lcp_1.setLcpNativePluginPath)(path.join(process.cwd(), "LCP", "lcp.node"));
const relStr1 = "rel1";
const relStr2 = "rel2";
(0, ava_1.default)("JSON SERIALIZE: Publication Link.Rel => string[]", (t) => {
    const link = new publication_link_1.Link();
    link.AddRel(relStr1);
    link.AddRel(relStr2);
    (0, helpers_1.inspect)(link);
    const json = (0, serializable_1.TaJsonSerialize)(link);
    (0, helpers_1.logJSON)(json);
    (0, helpers_1.checkType_Array)(t, json.rel);
    const arr = json.rel;
    t.is(arr.length, 2);
    (0, helpers_1.checkType_String)(t, arr[0]);
    t.is(arr[0], relStr1);
    (0, helpers_1.checkType_String)(t, arr[1]);
    t.is(arr[1], relStr2);
});
(0, ava_1.default)("JSON SERIALIZE: Publication Link.Rel => string", (t) => {
    const link = new publication_link_1.Link();
    link.AddRel(relStr1);
    (0, helpers_1.inspect)(link);
    const json = (0, serializable_1.TaJsonSerialize)(link);
    (0, helpers_1.logJSON)(json);
    (0, helpers_1.checkType_String)(t, json.rel);
    t.is(json.rel, relStr1);
});
(0, ava_1.default)("JSON DESERIALIZE: Publication Link.Rel => string[]", (t) => {
    const json = {};
    json.rel = [relStr1, relStr2];
    (0, helpers_1.logJSON)(json);
    const link = (0, serializable_1.TaJsonDeserialize)(json, publication_link_1.Link);
    (0, helpers_1.inspect)(link);
    (0, helpers_1.checkType_Array)(t, link.Rel);
    t.is(link.Rel.length, 2);
    (0, helpers_1.checkType_String)(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
    (0, helpers_1.checkType_String)(t, link.Rel[1]);
    t.is(link.Rel[1], relStr2);
});
(0, ava_1.default)("JSON DESERIALIZE: Publication Link.Rel => string[1]", (t) => {
    const json = {};
    json.rel = [relStr1];
    (0, helpers_1.logJSON)(json);
    const link = (0, serializable_1.TaJsonDeserialize)(json, publication_link_1.Link);
    (0, helpers_1.inspect)(link);
    (0, helpers_1.checkType_Array)(t, link.Rel);
    t.is(link.Rel.length, 1);
    (0, helpers_1.checkType_String)(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
});
(0, ava_1.default)("JSON DESERIALIZE: Publication Link.Rel => string", (t) => {
    const json = {};
    json.rel = relStr1;
    (0, helpers_1.logJSON)(json);
    const link = (0, serializable_1.TaJsonDeserialize)(json, publication_link_1.Link);
    (0, helpers_1.inspect)(link);
    (0, helpers_1.checkType_Array)(t, link.Rel);
    t.is(link.Rel.length, 1);
    (0, helpers_1.checkType_String)(t, link.Rel[0]);
    t.is(link.Rel[0], relStr1);
});
//# sourceMappingURL=test-JSON-Rel.js.map