import {Organization} from "$shared/llignette/nodes/structure/Organization";
import {Model} from "$shared/llignette/model/Model";


/** Interface to services related to organizations. */
export interface IOrganizationsService {
    /** Finds all organizations. */
    queryAllOrganizations(): Organization[]
}

/** Basic organizations service implementation that operates on a model instance. */
export class OrganizationsService implements IOrganizationsService {

    constructor(private readonly model: Model){}

    queryAllOrganizations(): Organization[] {
        let result: Organization[] = []

        this.model.currentEdition.allOrganizations.forEachHead(
            this.model.currentEdition.modelId,
            orgId => {
            result.push({
                id: orgId,
                name: this.model.currentEdition.names.get(orgId)!,
                summary: this.model.currentEdition.summaries.get(orgId),
                description: this.model.currentEdition.descriptions.get(orgId),
            })
        })

        result.sort((o1, o2) => o1.name.localeCompare(o2.name))
        return result
    }

}
