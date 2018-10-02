"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const metadata_collection_1 = require("./models/metadata-collection");
const metadata_collection_json_converter_1 = require("./models/metadata-collection-json-converter");
const metadata_contributor_1 = require("./models/metadata-contributor");
const metadata_contributor_json_converter_1 = require("./models/metadata-contributor-json-converter");
const ta_json_date_converter_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/ta-json-date-converter");
const ta_json_number_converter_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/ta-json-number-converter");
const xml_js_mapper_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/xml-js-mapper");
const ta_json_x_1 = require("ta-json-x");
function initGlobalConverters_SHARED() {
    ta_json_x_1.propertyConverters.set(metadata_contributor_1.Contributor, new metadata_contributor_json_converter_1.JsonContributorConverter());
    ta_json_x_1.propertyConverters.set(metadata_collection_1.Collection, new metadata_collection_json_converter_1.JsonCollectionConverter());
}
exports.initGlobalConverters_SHARED = initGlobalConverters_SHARED;
function initGlobalConverters_GENERIC() {
    ta_json_x_1.propertyConverters.set(Buffer, new ta_json_x_1.BufferConverter());
    ta_json_x_1.propertyConverters.set(Date, new ta_json_date_converter_1.JsonDateConverter());
    ta_json_x_1.propertyConverters.set(Number, new ta_json_number_converter_1.JsonNumberConverter());
    xml_js_mapper_1.propertyConverters.set(Buffer, new xml_js_mapper_1.BufferConverter());
    xml_js_mapper_1.propertyConverters.set(Date, new xml_js_mapper_1.DateConverter());
}
exports.initGlobalConverters_GENERIC = initGlobalConverters_GENERIC;
//# sourceMappingURL=init-globals.js.map