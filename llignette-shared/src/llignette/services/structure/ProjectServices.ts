import {Project, ProjectId} from "$shared/llignette/nodes/structure/Project";
import {Model} from "$shared/llignette/model/Model";
import {OrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {fail} from "$shared/util/Assertions";


/** Interface to services related to projects. */
export interface IProjectServices {
    /** Finds one project with given ID. */
    findProjectById(projectId: ProjectId): Project | null

    /** Finds all projects of a given organization. */
    findProjectsByOrganizationId(organizationId: OrganizationId): Project[]
}


/** Finds one project with given ID. */
export function findProjectById(model: Model, branchName: string, projectId: ProjectId): Project | null {
    const branch = model.branches[branchName] ?? fail(`Branch "${branchName}" does not exist`)
    const modelEdition = branch.editions.item

    if (!modelEdition.projectIds.has(projectId)) {
        return null
    }

    return {
        id: projectId,
        name: modelEdition.names.get(projectId)!,
        summary: modelEdition.summaries.get(projectId),
        description: modelEdition.descriptions.get(projectId),
    }
}

/** Finds all projects of a given organization. */
export function findProjectsByOrganizationId(model: Model, branchName: string, organizationId: OrganizationId): Project[] {
    const branch = model.branches[branchName] ?? fail(`Branch "${branchName}" does not exist`)
    const modelEdition = branch.editions.item

    let result: Project[] = []

    modelEdition.projectOwnerships.forEachHead(
        organizationId,
        prjId => {
            result.push({
                id: prjId,
                name: modelEdition.names.get(prjId)!,
                summary: modelEdition.summaries.get(prjId),
                description: modelEdition.descriptions.get(prjId),
            })
        }
    )

    result.sort((o1, o2) => o1.name.localeCompare(o2.name))
    return result
}

