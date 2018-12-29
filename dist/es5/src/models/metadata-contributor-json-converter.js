"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ta_json_x_1 = require("ta-json-x");
var metadata_contributor_1 = require("./metadata-contributor");
var JsonContributorConverter = (function () {
    function JsonContributorConverter() {
    }
    JsonContributorConverter.prototype.serialize = function (c) {
        if (c.Name &&
            !c.SortAs &&
            (!c.Role || !c.Role.length) &&
            !c.Identifier &&
            (typeof c.Position === "undefined") &&
            (!c.Links || !c.Links.length)) {
            if (typeof c.Name === "string") {
                return c.Name;
            }
        }
        return ta_json_x_1.JSON.serialize(c);
    };
    JsonContributorConverter.prototype.deserialize = function (value) {
        if (typeof value === "string") {
            var c = new metadata_contributor_1.Contributor();
            c.Name = value;
            return c;
        }
        return ta_json_x_1.JSON.deserialize(value, metadata_contributor_1.Contributor);
    };
    JsonContributorConverter.prototype.collapseArrayWithSingleItem = function () {
        return true;
    };
    return JsonContributorConverter;
}());
exports.JsonContributorConverter = JsonContributorConverter;
//# sourceMappingURL=metadata-contributor-json-converter.js.map