import {createId} from "@paralleldrive/cuid2";
import {Id} from "../core/Node";
import {Named} from "../core/Named";
import {z} from "zod";


/** Branded type for an organization ID. */
export type OrganizationId = Id<'Organization'>

/** The prefix for an organization ID. */
const organizationIdPrefix = 'org'

/** Validates the format of an organization ID. */
const organizationIdSchema =
    z.string({message: "Organization ID must be a string."})
        .trim()
        .cuid2("Organization ID must be in CUID2 format.")
        .startsWith(`${organizationIdPrefix}`, `Organization ID must start with prefix '${organizationIdPrefix}'.`)

/** Constructs an organization ID from a string. */
export function toOrganizationId(id: unknown) {
    return organizationIdSchema.parse(id) as OrganizationId
}

/** Manufactures a new unique organization ID. */
export function newOrganizationId() {
    return toOrganizationId(`${organizationIdPrefix}${createId()}`)
}

/** An organization (an account owning projects). */
export type Organization = Named<'Organization'> & {}

