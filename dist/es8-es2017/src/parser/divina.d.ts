import { Publication } from "../models/publication";
export declare function DivinaParsePromise(filePath: string, isDivina?: Divinais): Promise<Publication>;
export declare enum Divinais {
    LocalExploded = "LocalExploded",
    LocalPacked = "LocalPacked",
    RemoteExploded = "RemoteExploded"
}
export declare function isDivinaPublication(urlOrPath: string): Promise<Divinais | undefined>;
