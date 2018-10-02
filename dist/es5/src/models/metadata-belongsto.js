"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ta_json_x_1 = require("ta-json-x");
var metadata_collection_1 = require("./metadata-collection");
var BelongsTo = (function () {
    function BelongsTo() {
    }
    tslib_1.__decorate([
        ta_json_x_1.JsonProperty("series"),
        ta_json_x_1.JsonElementType(metadata_collection_1.Collection),
        tslib_1.__metadata("design:type", Array)
    ], BelongsTo.prototype, "Series", void 0);
    tslib_1.__decorate([
        ta_json_x_1.JsonProperty("collection"),
        ta_json_x_1.JsonElementType(metadata_collection_1.Collection),
        tslib_1.__metadata("design:type", Array)
    ], BelongsTo.prototype, "Collection", void 0);
    BelongsTo = tslib_1.__decorate([
        ta_json_x_1.JsonObject()
    ], BelongsTo);
    return BelongsTo;
}());
exports.BelongsTo = BelongsTo;
//# sourceMappingURL=metadata-belongsto.js.map