"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/xml-js-mapper");
let MetaLink = class MetaLink {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@property"),
    tslib_1.__metadata("design:type", String)
], MetaLink.prototype, "Property", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@href"),
    tslib_1.__metadata("design:type", String)
], MetaLink.prototype, "Href", void 0);
MetaLink = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        opf: "http://www.idpf.org/2007/opf",
    })
], MetaLink);
exports.MetaLink = MetaLink;
//# sourceMappingURL=opf-link.js.map