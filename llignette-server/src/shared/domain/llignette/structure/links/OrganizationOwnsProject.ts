import {ProjectId} from "../nodes/Project";
import {OrganizationId} from "../nodes/Organization";

/** Edge type: Organization owns Project */
export type OrganizationOwnsProject = {

    /** The owning organization */
    readonly organizationId: OrganizationId,

    /** The owned project. */
    readonly projectId: ProjectId

}

/** Edge type collection for OrganizationOwnsProject */
export type OrganizationsOwnProjects = {

    /** Ownership keyed by organization ID */
    readonly byOrganization: Map<OrganizationId, Set<OrganizationOwnsProject>>,

    /** Ownership keyed by project ID */
    readonly byProject: Map<ProjectId, OrganizationOwnsProject>

}

/** Makes a new map pair for organization-owns-project edges. */
export function OrganizationsOwnProjects(): OrganizationsOwnProjects {
    return {
        byOrganization: new Map<OrganizationId, Set<OrganizationOwnsProject>>(),
        byProject: new Map<ProjectId, OrganizationOwnsProject>(),
    }
}

