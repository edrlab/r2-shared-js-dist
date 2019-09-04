"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transformer_lcp_1 = require("./transformer-lcp");
const transformer_obf_adobe_1 = require("./transformer-obf-adobe");
const transformer_obf_idpf_1 = require("./transformer-obf-idpf");
class Transformers {
    constructor() {
        this.transformers = [];
    }
    static instance() {
        return Transformers._instance;
    }
    static async tryStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        return Transformers.instance()._tryStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
    }
    add(transformer) {
        if (this.transformers.indexOf(transformer) < 0) {
            this.transformers.push(transformer);
        }
    }
    async _tryStream(publication, link, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd) {
        let transformedData;
        let atLeastOne = false;
        let s = stream;
        for (const t of this.transformers) {
            if (t.supports(publication, link)) {
                atLeastOne = true;
                if (transformedData) {
                    try {
                        s = await transformedData;
                    }
                    catch (err) {
                        transformedData = undefined;
                        break;
                    }
                }
                transformedData = t.transformStream(publication, link, s, isPartialByteRangeRequest, partialByteBegin, partialByteEnd);
            }
        }
        if (transformedData) {
            return transformedData;
        }
        return atLeastOne ? Promise.reject("transformers fail") : Promise.resolve(stream);
    }
}
exports.Transformers = Transformers;
Transformers._instance = new Transformers();
Transformers.instance().add(new transformer_obf_adobe_1.TransformerObfAdobe());
Transformers.instance().add(new transformer_obf_idpf_1.TransformerObfIDPF());
Transformers.instance().add(new transformer_lcp_1.TransformerLCP());
//# sourceMappingURL=transformer.js.map