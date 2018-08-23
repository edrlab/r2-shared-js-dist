import { LCP } from "r2-lcp-js/dist/es8-es2017/src/parser/epub/lcp";
import { IInternal } from "./internal";
import { Metadata } from "./metadata";
import { Link } from "./publication-link";
export declare class Publication {
    Context: string[];
    Metadata: Metadata;
    Links: Link[];
    Spine: Link[];
    Resources: Link[];
    TOC: Link[];
    PageList: Link[];
    Landmarks: Link[];
    LOI: Link[];
    LOA: Link[];
    LOV: Link[];
    LOT: Link[];
    LCP: LCP | undefined;
    private Internal;
    freeDestroy(): void;
    findFromInternal(key: string): IInternal | undefined;
    AddToInternal(key: string, value: any): void;
    GetCover(): Link | undefined;
    GetNavDoc(): Link | undefined;
    searchLinkByRel(rel: string): Link | undefined;
    AddLink(typeLink: string, rel: string[], url: string, templated: boolean | undefined): void;
    private _OnDeserialized;
}
