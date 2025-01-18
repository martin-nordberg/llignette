import {createId} from '@paralleldrive/cuid2'
import {Branded} from "$shared/util/Branded";
import {Named, NamedId, namedIdSchema} from "$shared/llignette/nodes/core/Named";
import {OrganizationId} from "$shared/llignette/nodes/structure/Organization";


/** Branded type for a project ID. */
export type ProjectId = NamedId & Branded<string, 'Project'>

/** The prefix for a project ID. */
const projectIdPrefix = 'prj'

/** Validates the format of a project ID. */
const projectIdSchema =
    namedIdSchema
        .startsWith(`${projectIdPrefix}`, `Project ID must start with prefix '${projectIdPrefix}'.`)

/** Constructs a project ID from a string. */
export function toProjectId(id: unknown) {
    return projectIdSchema.parse(id) as ProjectId
}

/** Manufactures a new unique project ID. */
export function makeProjectId() {
    return toProjectId(`${projectIdPrefix}${createId()}`)
}

/** A project - a body of published code, a collection of modules within packages. */
export type Project = Named & {
    /** The unique ID of the project. */
    readonly id: ProjectId

    readonly parentOrganizationId: OrganizationId
}

