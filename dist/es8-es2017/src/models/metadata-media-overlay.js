"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaOverlay = void 0;
const tslib_1 = require("tslib");
const ta_json_x_1 = require("ta-json-x");
let MediaOverlay = class MediaOverlay {
};
exports.MediaOverlay = MediaOverlay;
tslib_1.__decorate([
    (0, ta_json_x_1.JsonProperty)("active-class"),
    tslib_1.__metadata("design:type", String)
], MediaOverlay.prototype, "ActiveClass", void 0);
tslib_1.__decorate([
    (0, ta_json_x_1.JsonProperty)("playback-active-class"),
    tslib_1.__metadata("design:type", String)
], MediaOverlay.prototype, "PlaybackActiveClass", void 0);
exports.MediaOverlay = MediaOverlay = tslib_1.__decorate([
    (0, ta_json_x_1.JsonObject)()
], MediaOverlay);
//# sourceMappingURL=metadata-media-overlay.js.map