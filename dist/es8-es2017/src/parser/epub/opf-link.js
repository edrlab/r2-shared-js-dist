"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaLink = void 0;
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/xml-js-mapper");
let MetaLink = class MetaLink {
};
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("@property"),
    (0, tslib_1.__metadata)("design:type", String)
], MetaLink.prototype, "Property", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("@href"),
    (0, tslib_1.__metadata)("design:type", String)
], MetaLink.prototype, "Href", void 0);
MetaLink = (0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlObject)({
        opf: "http://www.idpf.org/2007/opf",
    })
], MetaLink);
exports.MetaLink = MetaLink;
//# sourceMappingURL=opf-link.js.map