"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibilityMetadata = void 0;
var tslib_1 = require("tslib");
var ta_json_x_1 = require("ta-json-x");
var ta_json_string_converter_1 = require("r2-utils-js/dist/es5/src/_utils/ta-json-string-converter");
var metadata_accessibility_certification_1 = require("./metadata-accessibility-certification");
var AccessibilityMetadata = (function () {
    function AccessibilityMetadata() {
    }
    tslib_1.__decorate([
        (0, ta_json_x_1.JsonProperty)("certification"),
        tslib_1.__metadata("design:type", metadata_accessibility_certification_1.AccessibilityCertification)
    ], AccessibilityMetadata.prototype, "Certification", void 0);
    tslib_1.__decorate([
        (0, ta_json_x_1.JsonProperty)("conformsTo"),
        (0, ta_json_x_1.JsonConverter)(ta_json_string_converter_1.JsonStringConverter),
        (0, ta_json_x_1.JsonElementType)(String),
        tslib_1.__metadata("design:type", Array)
    ], AccessibilityMetadata.prototype, "ConformsTo", void 0);
    tslib_1.__decorate([
        (0, ta_json_x_1.JsonProperty)("summary"),
        tslib_1.__metadata("design:type", Object)
    ], AccessibilityMetadata.prototype, "Summary", void 0);
    tslib_1.__decorate([
        (0, ta_json_x_1.JsonProperty)("accessMode"),
        (0, ta_json_x_1.JsonConverter)(ta_json_string_converter_1.JsonStringConverter),
        (0, ta_json_x_1.JsonElementType)(String),
        tslib_1.__metadata("design:type", Array)
    ], AccessibilityMetadata.prototype, "AccessMode", void 0);
    tslib_1.__decorate([
        (0, ta_json_x_1.JsonProperty)("accessModeSufficient"),
        (0, ta_json_x_1.JsonElementType)(Array),
        tslib_1.__metadata("design:type", Array)
    ], AccessibilityMetadata.prototype, "AccessModeSufficient", void 0);
    tslib_1.__decorate([
        (0, ta_json_x_1.JsonProperty)("feature"),
        (0, ta_json_x_1.JsonConverter)(ta_json_string_converter_1.JsonStringConverter),
        (0, ta_json_x_1.JsonElementType)(String),
        tslib_1.__metadata("design:type", Array)
    ], AccessibilityMetadata.prototype, "Feature", void 0);
    tslib_1.__decorate([
        (0, ta_json_x_1.JsonProperty)("hazard"),
        (0, ta_json_x_1.JsonConverter)(ta_json_string_converter_1.JsonStringConverter),
        (0, ta_json_x_1.JsonElementType)(String),
        tslib_1.__metadata("design:type", Array)
    ], AccessibilityMetadata.prototype, "Hazard", void 0);
    AccessibilityMetadata = tslib_1.__decorate([
        (0, ta_json_x_1.JsonObject)()
    ], AccessibilityMetadata);
    return AccessibilityMetadata;
}());
exports.AccessibilityMetadata = AccessibilityMetadata;
//# sourceMappingURL=metadata-accessibility.js.map