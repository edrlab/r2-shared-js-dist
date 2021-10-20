"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformerLCP = void 0;
const transformer_lcp_1 = require("r2-lcp-js/dist/es8-es2017/src/transform/transformer-lcp");
class TransformerLCP {
    supports(publication, link) {
        return (typeof publication.LCP !== "undefined") &&
            link.Properties && link.Properties.Encrypted &&
            (0, transformer_lcp_1.supports)(publication.LCP, link.Href, link.Properties.Encrypted);
    }
    async transformStream(publication, link, _url, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, _sessionInfo) {
        return (0, transformer_lcp_1.transformStream)(publication.LCP, link.Href, link.Properties.Encrypted, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
    }
}
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map