import {createId} from '@paralleldrive/cuid2'
import {Branded} from "$shared/util/Branded";
import {Named, NamedId, namedIdSchema} from "$shared/llignette/nodes/core/Named";
import {PackageId} from "$shared/llignette/nodes/structure/Package";


/** Branded type for a module ID. */
export type ModuleId = NamedId & Branded<string, 'Module'>

/** The prefix for a module ID. */
const moduleIdPrefix = 'mod'

/** Validates the format of a module ID. */
const moduleIdSchema =
    namedIdSchema
        .startsWith(`${moduleIdPrefix}`, `Module ID must start with prefix '${moduleIdPrefix}'.`)

/** Constructs a module ID from a string. */
export function toModuleId(id: unknown) {
    return moduleIdSchema.parse(id) as ModuleId
}

/** Manufactures a new unique module ID. */
export function makeModuleId() {
    return toModuleId(`${moduleIdPrefix}${createId()}`)
}

/** A module - a collection of code. */
export type Module = Named & {
    /** The unique ID of the module. */
    readonly id: ModuleId
}

