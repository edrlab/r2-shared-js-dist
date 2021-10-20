"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComicInfo = void 0;
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var comicrack_page_1 = require("./comicrack-page");
var ComicInfo = (function () {
    function ComicInfo() {
    }
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("Title"),
        (0, tslib_1.__metadata)("design:type", String)
    ], ComicInfo.prototype, "Title", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("Series"),
        (0, tslib_1.__metadata)("design:type", String)
    ], ComicInfo.prototype, "Series", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("Volume"),
        (0, tslib_1.__metadata)("design:type", Number)
    ], ComicInfo.prototype, "Volume", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("Number"),
        (0, tslib_1.__metadata)("design:type", Number)
    ], ComicInfo.prototype, "Number", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("Writer"),
        (0, tslib_1.__metadata)("design:type", String)
    ], ComicInfo.prototype, "Writer", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("Penciller"),
        (0, tslib_1.__metadata)("design:type", String)
    ], ComicInfo.prototype, "Penciller", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("Inker"),
        (0, tslib_1.__metadata)("design:type", String)
    ], ComicInfo.prototype, "Inker", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("Colorist"),
        (0, tslib_1.__metadata)("design:type", String)
    ], ComicInfo.prototype, "Colorist", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("ScanInformation"),
        (0, tslib_1.__metadata)("design:type", String)
    ], ComicInfo.prototype, "ScanInformation", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("Summary"),
        (0, tslib_1.__metadata)("design:type", String)
    ], ComicInfo.prototype, "Summary", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("Year"),
        (0, tslib_1.__metadata)("design:type", Number)
    ], ComicInfo.prototype, "Year", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("PageCount"),
        (0, tslib_1.__metadata)("design:type", Number)
    ], ComicInfo.prototype, "PageCount", void 0);
    (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlXPathSelector)("Pages/Page"),
        (0, xml_js_mapper_1.XmlItemType)(comicrack_page_1.Page),
        (0, tslib_1.__metadata)("design:type", Array)
    ], ComicInfo.prototype, "Pages", void 0);
    ComicInfo = (0, tslib_1.__decorate)([
        (0, xml_js_mapper_1.XmlObject)({
            xsd: "http://www.w3.org/2001/XMLSchema",
            xsi: "http://www.w3.org/2001/XMLSchema-instance",
        })
    ], ComicInfo);
    return ComicInfo;
}());
exports.ComicInfo = ComicInfo;
//# sourceMappingURL=comicrack.js.map