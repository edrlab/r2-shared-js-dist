import { IZip } from "r2-utils-js/dist/es6-es2015/src/_utils/zip/zip";
import { NCX } from "./epub/ncx";
import { OPF } from "./epub/opf";
export declare const convertNccToOpfAndNcx: (zip: IZip, rootfilePathDecoded: string, rootfilePath: string) => Promise<[OPF, NCX]>;
