"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
function zipHasEntry(zip, zipPath, zipPathOther) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let has = zip.hasEntry(zipPath);
        if (zip.hasEntryAsync) {
            try {
                has = yield zip.hasEntryAsync(zipPath);
            }
            catch (err) {
                console.log(err);
            }
        }
        if (!has && zipPathOther && zipPathOther !== zipPath) {
            console.log(`zipHasEntry: ${zipPath} => ${zipPathOther}`);
            has = zip.hasEntry(zipPath);
            if (zip.hasEntryAsync) {
                try {
                    has = yield zip.hasEntryAsync(zipPath);
                }
                catch (err) {
                    console.log(err);
                }
            }
        }
        return has;
    });
}
exports.zipHasEntry = zipHasEntry;
//# sourceMappingURL=zipHasEntry.js.map