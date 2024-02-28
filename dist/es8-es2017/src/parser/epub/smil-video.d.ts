export declare class Video {
    ID: string;
    ClipBegin1: string;
    ClipBegin2: string | undefined;
    get ClipBegin(): string | undefined;
    set ClipBegin(clipBegin: string | undefined);
    ClipEnd1: string;
    ClipEnd2: string | undefined;
    get ClipEnd(): string | undefined;
    set ClipEnd(clipEnd: string | undefined);
    EpubType: string;
    Src1: string;
    get Src(): string;
    set Src(href: string);
    private _urlDecoded;
    get SrcDecoded(): string | undefined;
    set SrcDecoded(href: string | undefined);
    setSrcDecoded(href: string): void;
}
