import {Organization, OrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {Model} from "$shared/llignette/model/Model";
import {ModelBranch} from "$shared/llignette/model/ModelBranch";
import {ProjectId} from "$shared/llignette/nodes/structure/Project";


/** Interface to services related to organizations. */
export interface IOrganizationsService {
    /** Finds all organizations. */
    queryAllOrganizations(): Organization[]

    /** Finds one organization with given ID. */
    queryOrganizationById(organizationId: OrganizationId): Organization | null

    /** Finds the parent organization of a given project. */
    queryOrganizationByProjectId(projectId: ProjectId): Organization | null
}

/** Basic organizations service implementation that operates on a model instance. */
export class OrganizationsService implements IOrganizationsService {

    readonly #branch: ModelBranch

    constructor(
        model: Model,
        branchName: string
    ) {
        this.#branch = model.branches[branchName]
    }

    queryAllOrganizations(): Organization[] {
        let result: Organization[] = []

        const modelEdition = this.#branch.editions.item

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

    queryOrganizationById(organizationId: OrganizationId): Organization | null {
        const modelEdition = this.#branch.editions.item

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

    queryOrganizationByProjectId(projectId: ProjectId): Organization | null {
        const modelEdition = this.#branch.editions.item

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

}
