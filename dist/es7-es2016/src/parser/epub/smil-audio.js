"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audio = void 0;
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/xml-js-mapper");
const decodeURI_1 = require("../../_utils/decodeURI");
let Audio = class Audio {
    get ClipBegin() {
        return this.ClipBegin1 ? this.ClipBegin1 : this.ClipBegin2;
    }
    set ClipBegin(clipBegin) {
        if (clipBegin) {
            this.ClipBegin1 = clipBegin;
            this.ClipBegin2 = undefined;
        }
    }
    get ClipEnd() {
        return this.ClipEnd1 ? this.ClipEnd1 : this.ClipEnd2;
    }
    set ClipEnd(clipEnd) {
        if (clipEnd) {
            this.ClipEnd1 = clipEnd;
            this.ClipEnd2 = undefined;
        }
    }
    get Src() {
        return this.Src1;
    }
    set Src(href) {
        this.Src1 = href;
        this._urlDecoded = undefined;
    }
    get SrcDecoded() {
        if (this._urlDecoded) {
            return this._urlDecoded;
        }
        if (this._urlDecoded === null) {
            return undefined;
        }
        if (!this.Src) {
            this._urlDecoded = null;
            return undefined;
        }
        this._urlDecoded = (0, decodeURI_1.tryDecodeURI)(this.Src);
        return !this._urlDecoded ? undefined : this._urlDecoded;
    }
    set SrcDecoded(href) {
        this._urlDecoded = href;
    }
    setSrcDecoded(href) {
        this.Src = href;
        this.SrcDecoded = href;
    }
};
exports.Audio = Audio;
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@id | @xml:id"),
    tslib_1.__metadata("design:type", String)
], Audio.prototype, "ID", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@clipBegin"),
    tslib_1.__metadata("design:type", String)
], Audio.prototype, "ClipBegin1", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@clip-begin"),
    tslib_1.__metadata("design:type", Object)
], Audio.prototype, "ClipBegin2", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@clipEnd"),
    tslib_1.__metadata("design:type", String)
], Audio.prototype, "ClipEnd1", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@clip-end"),
    tslib_1.__metadata("design:type", Object)
], Audio.prototype, "ClipEnd2", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@epub:type"),
    tslib_1.__metadata("design:type", String)
], Audio.prototype, "EpubType", void 0);
tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlXPathSelector)("@src"),
    tslib_1.__metadata("design:type", String)
], Audio.prototype, "Src1", void 0);
exports.Audio = Audio = tslib_1.__decorate([
    (0, xml_js_mapper_1.XmlObject)({
        epub: "http://www.idpf.org/2007/ops",
        smil: "http://www.w3.org/ns/SMIL",
        smil2: "http://www.w3.org/2001/SMIL20/",
        xml: "http://www.w3.org/XML/1998/namespace",
    })
], Audio);
//# sourceMappingURL=smil-audio.js.map