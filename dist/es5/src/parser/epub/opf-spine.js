"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spine = void 0;
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var opf_spineitem_1 = require("./opf-spineitem");
var Spine = (function () {
    function Spine() {
    }
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@id | @xml:id"),
        (0, tslib_1.__metadata)("design:type", String)
    ], Spine.prototype, "ID", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@toc"),
        (0, tslib_1.__metadata)("design:type", String)
    ], Spine.prototype, "Toc", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@page-progression-direction"),
        (0, tslib_1.__metadata)("design:type", String)
    ], Spine.prototype, "PageProgression", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("itemref"),
        (0, xml_js_mapper_1.XmlItemType)(opf_spineitem_1.SpineItem),
        (0, tslib_1.__metadata)("design:type", Array)
    ], Spine.prototype, "Items", void 0);
    Spine = (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlObject)({
            dc: "http://purl.org/dc/elements/1.1/",
            opf: "http://www.idpf.org/2007/opf",
            opf2: "http://openebook.org/namespaces/oeb-package/1.0/",
            xml: "http://www.w3.org/XML/1998/namespace",
        })
    ], Spine);
    return Spine;
}());
exports.Spine = Spine;
//# sourceMappingURL=opf-spine.js.map