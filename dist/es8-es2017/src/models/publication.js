"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ta_json_x_1 = require("ta-json-x");
const ta_json_string_converter_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/ta-json-string-converter");
const metadata_1 = require("./metadata");
const publication_link_1 = require("./publication-link");
let Publication = class Publication {
    get Spine() {
        return this.Spine2 ? this.Spine2 : this.Spine1;
    }
    set Spine(spine) {
        if (spine) {
            this.Spine1 = undefined;
            this.Spine2 = spine;
        }
    }
    freeDestroy() {
        console.log("freeDestroy: Publication");
        if (this.Internal) {
            const zipInternal = this.findFromInternal("zip");
            if (zipInternal) {
                const zip = zipInternal.Value;
                zip.freeDestroy();
            }
        }
    }
    findFromInternal(key) {
        if (this.Internal) {
            const found = this.Internal.find((internal) => {
                return internal.Name === key;
            });
            if (found) {
                return found;
            }
        }
        return undefined;
    }
    AddToInternal(key, value) {
        const existing = this.findFromInternal(key);
        if (existing) {
            existing.Value = value;
        }
        else {
            if (!this.Internal) {
                this.Internal = [];
            }
            const internal = { Name: key, Value: value };
            this.Internal.push(internal);
        }
    }
    GetCover() {
        return this.searchLinkByRel("cover");
    }
    GetNavDoc() {
        return this.searchLinkByRel("contents");
    }
    searchLinkByRel(rel) {
        if (this.Resources) {
            const ll = this.Resources.find((link) => {
                return link.HasRel(rel);
            });
            if (ll) {
                return ll;
            }
        }
        if (this.Spine) {
            const ll = this.Spine.find((link) => {
                return link.HasRel(rel);
            });
            if (ll) {
                return ll;
            }
        }
        if (this.Links) {
            const ll = this.Links.find((link) => {
                return link.HasRel(rel);
            });
            if (ll) {
                return ll;
            }
        }
        return undefined;
    }
    AddLink(typeLink, rel, url, templated) {
        const link = new publication_link_1.Link();
        link.AddRels(rel);
        link.setHrefDecoded(url);
        link.TypeLink = typeLink;
        if (typeof templated !== "undefined") {
            link.Templated = templated;
        }
        if (!this.Links) {
            this.Links = [];
        }
        this.Links.push(link);
    }
    _OnDeserialized() {
        if (!this.Metadata) {
            console.log("Publication.Metadata is not set!");
        }
        if (!this.Spine) {
            console.log("Publication.Spine/ReadingOrder is not set!");
        }
    }
};
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("@context"),
    ta_json_x_1.JsonElementType(String),
    ta_json_x_1.JsonConverter(ta_json_string_converter_1.JsonStringConverter),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "Context", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("metadata"),
    tslib_1.__metadata("design:type", metadata_1.Metadata)
], Publication.prototype, "Metadata", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("links"),
    ta_json_x_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "Links", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("readingOrder"),
    ta_json_x_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "Spine2", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("spine"),
    ta_json_x_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Object)
], Publication.prototype, "Spine1", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("resources"),
    ta_json_x_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "Resources", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("toc"),
    ta_json_x_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "TOC", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("page-list"),
    ta_json_x_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "PageList", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("landmarks"),
    ta_json_x_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "Landmarks", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("loi"),
    ta_json_x_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "LOI", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("loa"),
    ta_json_x_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "LOA", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("lov"),
    ta_json_x_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "LOV", void 0);
tslib_1.__decorate([
    ta_json_x_1.JsonProperty("lot"),
    ta_json_x_1.JsonElementType(publication_link_1.Link),
    tslib_1.__metadata("design:type", Array)
], Publication.prototype, "LOT", void 0);
tslib_1.__decorate([
    ta_json_x_1.OnDeserialized(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], Publication.prototype, "_OnDeserialized", null);
Publication = tslib_1.__decorate([
    ta_json_x_1.JsonObject()
], Publication);
exports.Publication = Publication;
//# sourceMappingURL=publication.js.map