"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/xml-js-mapper");
let EncryptionMethod = class EncryptionMethod {
};
tslib_1.__decorate([
    xml_js_mapper_1.XmlXPathSelector("@Algorithm"),
    tslib_1.__metadata("design:type", String)
], EncryptionMethod.prototype, "Algorithm", void 0);
EncryptionMethod = tslib_1.__decorate([
    xml_js_mapper_1.XmlObject({
        ds: "http://www.w3.org/2000/09/xmldsig#",
        enc: "http://www.w3.org/2001/04/xmlenc#",
        encryption: "urn:oasis:names:tc:opendocument:xmlns:container",
        ns: "http://www.idpf.org/2016/encryption#compression",
    })
], EncryptionMethod);
exports.EncryptionMethod = EncryptionMethod;
//# sourceMappingURL=encryption-method.js.map