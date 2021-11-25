"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeqOrPar = void 0;
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var SeqOrPar = (function () {
    function SeqOrPar() {
    }
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@epub:type"),
        (0, tslib_1.__metadata)("design:type", String)
    ], SeqOrPar.prototype, "EpubType", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@id | @xml:id"),
        (0, tslib_1.__metadata)("design:type", String)
    ], SeqOrPar.prototype, "ID", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@dur"),
        (0, tslib_1.__metadata)("design:type", String)
    ], SeqOrPar.prototype, "Duration", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@customTest"),
        (0, tslib_1.__metadata)("design:type", String)
    ], SeqOrPar.prototype, "CustomTest", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@system-required"),
        (0, tslib_1.__metadata)("design:type", String)
    ], SeqOrPar.prototype, "SystemRequired", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("@class"),
        (0, tslib_1.__metadata)("design:type", String)
    ], SeqOrPar.prototype, "Class", void 0);
    SeqOrPar = (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlObject)({
            epub: "http://www.idpf.org/2007/ops",
            smil: "http://www.w3.org/ns/SMIL",
            smil2: "http://www.w3.org/2001/SMIL20/",
            xml: "http://www.w3.org/XML/1998/namespace",
        }),
        (0, xml_js_mapper_1.XmlDiscriminatorProperty)("localName")
    ], SeqOrPar);
    return SeqOrPar;
}());
exports.SeqOrPar = SeqOrPar;
//# sourceMappingURL=smil-seq-or-par.js.map