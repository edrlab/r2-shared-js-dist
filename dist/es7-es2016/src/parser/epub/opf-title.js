"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Title = void 0;
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/xml-js-mapper");
let Title = class Title {
};
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("text()"),
    (0, tslib_1.__metadata)("design:type", String)
], Title.prototype, "Data", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("@id | @xml:id"),
    (0, tslib_1.__metadata)("design:type", String)
], Title.prototype, "ID", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("@lang | @xml:lang"),
    (0, tslib_1.__metadata)("design:type", String)
], Title.prototype, "Lang", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("@dir"),
    (0, tslib_1.__metadata)("design:type", String)
], Title.prototype, "Dir", void 0);
Title = (0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlObject)({
        dc: "http://purl.org/dc/elements/1.1/",
        opf: "http://www.idpf.org/2007/opf",
        xml: "http://www.w3.org/XML/1998/namespace",
    })
], Title);
exports.Title = Title;
//# sourceMappingURL=opf-title.js.map