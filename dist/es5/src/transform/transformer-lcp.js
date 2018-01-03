"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var transformer_lcp_1 = require("r2-lcp-js/dist/es5/src/transform/transformer-lcp");
var debug_ = require("debug");
var debug = debug_("r2:transformer:lcp");
var TransformerLCP = (function () {
    function TransformerLCP() {
    }
    TransformerLCP.prototype.supports = function (publication, link) {
        if (!publication.LCP) {
            return false;
        }
        if (!publication.LCP.isReady()) {
            debug("LCP not ready!");
            return false;
        }
        var check = link.Properties.Encrypted.Scheme === "http://readium.org/2014/01/lcp"
            && (link.Properties.Encrypted.Profile === "http://readium.org/lcp/basic-profile" ||
                link.Properties.Encrypted.Profile === "http://readium.org/lcp/profile-1.0")
            && link.Properties.Encrypted.Algorithm === "http://www.w3.org/2001/04/xmlenc#aes256-cbc";
        if (!check) {
            debug("Incorrect resource LCP fields.");
            debug(link.Properties.Encrypted.Scheme);
            debug(link.Properties.Encrypted.Profile);
            debug(link.Properties.Encrypted.Algorithm);
            return false;
        }
        return true;
    };
    TransformerLCP.prototype.transformStream = function (publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2, transformer_lcp_1.transformStream(publication.LCP, link.Href, link.Properties.Encrypted, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd)];
            });
        });
    };
    return TransformerLCP;
}());
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map