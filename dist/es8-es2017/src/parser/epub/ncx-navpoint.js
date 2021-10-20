"use strict";
var NavPoint_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavPoint = void 0;
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/xml-js-mapper");
const ncx_content_1 = require("./ncx-content");
const ncx_navlabel_1 = require("./ncx-navlabel");
let NavPoint = NavPoint_1 = class NavPoint {
};
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("ncx:navPoint"),
    (0, xml_js_mapper_1.XmlItemType)(NavPoint_1),
    (0, tslib_1.__metadata)("design:type", Array)
], NavPoint.prototype, "Points", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("ncx:navLabel"),
    (0, tslib_1.__metadata)("design:type", ncx_navlabel_1.NavLabel)
], NavPoint.prototype, "NavLabel", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("ncx:content"),
    (0, tslib_1.__metadata)("design:type", ncx_content_1.Content)
], NavPoint.prototype, "Content", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("@playOrder"),
    (0, tslib_1.__metadata)("design:type", Number)
], NavPoint.prototype, "PlayerOrder", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("@id | @xml:id"),
    (0, tslib_1.__metadata)("design:type", String)
], NavPoint.prototype, "ID", void 0);
NavPoint = NavPoint_1 = (0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlObject)({
        ncx: "http://www.daisy.org/z3986/2005/ncx/",
        xml: "http://www.w3.org/XML/1998/namespace",
    })
], NavPoint);
exports.NavPoint = NavPoint;
//# sourceMappingURL=ncx-navpoint.js.map