import {Project, ProjectId, toProjectId} from "../structure/nodes/Project";
import {Organization, OrganizationId, toOrganizationId} from "../structure/nodes/Organization";
import {OrganizationOwnsProject} from "../structure/links/OrganizationOwnsProject";
import {Id, Node} from "../core/nodes/Node";
import {Model} from "./Model";

export type NodeLens<IdBrand, T extends Node<IdBrand>> = {
    get(model: Model, id: Id<IdBrand>): T
    getDeleted(model: Model, id: Id<IdBrand>): T
    idPrefix(): string,
    initializeLinkSets(model: Model, node: T): void
    put(model: Model, node: T): void
    toId(idStr: string): Id<IdBrand>
}

export const projectLens: NodeLens<'Project', Project> = {
    get(model: Model, id: ProjectId): Project {
        return model.nodes.projects.get(id)
    },

    getDeleted(model: Model, id: ProjectId): Project {
        return model.nodes.projects.getDeleted(id)
    },

    idPrefix(): string {
        return 'prj'
    },

    initializeLinkSets(_model: Model, _project: Project) {
        // none so far
    },

    put(model: Model, project: Project): void {
        model.nodes.projects.put(project)
    },

    toId(idStr: string): ProjectId {
        return toProjectId(idStr)
    }
}

export const organizationLens: NodeLens<'Organization', Organization> = {
    get(model: Model, id: OrganizationId): Organization {
        return model.nodes.organizations.get(id)
    },

    getDeleted(model: Model, id: OrganizationId): Organization {
        return model.nodes.organizations.getDeleted(id)
    },

    idPrefix(): string {
        return 'org'
    },

    initializeLinkSets(model: Model, organization: Organization): void {
        model.links.organizationsOwnProjects.byOrganization.set(organization.id, new Set<OrganizationOwnsProject>())
    },

    put(model: Model, organization: Organization): void {
        model.nodes.organizations.put(organization)
    },

    toId(idStr: string): OrganizationId {
        return toOrganizationId(idStr)
    }
}