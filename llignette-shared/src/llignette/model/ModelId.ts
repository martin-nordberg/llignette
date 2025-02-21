import {z} from "zod";

declare const __modelBrand: unique symbol;

/** Unique branded ID for a specific concrete model type. */
export type ModelId = string & {
    readonly [__modelBrand]: 'Model';
}

/** Validates the format of a model ID. */
const modelIdSchema =
    z.string({message: "Model ID must be a string."})
        .trim()
        .cuid2("Model ID must be in CUID2 format.")

/** Constructs a model ID from a string. */
export function toModelId(id: unknown) {
    return modelIdSchema.parse(id) as ModelId
}

