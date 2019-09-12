"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ava_1 = require("ava");
var path = require("path");
var ta_json_x_1 = require("ta-json-x");
var publication_1 = require("../src/models/publication");
var lcp_1 = require("r2-lcp-js/dist/es5/src/parser/epub/lcp");
var init_globals_1 = require("../src/init-globals");
var helpers_1 = require("./helpers");
init_globals_1.initGlobalConverters_SHARED();
init_globals_1.initGlobalConverters_GENERIC();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
var contextStr1 = "http://context1";
var contextStr2 = "http://context2";
ava_1.default("JSON SERIALIZE: Publication.Context => string[]", function (t) {
    var pub = new publication_1.Publication();
    pub.Context = [];
    pub.Context.push(contextStr1);
    pub.Context.push(contextStr2);
    helpers_1.inspect(pub);
    var json = ta_json_x_1.JSON.serialize(pub);
    helpers_1.logJSON(json);
    helpers_1.checkType_Array(t, json["@context"]);
    t.is(json["@context"].length, 2);
    helpers_1.checkType_String(t, json["@context"][0]);
    t.is(json["@context"][0], contextStr1);
    helpers_1.checkType_String(t, json["@context"][1]);
    t.is(json["@context"][1], contextStr2);
});
ava_1.default("JSON SERIALIZE: Publication.Context => string[1] collapse-array", function (t) {
    var pub = new publication_1.Publication();
    pub.Context = [contextStr1];
    helpers_1.inspect(pub);
    var json = ta_json_x_1.JSON.serialize(pub);
    helpers_1.logJSON(json);
    helpers_1.checkType_String(t, json["@context"]);
    t.is(json["@context"], contextStr1);
});
ava_1.default("JSON DESERIALIZE: Publication.Context => string[]", function (t) {
    var json = {};
    json["@context"] = [contextStr1, contextStr2];
    helpers_1.logJSON(json);
    var pub = ta_json_x_1.JSON.deserialize(json, publication_1.Publication);
    helpers_1.inspect(pub);
    helpers_1.checkType_Array(t, pub.Context);
    t.is(pub.Context.length, 2);
    helpers_1.checkType_String(t, pub.Context[0]);
    t.is(pub.Context[0], contextStr1);
    helpers_1.checkType_String(t, pub.Context[1]);
    t.is(pub.Context[1], contextStr2);
});
ava_1.default("JSON DESERIALIZE: Publication.Context => string[1]", function (t) {
    var json = {};
    json["@context"] = [contextStr1];
    helpers_1.logJSON(json);
    var pub = ta_json_x_1.JSON.deserialize(json, publication_1.Publication);
    helpers_1.inspect(pub);
    helpers_1.checkType_Array(t, pub.Context);
    t.is(pub.Context.length, 1);
    helpers_1.checkType_String(t, pub.Context[0]);
    t.is(pub.Context[0], contextStr1);
});
ava_1.default("JSON DESERIALIZE: Publication.Context => string", function (t) {
    var json = {};
    json["@context"] = contextStr1;
    helpers_1.logJSON(json);
    var pub = ta_json_x_1.JSON.deserialize(json, publication_1.Publication);
    helpers_1.inspect(pub);
    helpers_1.checkType_Array(t, pub.Context);
    t.is(pub.Context.length, 1);
    helpers_1.checkType_String(t, pub.Context[0]);
    t.is(pub.Context[0], contextStr1);
});
//# sourceMappingURL=test-JSON-Context.js.map