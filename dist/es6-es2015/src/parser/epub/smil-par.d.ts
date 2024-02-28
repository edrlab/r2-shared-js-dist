import { Audio } from "./smil-audio";
import { Video } from "./smil-video";
import { Img } from "./smil-img";
import { SeqOrPar } from "./smil-seq-or-par";
import { Text } from "./smil-text";
export declare class Par extends SeqOrPar {
    Text: Text;
    Audio: Audio;
    Video: Video;
    Img: Img;
}
