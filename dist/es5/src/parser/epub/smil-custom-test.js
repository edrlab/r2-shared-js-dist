"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomTest = void 0;
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var CustomTest = (function () {
    function CustomTest() {
    }
    tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlXPathSelector)("@id | @xml:id"),
        tslib_1.__metadata("design:type", String)
    ], CustomTest.prototype, "ID", void 0);
    tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlXPathSelector)("@defaultState"),
        tslib_1.__metadata("design:type", String)
    ], CustomTest.prototype, "DefaultState", void 0);
    tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlXPathSelector)("@override"),
        tslib_1.__metadata("design:type", String)
    ], CustomTest.prototype, "Override", void 0);
    CustomTest = tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlObject)({
            epub: "http://www.idpf.org/2007/ops",
            smil: "http://www.w3.org/ns/SMIL",
            smil2: "http://www.w3.org/2001/SMIL20/",
            xml: "http://www.w3.org/XML/1998/namespace",
        })
    ], CustomTest);
    return CustomTest;
}());
exports.CustomTest = CustomTest;
//# sourceMappingURL=smil-custom-test.js.map