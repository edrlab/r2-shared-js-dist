"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformers = void 0;
const transformer_lcp_1 = require("./transformer-lcp");
const transformer_obf_adobe_1 = require("./transformer-obf-adobe");
const transformer_obf_idpf_1 = require("./transformer-obf-idpf");
let Transformers = (() => {
    class Transformers {
        constructor() {
            this.transformers = [];
        }
        static instance() {
            return Transformers._instance;
        }
        static async tryStream(publication, link, url, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, sessionInfo) {
            return Transformers.instance()._tryStream(publication, link, url, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, sessionInfo);
        }
        add(transformer) {
            if (this.transformers.indexOf(transformer) < 0) {
                this.transformers.push(transformer);
            }
        }
        async _tryStream(publication, link, url, stream, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, sessionInfo) {
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
                    transformedData = t.transformStream(publication, link, url, s, isPartialByteRangeRequest, partialByteBegin, partialByteEnd, sessionInfo);
                }
            }
            if (transformedData) {
                return transformedData;
            }
            return atLeastOne ? Promise.reject("transformers fail") : Promise.resolve(stream);
        }
    }
    Transformers._instance = new Transformers();
    return Transformers;
})();
exports.Transformers = Transformers;
Transformers.instance().add(new transformer_obf_adobe_1.TransformerObfAdobe());
Transformers.instance().add(new transformer_obf_idpf_1.TransformerObfIDPF());
Transformers.instance().add(new transformer_lcp_1.TransformerLCP());
//# sourceMappingURL=transformer.js.map