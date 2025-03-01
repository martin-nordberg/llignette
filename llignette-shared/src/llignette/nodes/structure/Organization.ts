import {createId} from "@paralleldrive/cuid2"
import {Branded} from "$shared/util/Branded";
import {Named, NamedId, namedIdSchema} from "$shared/llignette/nodes/core/Named";


/** Branded type for an organization ID. */
export type OrganizationId = NamedId & Branded<string, 'Organization'>

/** The prefix for an organization ID. */
const organizationIdPrefix = 'org'

/** Tests whether an ID is an organization ID. */
export function isOrganizationId(id: string) {
    return id.startsWith(organizationIdPrefix)
}

/** Validates the format of an organization ID. */
const organizationIdSchema = namedIdSchema
    .startsWith(`${organizationIdPrefix}`, `Organization ID must start with prefix '${organizationIdPrefix}'.`)

/** Constructs an organization ID from a string. */
export function toOrganizationId(id: unknown) {
    return organizationIdSchema.parse(id) as OrganizationId
}

/** Manufactures a new unique organization ID. */
export function makeOrganizationId() {
    return toOrganizationId(`${organizationIdPrefix}${createId()}`)
}

/** An organization (an account owning projects). */
export type Organization = Named & {

    /** The unique ID of the organization. */
    readonly id: OrganizationId

    // readonly projectsByName: Map<Name, Project>
}


