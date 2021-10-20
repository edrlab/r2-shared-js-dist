"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayOptions = void 0;
const tslib_1 = require("tslib");
const xml_js_mapper_1 = require("r2-utils-js/dist/es7-es2016/src/_utils/xml-js-mapper");
const display_options_platform_1 = require("./display-options-platform");
let DisplayOptions = class DisplayOptions {
};
(0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlXPathSelector)("platform"),
    (0, xml_js_mapper_1.XmlItemType)(display_options_platform_1.DisplayOptionsPlatform),
    (0, tslib_1.__metadata)("design:type", Array)
], DisplayOptions.prototype, "Platforms", void 0);
DisplayOptions = (0, tslib_1.__decorate)([
    (0, xml_js_mapper_1.XmlObject)()
], DisplayOptions);
exports.DisplayOptions = DisplayOptions;
//# sourceMappingURL=display-options.js.map