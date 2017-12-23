"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("../../_utils/xml-js-mapper");
let Author = class Author {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:name/text()"),
    tslib_1.__metadata("design:type", String)
], Author.prototype, "Name", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:uri/text()"),
    tslib_1.__metadata("design:type", String)
], Author.prototype, "Uri", void 0);
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("atom:email/text()"),
    tslib_1.__metadata("design:type", String)
], Author.prototype, "Email", void 0);
Author = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        app: "http://www.w3.org/2007/app",
        atom: "http://www.w3.org/2005/Atom",
        bibframe: "http://bibframe.org/vocab/",
        dcterms: "http://purl.org/dc/terms/",
        odl: "http://opds-spec.org/odl",
        opds: "http://opds-spec.org/2010/catalog",
        opensearch: "http://a9.com/-/spec/opensearch/1.1/",
        relevance: "http://a9.com/-/opensearch/extensions/relevance/1.0/",
        schema: "http://schema.org",
        thr: "http://purl.org/syndication/thread/1.0",
        xsi: "http://www.w3.org/2001/XMLSchema-instance",
    })
], Author);
exports.Author = Author;
//# sourceMappingURL=opds-author.js.map