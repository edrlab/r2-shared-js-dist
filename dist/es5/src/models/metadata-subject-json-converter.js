"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ta_json_x_1 = require("ta-json-x");
var metadata_subject_1 = require("./metadata-subject");
var JsonSubjectConverter = (function () {
    function JsonSubjectConverter() {
    }
    JsonSubjectConverter.prototype.serialize = function (s) {
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
    };
    JsonSubjectConverter.prototype.deserialize = function (value) {
        if (typeof value === "string") {
            var s = new metadata_subject_1.Subject();
            s.Name = value;
            return s;
        }
        return ta_json_x_1.JSON.deserialize(value, metadata_subject_1.Subject);
    };
    JsonSubjectConverter.prototype.collapseArrayWithSingleItem = function () {
        return true;
    };
    return JsonSubjectConverter;
}());
exports.JsonSubjectConverter = JsonSubjectConverter;
//# sourceMappingURL=metadata-subject-json-converter.js.map