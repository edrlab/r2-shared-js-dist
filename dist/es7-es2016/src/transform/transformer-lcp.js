"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const transformer_lcp_1 = require("r2-lcp-js/dist/es7-es2016/src/transform/transformer-lcp");
const debug_ = require("debug");
const debug = debug_("r2:transformer:lcp");
class TransformerLCP {
    supports(publication, link) {
        if (!publication.LCP) {
            return false;
        }
        if (!publication.LCP.isReady()) {
            debug("LCP not ready!");
            return false;
        }
        const check = link.Properties.Encrypted.Scheme === "http://readium.org/2014/01/lcp"
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
    }
    transformStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return transformer_lcp_1.transformStream(publication.LCP, link.Href, link.Properties.Encrypted, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
        });
    }
}
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map