import {createId} from '@paralleldrive/cuid2'
import {Branded} from "$shared/util/Branded";
import {Named, NamedId, namedIdSchema} from "$shared/llignette/nodes/core/Named";


/** Branded type for a package ID. */
export type PackageId = NamedId & Branded<string, 'Package'>

/** The prefix for a package ID. */
const packageIdPrefix = 'pkg'

/** Validates the format of a package ID. */
const packageIdSchema =
    namedIdSchema
        .startsWith(`${packageIdPrefix}`, `Package ID must start with prefix '${packageIdPrefix}'.`)

/** Constructs a package ID from a string. */
export function toPackageId(id: unknown) {
    return packageIdSchema.parse(id) as PackageId
}

/** Manufactures a new unique package ID. */
export function makePackageId() {
    return toPackageId(`${packageIdPrefix}${createId()}`)
}

/** A package - a collection of subpackages and modules. */
export type Package = Named & {
    /** The unique ID of the package. */
    readonly id: PackageId
}

