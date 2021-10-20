"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaDate = void 0;
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/xml-js-mapper");
let MetaDate = class MetaDate {
};
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("text()"),
    (0, tslib_1.__metadata)("design:type", String)
], MetaDate.prototype, "Data", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("@event"),
    (0, tslib_1.__metadata)("design:type", String)
], MetaDate.prototype, "Event", void 0);
MetaDate = (0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlObject)({
        dc: "http://purl.org/dc/elements/1.1/",
        opf: "http://www.idpf.org/2007/opf",
    })
], MetaDate);
exports.MetaDate = MetaDate;
//# sourceMappingURL=opf-date.js.map