"use strict";
var Link_1;
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
"use strict";
const ta_json_string_converter_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/ta-json-string-converter");
const ta_json_x_1 = require("ta-json-x");
const metadata_properties_1 = require("./metadata-properties");
let Link = Link_1 = class Link {
    AddRels(rels) {
        rels.forEach((rel) => {
            this.AddRel(rel);
        });
    }
    AddRel(rel) {
        if (this.HasRel(rel)) {
            return;
        }
        if (!this.Rel) {
            this.Rel = [rel];
        }
        else {
            this.Rel.push(rel);
        }
    }
    HasRel(rel) {
        return this.Rel && this.Rel.indexOf(rel) >= 0;
    }
    _OnDeserialized() {
        if (!this.Href && (!this.Children || !this.Children.length)) {
            console.log("Link.Href is not set! (and no child Links)");
        }
    }
};
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("href"),
    tslib_1.__metadata("design:type", String)
], Link.prototype, "Href", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("type"),
    tslib_1.__metadata("design:type", String)
], Link.prototype, "TypeLink", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("height"),
    tslib_1.__metadata("design:type", Number)
], Link.prototype, "Height", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("width"),
    tslib_1.__metadata("design:type", Number)
], Link.prototype, "Width", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("title"),
    tslib_1.__metadata("design:type", String)
], Link.prototype, "Title", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("properties"),
    tslib_1.__metadata("design:type", metadata_properties_1.Properties)
], Link.prototype, "Properties", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("duration"),
    tslib_1.__metadata("design:type", Number)
], Link.prototype, "Duration", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("bitrate"),
    tslib_1.__metadata("design:type", Number)
], Link.prototype, "Bitrate", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("templated"),
    tslib_1.__metadata("design:type", Boolean)
], Link.prototype, "Templated", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("children"),
    ta_json_x_1.JsonElementType(Link_1),
    tslib_1.__metadata("design:type", Array)
], Link.prototype, "Children", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("rel"),
    ta_json_x_1.JsonConverter(ta_json_string_converter_1.JsonStringConverter),
    ta_json_x_1.JsonElementType(String),
    tslib_1.__metadata("design:type", Array)
], Link.prototype, "Rel", void 0);
tslib_1.__decorate([
    ta_json_x_1.OnDeserialized(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], Link.prototype, "_OnDeserialized", null);
Link = Link_1 = tslib_1.__decorate([
    ta_json_x_1.JsonObject()
], Link);
exports.Link = Link;
//# sourceMappingURL=publication-link.js.map