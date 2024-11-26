import {Named} from "../../core/nodes/Named";
import {Id} from "../../core/nodes/Node";


/** Branded type for a project ID. */
export type ProjectId = Id<'Project'>

/** Constructs a project ID from a string. */
export function toProjectId(id: string) {
    return id as ProjectId
}

/** A project - a body of published code, a collection of modules within packages. */
export type Project = Named<'Project'> & {}

