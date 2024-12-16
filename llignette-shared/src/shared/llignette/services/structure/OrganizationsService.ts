import {Model} from "../../model/Model";
import {Organization} from "../../nodes/structure/Organization";


/** Interface to services related to organizations. */
export interface IOrganizationsService {
    /** Finds all organizations. */
    queryAllOrganizations(): Organization[]
}

/** Basic organizations service implementation that operates on a model instance. */
export class OrganizationsService implements IOrganizationsService {

    constructor(private readonly model: Model){}

    queryAllOrganizations(): Organization[] {
        const result = this.model.nodes.organizations.getAll()
        result.sort((o1, o2) => o1.name.localeCompare(o2.name))
        return result
    }

}
