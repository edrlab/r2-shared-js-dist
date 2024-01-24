"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibilityCertification = void 0;
const tslib_1 = require("tslib");
const ta_json_x_1 = require("ta-json-x");
const ta_json_string_converter_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/ta-json-string-converter");
let AccessibilityCertification = class AccessibilityCertification {
};
exports.AccessibilityCertification = AccessibilityCertification;
tslib_1.__decorate([
    (0, ta_json_x_1.JsonProperty)("certifiedBy"),
    (0, ta_json_x_1.JsonConverter)(ta_json_string_converter_1.JsonStringConverter),
    (0, ta_json_x_1.JsonElementType)(String),
    tslib_1.__metadata("design:type", Array)
], AccessibilityCertification.prototype, "CertifiedBy", void 0);
tslib_1.__decorate([
    (0, ta_json_x_1.JsonProperty)("credential"),
    (0, ta_json_x_1.JsonConverter)(ta_json_string_converter_1.JsonStringConverter),
    (0, ta_json_x_1.JsonElementType)(String),
    tslib_1.__metadata("design:type", Array)
], AccessibilityCertification.prototype, "Credential", void 0);
tslib_1.__decorate([
    (0, ta_json_x_1.JsonProperty)("report"),
    (0, ta_json_x_1.JsonConverter)(ta_json_string_converter_1.JsonStringConverter),
    (0, ta_json_x_1.JsonElementType)(String),
    tslib_1.__metadata("design:type", Array)
], AccessibilityCertification.prototype, "Report", void 0);
exports.AccessibilityCertification = AccessibilityCertification = tslib_1.__decorate([
    (0, ta_json_x_1.JsonObject)()
], AccessibilityCertification);
//# sourceMappingURL=metadata-accessibility-certification.js.map