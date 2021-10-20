"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metafield = void 0;
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var Metafield = (function () {
    function Metafield() {
    }
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("text()"),
        (0, tslib_1.__metadata)("design:type", String)
    ], Metafield.prototype, "Data", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@name"),
        (0, tslib_1.__metadata)("design:type", String)
    ], Metafield.prototype, "Name", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@content"),
        (0, tslib_1.__metadata)("design:type", String)
    ], Metafield.prototype, "Content", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@refines"),
        (0, tslib_1.__metadata)("design:type", String)
    ], Metafield.prototype, "Refine", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@scheme"),
        (0, tslib_1.__metadata)("design:type", String)
    ], Metafield.prototype, "Scheme", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@property"),
        (0, tslib_1.__metadata)("design:type", String)
    ], Metafield.prototype, "Property", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@id | @xml:id"),
        (0, tslib_1.__metadata)("design:type", String)
    ], Metafield.prototype, "ID", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@lang | @xml:lang"),
        (0, tslib_1.__metadata)("design:type", String)
    ], Metafield.prototype, "Lang", void 0);
    Metafield = (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlObject)({
            dc: "http://purl.org/dc/elements/1.1/",
            opf: "http://www.idpf.org/2007/opf",
            opf2: "http://openebook.org/namespaces/oeb-package/1.0/",
            xml: "http://www.w3.org/XML/1998/namespace",
        })
    ], Metafield);
    return Metafield;
}());
exports.Metafield = Metafield;
//# sourceMappingURL=opf-metafield.js.map