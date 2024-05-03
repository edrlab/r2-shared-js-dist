import { Publication } from "../models/publication";
export declare const convertDaisyToReadiumWebPub: (outputDirPath: string, publication: Publication, generateDaisyAudioManifestOnly: string | undefined, forceAudioOnly?: boolean) => Promise<string | undefined>;
