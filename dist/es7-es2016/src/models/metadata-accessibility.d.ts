import { IStringMap } from "./metadata-multilang";
import { AccessibilityCertification } from "./metadata-accessibility-certification";
export declare class AccessibilityMetadata {
    Certification: AccessibilityCertification;
    ConformsTo: string[];
    Summary: string | IStringMap;
    AccessMode: string[];
    AccessModeSufficient: (string[])[];
    Feature: string[];
    Hazard: string[];
}
