import { IZip } from "r2-utils-js/dist/es8-es2017/src/_utils/zip/zip";
import { NCX } from "./epub/ncx";
import { OPF } from "./epub/opf";
export declare const convertNccToOpfAndNcx: (zip: IZip, rootfilePathDecoded: string, rootfilePath: string) => Promise<[OPF, NCX]>;
