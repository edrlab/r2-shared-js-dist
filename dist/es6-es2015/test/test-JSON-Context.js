"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const publication_1 = require("../src/models/publication");
const lcp_1 = require("r2-lcp-js/dist/es6-es2015/src/parser/epub/lcp");
const ava_1 = require("ava");
const ta_json_1 = require("ta-json");
const init_globals_1 = require("../src/init-globals");
const helpers_1 = require("./helpers");
init_globals_1.initGlobalConverters_GENERIC();
init_globals_1.initGlobalConverters_SHARED();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
const contextStr1 = "http://context1";
const contextStr2 = "http://context2";
ava_1.test("JSON SERIALIZE: Publication.Context => string[]", (t) => {
    const pub = new publication_1.Publication();
    pub.Context = [];
    pub.Context.push(contextStr1);
    pub.Context.push(contextStr2);
    helpers_1.inspect(pub);
    const json = ta_json_1.JSON.serialize(pub);
    helpers_1.logJSON(json);
    helpers_1.checkType_Array(t, json["@context"]);
    t.is(json["@context"].length, 2);
    helpers_1.checkType_String(t, json["@context"][0]);
    t.is(json["@context"][0], contextStr1);
    helpers_1.checkType_String(t, json["@context"][1]);
    t.is(json["@context"][1], contextStr2);
});
ava_1.test("JSON SERIALIZE: Publication.Context => string[1] NO collapse-array", (t) => {
    const pub = new publication_1.Publication();
    pub.Context = [contextStr1];
    helpers_1.inspect(pub);
    const json = ta_json_1.JSON.serialize(pub);
    helpers_1.logJSON(json);
    helpers_1.checkType_Array(t, json["@context"]);
    t.is(json["@context"][0], contextStr1);
});
ava_1.test("JSON DESERIALIZE: Publication.Context => string[]", (t) => {
    const json = {};
    json["@context"] = [contextStr1, contextStr2];
    helpers_1.logJSON(json);
    const pub = ta_json_1.JSON.deserialize(json, publication_1.Publication);
    helpers_1.inspect(pub);
    helpers_1.checkType_Array(t, pub.Context);
    t.is(pub.Context.length, 2);
    helpers_1.checkType_String(t, pub.Context[0]);
    t.is(pub.Context[0], contextStr1);
    helpers_1.checkType_String(t, pub.Context[1]);
    t.is(pub.Context[1], contextStr2);
});
ava_1.test("JSON DESERIALIZE: Publication.Context => string[1]", (t) => {
    const json = {};
    json["@context"] = [contextStr1];
    helpers_1.logJSON(json);
    const pub = ta_json_1.JSON.deserialize(json, publication_1.Publication);
    helpers_1.inspect(pub);
    helpers_1.checkType_Array(t, pub.Context);
    t.is(pub.Context.length, 1);
    helpers_1.checkType_String(t, pub.Context[0]);
    t.is(pub.Context[0], contextStr1);
});
//# sourceMappingURL=test-JSON-Context.js.map