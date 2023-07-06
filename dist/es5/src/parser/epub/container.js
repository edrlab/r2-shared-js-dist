"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var container_rootfile_1 = require("./container-rootfile");
var Container = exports.Container = (function () {
    function Container() {
    }
    tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlXPathSelector)("epub:rootfiles/epub:rootfile", {
            epub: "urn:oasis:names:tc:opendocument:xmlns:container",
            rendition: "http://www.idpf.org/2013/rendition",
        }),
        (0, xml_js_mapper_1.XmlItemType)(container_rootfile_1.Rootfile),
        tslib_1.__metadata("design:type", Array)
    ], Container.prototype, "Rootfile", void 0);
    Container = tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlObject)({
            dummyNS: "dummyURI",
            epub: "wrong2",
            rendition: "wrong1",
        })
    ], Container);
    return Container;
}());
//# sourceMappingURL=container.js.map