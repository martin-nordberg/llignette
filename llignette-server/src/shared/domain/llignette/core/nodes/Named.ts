import {Described} from "./Described";
import {z} from 'zod';
import {Branded} from "../../../../common/util/Branded";

/** Zod schema for name validation. */
const nameSchema = z.string().trim().regex(/^[A-Za-z_][A-Za-z0-9_-]*$/)

/** Name type with constraints (currently none come up to type level). */
type NameStr = z.infer<typeof nameSchema>

/** Branded string containing a name. */
export type Name = Branded<NameStr, 'Name'>

/**
 * Validates and brands a string to become a name.
 * @param name the raw name string
 */
export function toName(name: string): Name {
    return nameSchema.parse(name) as Name
}

/** A model entity with a name. */
export type Named<IdBrand> = Described<IdBrand> & {

    /** The name of the entity. */
    readonly name: Name

}
