import { Publication } from "../models/publication";
import { Link } from "../models/publication-link";
import { IStreamAndLength } from "r2-utils-js/dist/es7-es2016/src/_utils/zip/zip";
import { ITransformer } from "./transformer";
export declare type TTransformFunction = (publication: Publication, link: Link, data: string, sessionInfo: string | undefined) => string;
export declare class TransformerHTML implements ITransformer {
    private readonly transformString;
    constructor(transformerFunction: TTransformFunction);
    supports(publication: Publication, link: Link): boolean;
    transformStream(publication: Publication, link: Link, stream: IStreamAndLength, _isPartialByteRangeRequest: boolean, _partialByteBegin: number, _partialByteEnd: number, sessionInfo: string | undefined): Promise<IStreamAndLength>;
    private transformBuffer;
}
