import { IPropertyConverter, JsonValue } from "ta-json-x";
import { Collection } from "./metadata-collection";
export declare class JsonCollectionConverter implements IPropertyConverter {
    serialize(property: Collection): JsonValue;
    deserialize(value: JsonValue): Collection;
    collapseArrayWithSingleItem(): boolean;
}
