import { BelongsTo } from "./metadata-belongsto";
import { Contributor } from "./metadata-contributor";
import { MediaOverlay } from "./metadata-media-overlay";
import { IStringMap } from "./metadata-multilang";
import { Properties } from "./metadata-properties";
import { Subject } from "./metadata-subject";
export declare class Metadata {
    RDFType: string;
    Title: string | IStringMap;
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
    Description: string;
    Direction: string;
    Rendition: Properties;
    Source: string;
    EpubType: string[];
    Rights: string;
    Subject: Subject[];
    BelongsTo: BelongsTo;
    Duration: number;
    MediaOverlay: MediaOverlay;
    private _OnDeserialized();
}