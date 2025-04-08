import {makeEmptyModel} from "$shared/llignette/model/Model";
import {makeTx} from "$shared/util/txcollections/Tx";
import {toModelId} from "$shared/llignette/model/ModelId";
import {makeOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {IModelService} from "$shared/llignette/services/ModelService";
import {OrganizationsService} from "$shared/llignette/services/structure/OrganizationServices";
import {extendModelOnBranch} from "$shared/llignette/model/dispatchAction";
import {ProjectsService} from "$shared/llignette/services/structure/ProjectServices";


export let activeModel = makeEmptyModel(makeTx(), toModelId('mdl0'))

activeModel = extendModelOnBranch(
    makeTx(),
    activeModel,
    "main",
    {
        kind: 'llignette.structure.organization.create',
        changes: [
            {
                name: "Alpha",
                id: makeOrganizationId()
            }, {
                name: "Beta",
                id: makeOrganizationId()
            }, {
                name: "Charlie",
                id: makeOrganizationId()
            }, {
                name: "Delta",
                id: makeOrganizationId()
            }
        ]
    }
)


export const activeModelService: IModelService = {
    organizationsService: new OrganizationsService(activeModel, "main"),
    projectsService: new ProjectsService(activeModel, "main")
}

