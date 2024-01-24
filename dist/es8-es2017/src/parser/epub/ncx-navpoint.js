"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavPoint = void 0;
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/xml-js-mapper");
const ncx_content_1 = require("./ncx-content");
const ncx_navlabel_1 = require("./ncx-navlabel");
let NavPoint = class NavPoint {
};
exports.NavPoint = NavPoint;
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("ncx:navPoint"),
    (0, xml_js_mapper_1.XmlItemType)(NavPoint),
    tslib_1.__metadata("design:type", Array)
], NavPoint.prototype, "Points", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("ncx:navLabel"),
    tslib_1.__metadata("design:type", ncx_navlabel_1.NavLabel)
], NavPoint.prototype, "NavLabel", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("ncx:content"),
    tslib_1.__metadata("design:type", ncx_content_1.Content)
], NavPoint.prototype, "Content", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@playOrder"),
    tslib_1.__metadata("design:type", Number)
], NavPoint.prototype, "PlayerOrder", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@id | @xml:id"),
    tslib_1.__metadata("design:type", String)
], NavPoint.prototype, "ID", void 0);
exports.NavPoint = NavPoint = tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlObject)({
        ncx: "http://www.daisy.org/z3986/2005/ncx/",
        xml: "http://www.w3.org/XML/1998/namespace",
    })
], NavPoint);
//# sourceMappingURL=ncx-navpoint.js.map