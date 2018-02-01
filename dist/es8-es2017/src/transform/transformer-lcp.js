"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transformer_lcp_1 = require("r2-lcp-js/dist/es8-es2017/src/transform/transformer-lcp");
class TransformerLCP {
    supports(publication, link) {
        return (typeof publication.LCP !== "undefined") &&
            transformer_lcp_1.supports(publication.LCP, link.Href, link.Properties.Encrypted);
    }
    async transformStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return transformer_lcp_1.transformStream(publication.LCP, link.Href, link.Properties.Encrypted, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
    }
}
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map