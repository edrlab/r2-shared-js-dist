"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var metadata_belongsto_1 = require("../src/models/metadata-belongsto");
var metadata_collection_1 = require("../src/models/metadata-collection");
var lcp_1 = require("r2-lcp-js/dist/es5/src/parser/epub/lcp");
var ava_1 = require("ava");
var ta_json_1 = require("ta-json");
var init_globals_1 = require("../src/init-globals");
var helpers_1 = require("./helpers");
init_globals_1.initGlobalConverters_GENERIC();
init_globals_1.initGlobalConverters_SHARED();
lcp_1.setLcpNativePluginPath(path.join(process.cwd(), "LCP", "lcp.node"));
var colName1 = "theName1";
var colID1 = "theID1";
var col1 = new metadata_collection_1.Collection();
col1.Name = colName1;
col1.Identifier = colID1;
var colName2 = "theName2";
var colID2 = "theID2";
var col2 = new metadata_collection_1.Collection();
col2.Name = colName2;
col2.Identifier = colID2;
ava_1.test("JSON SERIALIZE: BelongsTo.Series => Collection[]", function (t) {
    var b = new metadata_belongsto_1.BelongsTo();
    b.Series = [];
    b.Series.push(col1);
    b.Series.push(col2);
    helpers_1.inspect(b);
    var json = ta_json_1.JSON.serialize(b);
    helpers_1.logJSON(json);
    helpers_1.checkType_Array(t, json.series);
    t.is(json.series.length, 2);
    helpers_1.checkType_Object(t, json.series[0]);
    helpers_1.checkType_String(t, json.series[0].name);
    t.is(json.series[0].name, colName1);
    helpers_1.checkType_String(t, json.series[0].identifier);
    t.is(json.series[0].identifier, colID1);
    helpers_1.checkType_Object(t, json.series[1]);
    helpers_1.checkType_String(t, json.series[1].name);
    t.is(json.series[1].name, colName2);
    helpers_1.checkType_String(t, json.series[1].identifier);
    t.is(json.series[1].identifier, colID2);
});
ava_1.test("JSON SERIALIZE: BelongsTo.Series => Collection[1] collapse-array", function (t) {
    var b = new metadata_belongsto_1.BelongsTo();
    b.Series = [col1];
    helpers_1.inspect(b);
    var json = ta_json_1.JSON.serialize(b);
    helpers_1.logJSON(json);
    helpers_1.checkType_Object(t, json.series);
    helpers_1.checkType_String(t, json.series.name);
    t.is(json.series.name, colName1);
    helpers_1.checkType_String(t, json.series.identifier);
    t.is(json.series.identifier, colID1);
});
ava_1.test("JSON DESERIALIZE: BelongsTo.Series => Collection[]", function (t) {
    var json = {};
    json.series = [{ name: colName1, identifier: colID1 }, { name: colName2, identifier: colID2 }];
    helpers_1.logJSON(json);
    var b = ta_json_1.JSON.deserialize(json, metadata_belongsto_1.BelongsTo);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Series);
    t.is(b.Series.length, 2);
    helpers_1.checkType(t, b.Series[0], metadata_collection_1.Collection);
    helpers_1.checkType_String(t, b.Series[0].Name);
    t.is(b.Series[0].Name, colName1);
    helpers_1.checkType_String(t, b.Series[0].Identifier);
    t.is(b.Series[0].Identifier, colID1);
    helpers_1.checkType(t, b.Series[1], metadata_collection_1.Collection);
    helpers_1.checkType_String(t, b.Series[1].Name);
    t.is(b.Series[1].Name, colName2);
    helpers_1.checkType_String(t, b.Series[1].Identifier);
    t.is(b.Series[1].Identifier, colID2);
});
ava_1.test("JSON DESERIALIZE: BelongsTo.Series => Collection[1]", function (t) {
    var json = {};
    json.series = [{ name: colName1, identifier: colID1 }];
    helpers_1.logJSON(json);
    var b = ta_json_1.JSON.deserialize(json, metadata_belongsto_1.BelongsTo);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Series);
    t.is(b.Series.length, 1);
    helpers_1.checkType(t, b.Series[0], metadata_collection_1.Collection);
    helpers_1.checkType_String(t, b.Series[0].Name);
    t.is(b.Series[0].Name, colName1);
    helpers_1.checkType_String(t, b.Series[0].Identifier);
    t.is(b.Series[0].Identifier, colID1);
});
ava_1.test("JSON DESERIALIZE: BelongsTo.Series => Collection", function (t) {
    var json = {};
    json.series = { name: colName2, identifier: colID2 };
    helpers_1.logJSON(json);
    var b = ta_json_1.JSON.deserialize(json, metadata_belongsto_1.BelongsTo);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Series);
    t.is(b.Series.length, 1);
    helpers_1.checkType(t, b.Series[0], metadata_collection_1.Collection);
    helpers_1.checkType_String(t, b.Series[0].Name);
    t.is(b.Series[0].Name, colName2);
    helpers_1.checkType_String(t, b.Series[0].Identifier);
    t.is(b.Series[0].Identifier, colID2);
});
ava_1.test("JSON DESERIALIZE: BelongsTo.Series => CollectionSTR[]", function (t) {
    var json = {};
    json.series = [colName1, colName2];
    helpers_1.logJSON(json);
    var b = ta_json_1.JSON.deserialize(json, metadata_belongsto_1.BelongsTo);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Series);
    t.is(b.Series.length, 2);
    helpers_1.checkType(t, b.Series[0], metadata_collection_1.Collection);
    helpers_1.checkType_String(t, b.Series[0].Name);
    t.is(b.Series[0].Name, colName1);
    helpers_1.checkType(t, b.Series[1], metadata_collection_1.Collection);
    helpers_1.checkType_String(t, b.Series[1].Name);
    t.is(b.Series[1].Name, colName2);
});
ava_1.test("JSON DESERIALIZE: BelongsTo.Series => CollectionSTR[1]", function (t) {
    var json = {};
    json.series = [colName1];
    helpers_1.logJSON(json);
    var b = ta_json_1.JSON.deserialize(json, metadata_belongsto_1.BelongsTo);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Series);
    t.is(b.Series.length, 1);
    helpers_1.checkType(t, b.Series[0], metadata_collection_1.Collection);
    helpers_1.checkType_String(t, b.Series[0].Name);
    t.is(b.Series[0].Name, colName1);
});
ava_1.test("JSON DESERIALIZE: BelongsTo.Series => CollectionSTR", function (t) {
    var json = {};
    json.series = colName2;
    helpers_1.logJSON(json);
    var b = ta_json_1.JSON.deserialize(json, metadata_belongsto_1.BelongsTo);
    helpers_1.inspect(b);
    helpers_1.checkType_Array(t, b.Series);
    t.is(b.Series.length, 1);
    helpers_1.checkType(t, b.Series[0], metadata_collection_1.Collection);
    helpers_1.checkType_String(t, b.Series[0].Name);
    t.is(b.Series[0].Name, colName2);
});
//# sourceMappingURL=test-JSON-Collection.js.map