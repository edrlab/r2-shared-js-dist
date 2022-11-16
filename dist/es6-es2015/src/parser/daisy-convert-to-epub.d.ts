import { Publication } from "../models/publication";
export declare const convertDaisyToReadiumWebPub: (outputDirPath: string, publication: Publication, generateDaisyAudioManifestOnly?: string) => Promise<string | undefined>;
