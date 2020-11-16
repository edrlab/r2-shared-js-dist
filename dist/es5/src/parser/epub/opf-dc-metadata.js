"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DCMetadata = void 0;
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var opf_author_1 = require("./opf-author");
var opf_date_1 = require("./opf-date");
var opf_identifier_1 = require("./opf-identifier");
var opf_subject_1 = require("./opf-subject");
var opf_title_1 = require("./opf-title");
var DCMetadata = (function () {
    function DCMetadata() {
    }
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Title | dc:title"),
        xml_js_mapper_1.XmlItemType(opf_title_1.Title),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Title", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Language/text() | dc:language/text()"),
        xml_js_mapper_1.XmlItemType(String),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Language", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Identifier | dc:identifier"),
        xml_js_mapper_1.XmlItemType(opf_identifier_1.Identifier),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Identifier", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Creator | dc:creator"),
        xml_js_mapper_1.XmlItemType(opf_author_1.Author),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Creator", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Subject | dc:subject"),
        xml_js_mapper_1.XmlItemType(opf_subject_1.Subject),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Subject", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Description/text() | dc:description/text()"),
        xml_js_mapper_1.XmlItemType(String),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Description", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Publisher/text() | dc:publisher/text()"),
        xml_js_mapper_1.XmlItemType(String),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Publisher", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Contributor | dc:contributor"),
        xml_js_mapper_1.XmlItemType(opf_author_1.Author),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Contributor", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Date | dc:date"),
        xml_js_mapper_1.XmlItemType(opf_date_1.MetaDate),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Date", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Type/text() | dc:type/text()"),
        xml_js_mapper_1.XmlItemType(String),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Type", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Format/text() | dc:format/text()"),
        xml_js_mapper_1.XmlItemType(String),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Format", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Source/text() | dc:source/text()"),
        xml_js_mapper_1.XmlItemType(String),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Source", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Relation/text() | dc:relation/text()"),
        xml_js_mapper_1.XmlItemType(String),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Relation", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Coverage/text() | dc:coverage/text()"),
        xml_js_mapper_1.XmlItemType(String),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Coverage", void 0);
    tslib_1.__decorate([
        xml_js_mapper_1.XmlXPathSelector("dc:Rights/text() | dc:rights/text()"),
        xml_js_mapper_1.XmlItemType(String),
        tslib_1.__metadata("design:type", Array)
    ], DCMetadata.prototype, "Rights", void 0);
    DCMetadata = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            dc: "http://purl.org/dc/elements/1.1/",
            opf: "http://www.idpf.org/2007/opf",
            opf2: "http://openebook.org/namespaces/oeb-package/1.0/",
        })
    ], DCMetadata);
    return DCMetadata;
}());
exports.DCMetadata = DCMetadata;
//# sourceMappingURL=opf-dc-metadata.js.map