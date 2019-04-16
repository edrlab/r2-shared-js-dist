import { BelongsTo } from "./metadata-belongsto";
import { Contributor } from "./metadata-contributor";
import { MediaOverlay } from "./metadata-media-overlay";
import { IStringMap } from "./metadata-multilang";
import { Properties } from "./metadata-properties";
import { Subject } from "./metadata-subject";
export declare enum DirectionEnum {
    Auto = "auto",
    RTL = "rtl",
    LTR = "ltr"
}
export declare class Metadata {
    RDFType: string;
    Title: string | IStringMap;
    SubTitle: string | IStringMap;
    Identifier: string;
    Author: Contributor[];
    Translator: Contributor[];
    Editor: Contributor[];
    Artist: Contributor[];
    Illustrator: Contributor[];
    Letterer: Contributor[];
    Penciler: Contributor[];
    Colorist: Contributor[];
    Inker: Contributor[];
    Narrator: Contributor[];
    Contributor: Contributor[];
    Publisher: Contributor[];
    Imprint: Contributor[];
    Language: string[];
    Modified: Date;
    PublicationDate: Date;
    SortAs2: string;
    SortAs1: string | undefined;
    SortAs: string | undefined;
    Description: string;
    Direction2: string;
    Direction1: string | undefined;
    Direction: string | undefined;
    BelongsTo2: BelongsTo;
    BelongsTo1: BelongsTo | undefined;
    BelongsTo: BelongsTo | undefined;
    Duration: number;
    NumberOfPages: number;
    MediaOverlay: MediaOverlay;
    Rights: string;
    Rendition: Properties;
    Source: string;
    Subject: Subject[];
    protected _OnDeserialized(): void;
}
