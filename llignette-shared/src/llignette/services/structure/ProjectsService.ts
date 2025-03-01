import {Project, ProjectId} from "$shared/llignette/nodes/structure/Project";
import {Model} from "$shared/llignette/model/Model";
import {ModelBranch} from "$shared/llignette/model/ModelBranch";
import {OrganizationId} from "$shared/llignette/nodes/structure/Organization";


/** Interface to services related to projects. */
export interface IProjectsService {
    /** Finds all projects of a given organization. */
    queryProjectsByOrgId(organizationId: OrganizationId): Project[]

    /** Finds one project with given ID. */
    queryProjectById(projectId: ProjectId): Project | null
}

/** Basic projects service implementation that operates on a model instance. */
export class ProjectsService implements IProjectsService {

    readonly #branch: ModelBranch

    constructor(
        model: Model,
        branchName: string
    ) {
        this.#branch = model.branches[branchName]
    }

    queryProjectsByOrgId(organizationId: OrganizationId): Project[] {
        let result: Project[] = []

        const modelEdition = this.#branch.editions.item

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

    queryProjectById(projectId: ProjectId): Project | null {
        const modelEdition = this.#branch.editions.item

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

}
