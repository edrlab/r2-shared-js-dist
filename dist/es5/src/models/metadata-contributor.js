"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ta_json_1 = require("ta-json");
var Contributor = (function () {
    function Contributor() {
    }
    tslib_1.__decorate([
        ta_json_1.JsonProperty("name"),
        tslib_1.__metadata("design:type", Object)
    ], Contributor.prototype, "Name", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("sort_as"),
        tslib_1.__metadata("design:type", String)
    ], Contributor.prototype, "SortAs", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("identifier"),
        tslib_1.__metadata("design:type", String)
    ], Contributor.prototype, "Identifier", void 0);
    tslib_1.__decorate([
        ta_json_1.JsonProperty("role"),
        tslib_1.__metadata("design:type", String)
    ], Contributor.prototype, "Role", void 0);
    Contributor = tslib_1.__decorate([
        ta_json_1.JsonObject()
    ], Contributor);
    return Contributor;
}());
exports.Contributor = Contributor;
//# sourceMappingURL=metadata-contributor.js.map