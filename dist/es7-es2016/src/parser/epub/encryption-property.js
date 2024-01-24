"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionProperty = void 0;
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/xml-js-mapper");
const encryption_compression_1 = require("./encryption-compression");
let EncryptionProperty = class EncryptionProperty {
};
exports.EncryptionProperty = EncryptionProperty;
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("ns:Compression"),
    tslib_1.__metadata("design:type", encryption_compression_1.Compression)
], EncryptionProperty.prototype, "Compression", void 0);
exports.EncryptionProperty = EncryptionProperty = tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlObject)({
        ds: "http://www.w3.org/2000/09/xmldsig#",
        enc: "http://www.w3.org/2001/04/xmlenc#",
        encryption: "urn:oasis:names:tc:opendocument:xmlns:container",
        ns: "http://www.idpf.org/2016/encryption#compression",
    })
], EncryptionProperty);
//# sourceMappingURL=encryption-property.js.map