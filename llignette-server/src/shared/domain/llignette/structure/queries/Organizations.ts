import {Organization} from "../../nodes/structure/Organization";
import {Model} from "../../model/Model";


export function getAllOrganizations(model: Model): Organization[] {
    const result = model.nodes.organizations.getAll()
    result.sort((o1, o2) => o1.name.localeCompare(o2.name))
    return result
}
