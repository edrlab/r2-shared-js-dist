"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const metadata_1 = require("../src/models/metadata");
const metadata_contributor_1 = require("../src/models/metadata-contributor");
const lcp_1 = require("r2-lcp-js/dist/es6-es2015/src/parser/epub/lcp");
const ava_1 = require("ava");
const ta_json_x_1 = require("ta-json-x");
const init_globals_1 = require("../src/init-globals");
const helpers_1 = require("./helpers");
init_globals_1.initGlobalConverters_SHARED();
init_globals_1.initGlobalConverters_GENERIC();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
const contName1 = "theName1";
const contRole1 = "theRole1";
const cont1 = new metadata_contributor_1.Contributor();
cont1.Name = contName1;
cont1.Role = contRole1;
const contName2 = "theName2";
const contRole2 = "theRole2";
const cont2 = new metadata_contributor_1.Contributor();
cont2.Name = contName2;
cont2.Role = contRole2;
ava_1.default("JSON SERIALIZE: Metadata.Imprint => Contributor[]", (t) => {
    const md = new metadata_1.Metadata();
    md.Imprint = [];
    md.Imprint.push(cont1);
    md.Imprint.push(cont2);
    helpers_1.inspect(md);
    const json = ta_json_x_1.JSON.serialize(md);
    helpers_1.logJSON(json);
    helpers_1.checkType_Array(t, json.imprint);
    t.is(json.imprint.length, 2);
    helpers_1.checkType_Object(t, json.imprint[0]);
    helpers_1.checkType_String(t, json.imprint[0].name);
    t.is(json.imprint[0].name, contName1);
    helpers_1.checkType_String(t, json.imprint[0].role);
    t.is(json.imprint[0].role, contRole1);
    helpers_1.checkType_Object(t, json.imprint[1]);
    helpers_1.checkType_String(t, json.imprint[1].name);
    t.is(json.imprint[1].name, contName2);
    helpers_1.checkType_String(t, json.imprint[1].role);
    t.is(json.imprint[1].role, contRole2);
});
ava_1.default("JSON SERIALIZE: Metadata.Imprint => Contributor[1] collapse-array", (t) => {
    const md = new metadata_1.Metadata();
    md.Imprint = [cont1];
    helpers_1.inspect(md);
    const json = ta_json_x_1.JSON.serialize(md);
    helpers_1.logJSON(json);
    helpers_1.checkType_Object(t, json.imprint);
    helpers_1.checkType_String(t, json.imprint.name);
    t.is(json.imprint.name, contName1);
    helpers_1.checkType_String(t, json.imprint.role);
    t.is(json.imprint.role, contRole1);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => Contributor[]", (t) => {
    const json = {};
    json.imprint = [{ name: contName1, role: contRole1 }, { name: contName2, role: contRole2 }];
    helpers_1.logJSON(json);
    const md = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(md);
    helpers_1.checkType_Array(t, md.Imprint);
    t.is(md.Imprint.length, 2);
    helpers_1.checkType(t, md.Imprint[0], metadata_contributor_1.Contributor);
    helpers_1.checkType_String(t, md.Imprint[0].Name);
    t.is(md.Imprint[0].Name, contName1);
    helpers_1.checkType_String(t, md.Imprint[0].Role);
    t.is(md.Imprint[0].Role, contRole1);
    helpers_1.checkType(t, md.Imprint[1], metadata_contributor_1.Contributor);
    helpers_1.checkType_String(t, md.Imprint[1].Name);
    t.is(md.Imprint[1].Name, contName2);
    helpers_1.checkType_String(t, md.Imprint[1].Role);
    t.is(md.Imprint[1].Role, contRole2);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => Contributor[1]", (t) => {
    const json = {};
    json.imprint = [{ name: contName1, role: contRole1 }];
    helpers_1.logJSON(json);
    const md = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(md);
    helpers_1.checkType_Array(t, md.Imprint);
    t.is(md.Imprint.length, 1);
    helpers_1.checkType(t, md.Imprint[0], metadata_contributor_1.Contributor);
    helpers_1.checkType_String(t, md.Imprint[0].Name);
    t.is(md.Imprint[0].Name, contName1);
    helpers_1.checkType_String(t, md.Imprint[0].Role);
    t.is(md.Imprint[0].Role, contRole1);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => Contributor", (t) => {
    const json = {};
    json.imprint = { name: contName2, role: contRole2 };
    helpers_1.logJSON(json);
    const md = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(md);
    helpers_1.checkType_Array(t, md.Imprint);
    t.is(md.Imprint.length, 1);
    helpers_1.checkType(t, md.Imprint[0], metadata_contributor_1.Contributor);
    helpers_1.checkType_String(t, md.Imprint[0].Name);
    t.is(md.Imprint[0].Name, contName2);
    helpers_1.checkType_String(t, md.Imprint[0].Role);
    t.is(md.Imprint[0].Role, contRole2);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => ContributorSTR[]", (t) => {
    const json = {};
    json.imprint = [contName1, contName2];
    helpers_1.logJSON(json);
    const md = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(md);
    helpers_1.checkType_Array(t, md.Imprint);
    t.is(md.Imprint.length, 2);
    helpers_1.checkType(t, md.Imprint[0], metadata_contributor_1.Contributor);
    helpers_1.checkType_String(t, md.Imprint[0].Name);
    t.is(md.Imprint[0].Name, contName1);
    helpers_1.checkType(t, md.Imprint[1], metadata_contributor_1.Contributor);
    helpers_1.checkType_String(t, md.Imprint[1].Name);
    t.is(md.Imprint[1].Name, contName2);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => ContributorSTR[1]", (t) => {
    const json = {};
    json.imprint = [contName1];
    helpers_1.logJSON(json);
    const md = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(md);
    helpers_1.checkType_Array(t, md.Imprint);
    t.is(md.Imprint.length, 1);
    helpers_1.checkType(t, md.Imprint[0], metadata_contributor_1.Contributor);
    helpers_1.checkType_String(t, md.Imprint[0].Name);
    t.is(md.Imprint[0].Name, contName1);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => ContributorSTR", (t) => {
    const json = {};
    json.imprint = contName2;
    helpers_1.logJSON(json);
    const md = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(md);
    helpers_1.checkType_Array(t, md.Imprint);
    t.is(md.Imprint.length, 1);
    helpers_1.checkType(t, md.Imprint[0], metadata_contributor_1.Contributor);
    helpers_1.checkType_String(t, md.Imprint[0].Name);
    t.is(md.Imprint[0].Name, contName2);
});
//# sourceMappingURL=test-JSON-Contributor.js.map