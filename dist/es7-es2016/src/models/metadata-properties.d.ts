import { Encrypted } from "r2-lcp-js/dist/es7-es2016/src/models/metadata-encrypted";
export declare enum LayoutEnum {
    Fixed = "fixed",
    Reflowable = "reflowable"
}
export declare enum OrientationEnum {
    Auto = "auto",
    Landscape = "landscape",
    Portrait = "portrait"
}
export declare enum OverflowEnum {
    Auto = "auto",
    Paginated = "paginated",
    Scrolled = "scrolled",
    ScrolledContinuous = "scrolled-continuous"
}
export declare enum PageEnum {
    Left = "left",
    Right = "right",
    Center = "center"
}
export declare enum SpreadEnum {
    Auto = "auto",
    Both = "both",
    None = "none",
    Landscape = "landscape"
}
export declare class Properties {
    Contains: string[];
    Layout: string;
    Orientation: string;
    Overflow: string;
    Page: string;
    Spread: string;
    Encrypted: Encrypted;
    MediaOverlay: string;
}
