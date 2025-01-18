import {z} from 'zod';
import {Branded} from "$shared/util/Branded";
import {Described, DescribedId, describedIdSchema} from "$shared/llignette/nodes/core/Described";


declare const __namedBrand: unique symbol;

/** Unique branded ID for a specific concrete node type. */
export type NamedId = DescribedId & {
    readonly [__namedBrand]: 'Named';
}

/** Validates the format of a node ID. */
export const namedIdSchema =
    describedIdSchema

/** Constructs a named node ID from a string. */
export function toNamedId(id: unknown) {
    return namedIdSchema.parse(id) as NamedId
}

/** Zod schema for name validation. */
const nameSchema = z.string()
    .trim()
    .min(1, "Name must not be empty.")
    .max(100, "Name can be at most 100 characters.")
    .regex(/^[A-Za-z_][A-Za-z0-9_-]*$/)

/** Name type with constraints (currently none come up to type level). */
type NameStr = z.infer<typeof nameSchema>

/** Branded string containing a name. */
export type Name = Branded<NameStr, 'Name'>

/**
 * Validates and brands a string to become a name.
 * @param name the raw name string
 */
export function toName(name: unknown): Name {
    return nameSchema.parse(name) as Name
}

/** A model entity with a name. */
export type Named = Described & {

    /** The unique ID of the entity. */
    readonly id: NamedId

    /** The name of the entity. */
    readonly name: Name

}
