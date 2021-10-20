"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subject = void 0;
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/xml-js-mapper");
let Subject = class Subject {
};
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("text()"),
    (0, tslib_1.__metadata)("design:type", String)
], Subject.prototype, "Data", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("@term"),
    (0, tslib_1.__metadata)("design:type", String)
], Subject.prototype, "Term", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("@authority"),
    (0, tslib_1.__metadata)("design:type", String)
], Subject.prototype, "Authority", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("@lang | @xml:lang"),
    (0, tslib_1.__metadata)("design:type", String)
], Subject.prototype, "Lang", void 0);
Subject = (0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlObject)({
        dc: "http://purl.org/dc/elements/1.1/",
        opf: "http://www.idpf.org/2007/opf",
        xml: "http://www.w3.org/XML/1998/namespace",
    })
], Subject);
exports.Subject = Subject;
//# sourceMappingURL=opf-subject.js.map