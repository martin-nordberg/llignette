import {ProjectId} from "../../nodes/structure/Project";
import {OrganizationId} from "../../nodes/structure/Organization";

/** Edge type: Organization owns Project */
export type ProjectOwnership = {

    /** The owning organization */
    readonly organizationId: OrganizationId,

    /** The owned project. */
    readonly projectId: ProjectId

}

/** Edge type collection for ProjectOwnership */
export type ProjectOwnerships = {

    /** Ownership keyed by organization ID */
    readonly byOrganization: Map<OrganizationId, Set<ProjectOwnership>>,

    /** Ownership keyed by project ID */
    readonly byProject: Map<ProjectId, ProjectOwnership>

}

/** Makes a new map pair for organization-owns-project edges. */
export function ProjectOwnerships(): ProjectOwnerships {
    return {
        byOrganization: new Map<OrganizationId, Set<ProjectOwnership>>(),
        byProject: new Map<ProjectId, ProjectOwnership>(),
    }
}

