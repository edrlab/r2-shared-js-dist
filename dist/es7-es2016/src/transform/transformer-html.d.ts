import { Publication } from "../models/publication";
import { Link } from "../models/publication-link";
import { IStreamAndLength } from "r2-utils-js/dist/es7-es2016/src/_utils/zip/zip";
import { ITransformer } from "./transformer";
export declare class TransformerHTML implements ITransformer {
    private readonly transformString;
    constructor(transformerFunction: (publication: Publication, link: Link, data: string) => string);
    supports(publication: Publication, link: Link): boolean;
    transformStream(publication: Publication, link: Link, stream: IStreamAndLength, _isPartialByteRangeRequest: boolean, _partialByteBegin: number, _partialByteEnd: number): Promise<IStreamAndLength>;
    private transformBuffer;
}
