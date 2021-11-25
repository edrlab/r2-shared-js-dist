import { Publication } from "../models/publication";
export declare const convertDaisyToReadiumWebPub: (outputDirPath: string, publication: Publication, generateDaisyAudioManifestOnly?: string | undefined) => Promise<string | undefined>;
