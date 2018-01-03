"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transformer_lcp_1 = require("r2-lcp-js/dist/es8-es2017/src/transform/transformer-lcp");
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
    async transformStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return transformer_lcp_1.transformStream(publication.LCP, link.Href, link.Properties.Encrypted, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
    }
}
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map