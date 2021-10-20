"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayOptionsPlatform = void 0;
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es6-es2015/src/_utils/xml-js-mapper");
const display_options_platform_prop_1 = require("./display-options-platform-prop");
let DisplayOptionsPlatform = class DisplayOptionsPlatform {
};
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("@name"),
    (0, tslib_1.__metadata)("design:type", String)
], DisplayOptionsPlatform.prototype, "Name", void 0);
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("option"),
    (0, xml_js_mapper_1.XmlItemType)(display_options_platform_prop_1.DisplayOptionsPlatformProp),
    (0, tslib_1.__metadata)("design:type", Array)
], DisplayOptionsPlatform.prototype, "Options", void 0);
DisplayOptionsPlatform = (0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlObject)()
], DisplayOptionsPlatform);
exports.DisplayOptionsPlatform = DisplayOptionsPlatform;
//# sourceMappingURL=display-options-platform.js.map