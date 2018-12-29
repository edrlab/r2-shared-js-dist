"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ta_json_x_1 = require("ta-json-x");
const metadata_subject_1 = require("./metadata-subject");
class JsonSubjectConverter {
    serialize(s) {
        if (s.Name &&
            !s.SortAs &&
            !s.Scheme &&
            !s.Code &&
            (!s.Links || !s.Links.length)) {
            if (typeof s.Name === "string") {
                return s.Name;
            }
        }
        return ta_json_x_1.JSON.serialize(s);
    }
    deserialize(value) {
        if (typeof value === "string") {
            const s = new metadata_subject_1.Subject();
            s.Name = value;
            return s;
        }
        return ta_json_x_1.JSON.deserialize(value, metadata_subject_1.Subject);
    }
    collapseArrayWithSingleItem() {
        return true;
    }
}
exports.JsonSubjectConverter = JsonSubjectConverter;
//# sourceMappingURL=metadata-subject-json-converter.js.map