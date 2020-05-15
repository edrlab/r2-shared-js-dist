"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Body = void 0;
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es8-es2017/src/_utils/xml-js-mapper");
const smil_seq_1 = require("./smil-seq");
let Body = (() => {
    let Body = class Body extends smil_seq_1.Seq {
        constructor() {
            super(...arguments);
            this.isBody = true;
        }
    };
    Body = tslib_1.__decorate([
        xml_js_mapper_1.XmlObject({
            epub: "http://www.idpf.org/2007/ops",
            smil: "http://www.w3.org/ns/SMIL",
        })
    ], Body);
    return Body;
})();
exports.Body = Body;
//# sourceMappingURL=smil-body.js.map