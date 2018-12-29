"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ta_json_x_1 = require("ta-json-x");
const metadata_contributor_1 = require("./metadata-contributor");
const metadata_contributor_json_converter_1 = require("./metadata-contributor-json-converter");
let BelongsTo = class BelongsTo {
};
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("series"),
    ta_json_x_1.JsonElementType(metadata_contributor_1.Contributor),
    ta_json_x_1.JsonConverter(metadata_contributor_json_converter_1.JsonContributorConverter),
    tslib_1.__metadata("design:type", Array)
], BelongsTo.prototype, "Series", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("collection"),
    ta_json_x_1.JsonElementType(metadata_contributor_1.Contributor),
    ta_json_x_1.JsonConverter(metadata_contributor_json_converter_1.JsonContributorConverter),
    tslib_1.__metadata("design:type", Array)
], BelongsTo.prototype, "Collection", void 0);
BelongsTo = tslib_1.__decorate([
    ta_json_x_1.JsonObject()
], BelongsTo);
exports.BelongsTo = BelongsTo;
//# sourceMappingURL=metadata-belongsto.js.map