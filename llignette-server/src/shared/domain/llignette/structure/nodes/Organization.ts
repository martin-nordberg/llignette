import {Named} from "../../core/nodes/Named";
import {Id} from "../../core/nodes/Node";

/** Branded type for an organization ID. */
export type OrganizationId = Id<'Organization'>

/** Constructs an organization ID from a string. */
export function toOrganizationId(id: string) {
    return id as OrganizationId
}

/** An organization (an account owning projects) */
export type Organization = Named<'Organization'> & {}

