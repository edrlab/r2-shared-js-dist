import { MediaOverlayNode } from "./media-overlay";
import { Properties } from "./metadata-properties";
export declare class Link {
    Href: string;
    TypeLink: string;
    Height: number;
    Width: number;
    Title: string;
    Properties: Properties;
    Duration: number;
    Bitrate: number;
    Templated: boolean;
    Children: Link[];
    MediaOverlays: MediaOverlayNode[] | undefined;
    Rel: string[];
    AddRels(rels: string[]): void;
    AddRel(rel: string): void;
    HasRel(rel: string): boolean;
    private _OnDeserialized;
}
