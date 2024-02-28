export declare function timeStrToSeconds(timeStr: string): number;
export declare class MediaOverlayNode {
    Text: string;
    Audio: string;
    Video: string;
    Role: string[];
    Children: MediaOverlayNode[];
    SmilPathInZip: string | undefined;
    initialized: boolean;
    ParID: string | undefined;
    SeqID: string | undefined;
    TextID: string | undefined;
    AudioID: string | undefined;
    VideoID: string | undefined;
    ImgID: string | undefined;
    AudioClipBegin: number | undefined;
    AudioClipEnd: number | undefined;
    VideoClipBegin: number | undefined;
    VideoClipEnd: number | undefined;
    duration: number | undefined;
    totalElapsedTime: number | undefined;
}
