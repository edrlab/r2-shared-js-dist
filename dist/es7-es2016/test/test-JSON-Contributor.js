"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const metadata_1 = require("../src/models/metadata");
const metadata_contributor_1 = require("../src/models/metadata-contributor");
const lcp_1 = require("r2-lcp-js/dist/es7-es2016/src/parser/epub/lcp");
const ava_1 = require("ava");
const ta_json_x_1 = require("ta-json-x");
const init_globals_1 = require("../src/init-globals");
const helpers_1 = require("./helpers");
init_globals_1.initGlobalConverters_SHARED();
init_globals_1.initGlobalConverters_GENERIC();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
const contributor1NameStr = "theName1";
const contributor1Id = "theID1";
const contributor1Pos = 1;
const contributor1 = new metadata_contributor_1.Contributor();
contributor1.Name = contributor1NameStr;
contributor1.Identifier = contributor1Id;
contributor1.Position = contributor1Pos;
const contributor1RoleArr = ["theRole1-A", "theRole1-B"];
contributor1.Role = contributor1RoleArr;
const contributor2NameMapLang = "en";
const contributor2NameMapVal = "theName2";
const contributor2NameMap = {};
contributor2NameMap[contributor2NameMapLang] = contributor2NameMapVal;
const contributor2NameObj = { name: contributor2NameMap };
const contributor2Id = "theID2";
const contributor2 = new metadata_contributor_1.Contributor();
contributor2.Name = contributor2NameMap;
contributor2.Identifier = contributor2Id;
const contributor2RoleStr = "theRole2";
contributor2.Role = [contributor2RoleStr];
const checkContributor1Name = (t, obj) => {
    helpers_1.checkType_String(t, obj);
    t.is(obj, contributor1NameStr);
};
const checkContributor2Name = (t, obj) => {
    helpers_1.checkType_Object(t, obj);
    helpers_1.checkType_String(t, obj[contributor2NameMapLang]);
    t.is(obj[contributor2NameMapLang], contributor2NameMapVal);
};
const checkJsonContributor1 = (t, obj) => {
    helpers_1.checkType_Object(t, obj);
    checkContributor1Name(t, obj.name);
    helpers_1.checkType_String(t, obj.identifier);
    t.is(obj.identifier, contributor1Id);
    helpers_1.checkType_Number(t, obj.position);
    t.is(obj.position, contributor1Pos);
    helpers_1.checkType_Array(t, obj.role);
    t.is(obj.role.length, contributor1RoleArr.length);
    t.is(obj.role[0], contributor1RoleArr[0]);
    t.is(obj.role[1], contributor1RoleArr[1]);
};
const checkJsonContributor2 = (t, obj) => {
    helpers_1.checkType_Object(t, obj);
    checkContributor2Name(t, obj.name);
    helpers_1.checkType_String(t, obj.identifier);
    t.is(obj.identifier, contributor2Id);
    helpers_1.checkType_String(t, obj.role);
    t.is(obj.role, contributor2RoleStr);
};
const checkObjContributor1 = (t, obj) => {
    helpers_1.checkType(t, obj, metadata_contributor_1.Contributor);
    checkContributor1Name(t, obj.Name);
    helpers_1.checkType_String(t, obj.Identifier);
    t.is(obj.Identifier, contributor1Id);
    helpers_1.checkType_Number(t, obj.Position);
    t.is(obj.Position, contributor1Pos);
    helpers_1.checkType_Array(t, obj.Role);
    t.is(obj.Role.length, 2);
    t.is(obj.Role[0], contributor1RoleArr[0]);
    t.is(obj.Role[1], contributor1RoleArr[1]);
};
const checkObjContributor2 = (t, obj) => {
    helpers_1.checkType(t, obj, metadata_contributor_1.Contributor);
    checkContributor2Name(t, obj.Name);
    helpers_1.checkType_String(t, obj.Identifier);
    t.is(obj.Identifier, contributor2Id);
    helpers_1.checkType_Array(t, obj.Role);
    t.is(obj.Role.length, 1);
    t.is(obj.Role[0], contributor2RoleStr);
};
ava_1.default("JSON SERIALIZE: Metadata.Imprint => Contributor[]", (t) => {
    const b = new metadata_1.Metadata();
    b.Imprint = [];
    b.Imprint.push(contributor1);
    b.Imprint.push(contributor2);
    helpers_1.inspect(b);
    const json = ta_json_x_1.JSON.serialize(b);
    helpers_1.logJSON(json);
    helpers_1.checkType_Array(t, json.imprint);
    t.is(json.imprint.length, 2);
    checkJsonContributor1(t, json.imprint[0]);
    checkJsonContributor2(t, json.imprint[1]);
});
ava_1.default("JSON SERIALIZE: Metadata.Imprint => Contributor[1] collapse-array", (t) => {
    const b = new metadata_1.Metadata();
    b.Imprint = [contributor1];
    helpers_1.inspect(b);
    const json = ta_json_x_1.JSON.serialize(b);
    helpers_1.logJSON(json);
    checkJsonContributor1(t, json.imprint);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => Contributor[]", (t) => {
    const json = {};
    json.imprint = [
        { name: contributor1NameStr, identifier: contributor1Id, position: contributor1Pos, role: contributor1RoleArr },
        { name: contributor2NameMap, identifier: contributor2Id, role: contributor2RoleStr },
    ];
    helpers_1.logJSON(json);
    const b = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 2);
    checkObjContributor1(t, b.Imprint[0]);
    checkObjContributor2(t, b.Imprint[1]);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => Contributor[1]", (t) => {
    const json = {};
    json.imprint = [
        { name: contributor1NameStr, identifier: contributor1Id, position: contributor1Pos, role: contributor1RoleArr },
    ];
    helpers_1.logJSON(json);
    const b = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 1);
    checkObjContributor1(t, b.Imprint[0]);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => Contributor", (t) => {
    const json = {};
    json.imprint = { name: contributor1NameStr, identifier: contributor1Id, position: contributor1Pos, role: contributor1RoleArr };
    helpers_1.logJSON(json);
    const b = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 1);
    checkObjContributor1(t, b.Imprint[0]);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => Contributor NAME []", (t) => {
    const json = {};
    json.imprint = [contributor1NameStr, contributor2NameObj];
    helpers_1.logJSON(json);
    const b = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 2);
    helpers_1.checkType(t, b.Imprint[0], metadata_contributor_1.Contributor);
    checkContributor1Name(t, b.Imprint[0].Name);
    helpers_1.checkType(t, b.Imprint[1], metadata_contributor_1.Contributor);
    checkContributor2Name(t, b.Imprint[1].Name);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => Contributor NAME [1] A", (t) => {
    const json = {};
    json.imprint = [contributor1NameStr];
    helpers_1.logJSON(json);
    const b = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 1);
    helpers_1.checkType(t, b.Imprint[0], metadata_contributor_1.Contributor);
    checkContributor1Name(t, b.Imprint[0].Name);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => Contributor NAME [1] B", (t) => {
    const json = {};
    json.imprint = [contributor2NameObj];
    helpers_1.logJSON(json);
    const b = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 1);
    helpers_1.checkType(t, b.Imprint[0], metadata_contributor_1.Contributor);
    checkContributor2Name(t, b.Imprint[0].Name);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => Contributor NAME A", (t) => {
    const json = {};
    json.imprint = contributor1NameStr;
    helpers_1.logJSON(json);
    const b = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 1);
    helpers_1.checkType(t, b.Imprint[0], metadata_contributor_1.Contributor);
    checkContributor1Name(t, b.Imprint[0].Name);
});
ava_1.default("JSON DESERIALIZE: Metadata.Imprint => Contributor NAME B", (t) => {
    const json = {};
    json.imprint = contributor2NameObj;
    helpers_1.logJSON(json);
    const b = ta_json_x_1.JSON.deserialize(json, metadata_1.Metadata);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Imprint);
    t.is(b.Imprint.length, 1);
    helpers_1.checkType(t, b.Imprint[0], metadata_contributor_1.Contributor);
    checkContributor2Name(t, b.Imprint[0].Name);
});
//# sourceMappingURL=test-JSON-Contributor.js.map