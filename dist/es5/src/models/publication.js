"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ta_json_x_1 = require("ta-json-x");
var metadata_1 = require("./metadata");
var publication_link_1 = require("./publication-link");
var Publication = (function () {
    function Publication() {
    }
    Publication.prototype.freeDestroy = function () {
        console.log("freeDestroy: Publication");
        if (this.Internal) {
            var zipInternal = this.findFromInternal("zip");
            if (zipInternal) {
                var zip = zipInternal.Value;
                zip.freeDestroy();
            }
        }
    };
    Publication.prototype.findFromInternal = function (key) {
        if (this.Internal) {
            var found = this.Internal.find(function (internal) {
                return internal.Name === key;
            });
            if (found) {
                return found;
            }
        }
        return undefined;
    };
    Publication.prototype.AddToInternal = function (key, value) {
        var existing = this.findFromInternal(key);
        if (existing) {
            existing.Value = value;
        }
        else {
            if (!this.Internal) {
                this.Internal = [];
            }
            var internal = { Name: key, Value: value };
            this.Internal.push(internal);
        }
    };
    Publication.prototype.GetCover = function () {
        return this.searchLinkByRel("cover");
    };
    Publication.prototype.GetNavDoc = function () {
        return this.searchLinkByRel("contents");
    };
    Publication.prototype.searchLinkByRel = function (rel) {
        if (this.Resources) {
            var ll = this.Resources.find(function (link) {
                return link.HasRel(rel);
            });
            if (ll) {
                return ll;
            }
        }
        if (this.Spine) {
            var ll = this.Spine.find(function (link) {
                return link.HasRel(rel);
            });
            if (ll) {
                return ll;
            }
        }
        if (this.Links) {
            var ll = this.Links.find(function (link) {
                return link.HasRel(rel);
            });
            if (ll) {
                return ll;
            }
        }
        return undefined;
    };
    Publication.prototype.AddLink = function (typeLink, rel, url, templated) {
        var link = new publication_link_1.Link();
        link.AddRels(rel);
        link.Href = url;
        link.TypeLink = typeLink;
        if (typeof templated !== "undefined") {
            link.Templated = templated;
        }
        if (!this.Links) {
            this.Links = [];
        }
        this.Links.push(link);
    };
    Publication.prototype._OnDeserialized = function () {
        if (!this.Metadata) {
            console.log("Publication.Metadata is not set!");
        }
        if (!this.Links) {
            console.log("Publication.Links is not set!");
        }
    };
    tslib_1.__decorate([
        ta_json_x_1.JsonProperty("@context"),
        ta_json_x_1.JsonElementType(String),
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
    ], Publication.prototype, "Spine", void 0);
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
    return Publication;
}());
exports.Publication = Publication;
//# sourceMappingURL=publication.js.map