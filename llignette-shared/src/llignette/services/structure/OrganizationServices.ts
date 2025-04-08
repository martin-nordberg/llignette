import {Organization, OrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {Model} from "$shared/llignette/model/Model";
import {ProjectId} from "$shared/llignette/nodes/structure/Project";
import {fail} from "$shared/util/Assertions";


/** Interface to services related to organizations. */
export interface IOrganizationServices {
    /** Finds one organization with given ID. */
    findOrganizationById(organizationId: OrganizationId): Organization | null

    /** Finds the parent organization of a given project. */
    findOrganizationByProjectId(projectId: ProjectId): Organization | null

    /** Finds all organizations. */
    findOrganizationsAll(): Organization[]
}

/** Finds one organization with given ID. */
export function findOrganizationById(model: Model, branchName: string, organizationId: OrganizationId): Organization | null {
    const branch = model.branches[branchName] ?? fail(`Branch "${branchName}" does not exist`)
    const modelEdition = branch.editions.item

    if (!modelEdition.organizationIds.has(organizationId)) {
        return null
    }

    return {
        id: organizationId,
        name: modelEdition.names.get(organizationId)!,
        summary: modelEdition.summaries.get(organizationId),
        description: modelEdition.descriptions.get(organizationId),
    }
}

/** Finds the parent organization of a given project. */
export function findOrganizationByProjectId(model: Model, branchName: string, projectId: ProjectId): Organization | null {
    const branch = model.branches[branchName] ?? fail(`Branch "${branchName}" does not exist`)
    const modelEdition = branch.editions.item

    if (!modelEdition.projectIds.has(projectId)) {
        return null
    }

    const organizationId = modelEdition.projectOwnerships.getTail(projectId)!

    return {
        id: organizationId,
        name: modelEdition.names.get(organizationId)!,
        summary: modelEdition.summaries.get(organizationId),
        description: modelEdition.descriptions.get(organizationId),
    }
}

/** Finds all organizations. */
export function findOrganizationsAll(model: Model, branchName: string): Organization[] {
    const branch = model.branches[branchName] ?? fail(`Branch "${branchName}" does not exist`)
    const modelEdition = branch.editions.item

    let result: Organization[] = []

    modelEdition.allOrganizations.forEachHead(
        modelEdition.modelId,
        orgId => {
            result.push({
                id: orgId,
                name: modelEdition.names.get(orgId)!,
                summary: modelEdition.summaries.get(orgId),
                description: modelEdition.descriptions.get(orgId),
            })
        }
    )

    result.sort((o1, o2) => o1.name.localeCompare(o2.name))
    return result
}

