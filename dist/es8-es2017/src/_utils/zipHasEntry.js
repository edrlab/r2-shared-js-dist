"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function zipHasEntry(zip, zipPath, zipPathOther) {
    let has = zip.hasEntry(zipPath);
    if (zip.hasEntryAsync) {
        try {
            has = await zip.hasEntryAsync(zipPath);
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
                has = await zip.hasEntryAsync(zipPath);
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    return has;
}
exports.zipHasEntry = zipHasEntry;
//# sourceMappingURL=zipHasEntry.js.map