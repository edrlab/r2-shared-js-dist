"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformerLCP = void 0;
const tslib_1 = require("tslib");
const transformer_lcp_1 = require("r2-lcp-js/dist/es7-es2016/src/transform/transformer-lcp");
class TransformerLCP {
    supports(publication, link) {
        return (typeof publication.LCP !== "undefined") &&
            link.Properties && link.Properties.Encrypted &&
            (0, transformer_lcp_1.supports)(publication.LCP, link.Href, link.Properties.Encrypted);
    }
    transformStream(publication, link, _url, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, _sessionInfo) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (0, transformer_lcp_1.transformStream)(publication.LCP, link.Href, link.Properties.Encrypted, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
        });
    }
}
exports.TransformerLCP = TransformerLCP;
//# sourceMappingURL=transformer-lcp.js.map