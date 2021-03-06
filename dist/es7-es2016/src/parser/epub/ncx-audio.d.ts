export declare class Audio {
    ClipBegin: string;
    ClipEnd: string;
    Src1: string;
    get Src(): string;
    set Src(href: string);
    private _urlDecoded;
    get SrcDecoded(): string | undefined;
    set SrcDecoded(href: string | undefined);
    setSrcDecoded(href: string): void;
}
