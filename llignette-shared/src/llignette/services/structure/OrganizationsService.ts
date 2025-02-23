import {Organization} from "$shared/llignette/nodes/structure/Organization";
import {Model} from "$shared/llignette/model/Model";


/** Interface to services related to organizations. */
export interface IOrganizationsService {
    /** Finds all organizations. */
    queryAllOrganizations(): Organization[]
}

/** Basic organizations service implementation that operates on a model instance. */
export class OrganizationsService implements IOrganizationsService {

    constructor(
        private readonly model: Model,
        private readonly branchName: string
    ) {
    }

    queryAllOrganizations(): Organization[] {
        let result: Organization[] = []

        const modelEdition = this.model.branches[this.branchName].editions.item

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

}
