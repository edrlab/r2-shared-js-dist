"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaLink = void 0;
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/xml-js-mapper");
let MetaLink = class MetaLink {
};
exports.MetaLink = MetaLink;
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@property"),
    tslib_1.__metadata("design:type", String)
], MetaLink.prototype, "Property", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@rel"),
    tslib_1.__metadata("design:type", String)
], MetaLink.prototype, "Rel", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@href"),
    tslib_1.__metadata("design:type", String)
], MetaLink.prototype, "Href", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@properties"),
    tslib_1.__metadata("design:type", String)
], MetaLink.prototype, "Properties", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@media-type"),
    tslib_1.__metadata("design:type", String)
], MetaLink.prototype, "MediaType", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@refines"),
    tslib_1.__metadata("design:type", String)
], MetaLink.prototype, "Refines", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@id"),
    tslib_1.__metadata("design:type", String)
], MetaLink.prototype, "ID", void 0);
exports.MetaLink = MetaLink = tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlObject)({
        opf: "http://www.idpf.org/2007/opf",
    })
], MetaLink);
//# sourceMappingURL=opf-link.js.map