import { SeqOrPar } from "./smil-seq-or-par";
export declare class Seq extends SeqOrPar {
    Children: SeqOrPar[];
    TextRef1: string;
    TextRef: string;
    private _urlDecoded;
    TextRefDecoded: string | undefined;
    setTextRefDecoded(href: string): void;
}
