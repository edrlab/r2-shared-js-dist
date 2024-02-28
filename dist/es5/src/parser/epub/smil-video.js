"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Video = void 0;
var tslib_1 = require("tslib");
var xml_js_mapper_1 = require("r2-utils-js/dist/es5/src/_utils/xml-js-mapper");
var decodeURI_1 = require("../../_utils/decodeURI");
var Video = (function () {
    function Video() {
    }
    Object.defineProperty(Video.prototype, "ClipBegin", {
        get: function () {
            return this.ClipBegin1 ? this.ClipBegin1 : this.ClipBegin2;
        },
        set: function (clipBegin) {
            if (clipBegin) {
                this.ClipBegin1 = clipBegin;
                this.ClipBegin2 = undefined;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Video.prototype, "ClipEnd", {
        get: function () {
            return this.ClipEnd1 ? this.ClipEnd1 : this.ClipEnd2;
        },
        set: function (clipEnd) {
            if (clipEnd) {
                this.ClipEnd1 = clipEnd;
                this.ClipEnd2 = undefined;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Video.prototype, "Src", {
        get: function () {
            return this.Src1;
        },
        set: function (href) {
            this.Src1 = href;
            this._urlDecoded = undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Video.prototype, "SrcDecoded", {
        get: function () {
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
        },
        set: function (href) {
            this._urlDecoded = href;
        },
        enumerable: false,
        configurable: true
    });
    Video.prototype.setSrcDecoded = function (href) {
        this.Src = href;
        this.SrcDecoded = href;
    };
    tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlXPathSelector)("@id | @xml:id"),
        tslib_1.__metadata("design:type", String)
    ], Video.prototype, "ID", void 0);
    tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlXPathSelector)("@clipBegin"),
        tslib_1.__metadata("design:type", String)
    ], Video.prototype, "ClipBegin1", void 0);
    tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlXPathSelector)("@clip-begin"),
        tslib_1.__metadata("design:type", Object)
    ], Video.prototype, "ClipBegin2", void 0);
    tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlXPathSelector)("@clipEnd"),
        tslib_1.__metadata("design:type", String)
    ], Video.prototype, "ClipEnd1", void 0);
    tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlXPathSelector)("@clip-end"),
        tslib_1.__metadata("design:type", Object)
    ], Video.prototype, "ClipEnd2", void 0);
    tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlXPathSelector)("@epub:type"),
        tslib_1.__metadata("design:type", String)
    ], Video.prototype, "EpubType", void 0);
    tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlXPathSelector)("@src"),
        tslib_1.__metadata("design:type", String)
    ], Video.prototype, "Src1", void 0);
    Video = tslib_1.__decorate([
        (0, xml_js_mapper_1.XmlObject)({
            epub: "http://www.idpf.org/2007/ops",
            smil: "http://www.w3.org/ns/SMIL",
            smil2: "http://www.w3.org/2001/SMIL20/",
            xml: "http://www.w3.org/XML/1998/namespace",
        })
    ], Video);
    return Video;
}());
exports.Video = Video;
//# sourceMappingURL=smil-video.js.map