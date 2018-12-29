"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ta_json_x_1 = require("ta-json-x");
const metadata_contributor_1 = require("./metadata-contributor");
class JsonContributorConverter {
    serialize(c) {
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
    }
    deserialize(value) {
        if (typeof value === "string") {
            const c = new metadata_contributor_1.Contributor();
            c.Name = value;
            return c;
        }
        return ta_json_x_1.JSON.deserialize(value, metadata_contributor_1.Contributor);
    }
    collapseArrayWithSingleItem() {
        return true;
    }
}
exports.JsonContributorConverter = JsonContributorConverter;
//# sourceMappingURL=metadata-contributor-json-converter.js.map