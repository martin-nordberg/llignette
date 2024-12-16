import {createId} from '@paralleldrive/cuid2';
import {Id} from "../core/Node";
import {Named} from "../core/Named";
import {z} from "zod";


/** Branded type for a project ID. */
export type ProjectId = Id<'Project'>

/** The prefix for a project ID. */
const projectIdPrefix = 'prj'

/** Validates the format of a project ID. */
const projectIdSchema =
    z.string({message: "Project ID must be a string."})
        .trim()
        .cuid2("Project ID must be in CUID2 format.")
        .startsWith(`${projectIdPrefix}`, `Project ID must start with prefix '${projectIdPrefix}'.`)

/** Constructs a project ID from a string. */
export function toProjectId(id: unknown) {
    return projectIdSchema.parse(id) as ProjectId
}

/** Manufactures a new unique project ID. */
export function newProjectId() {
    return toProjectId(`${projectIdPrefix}${createId()}`)
}

/** A project - a body of published code, a collection of modules within packages. */
export type Project = Named<'Project'> & {}

