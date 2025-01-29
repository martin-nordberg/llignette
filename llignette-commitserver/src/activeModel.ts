import {makeEmptyModel} from "$shared/llignette/model/Model";
import {makeTx} from "$shared/util/txcollections/Tx";
import {toModelId} from "$shared/llignette/model/ModelId";
import {makeOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {dispatch} from "$shared/llignette/model/ModelAction";
import {IModelService} from "$shared/llignette/services/ModelService";
import {OrganizationsService} from "$shared/llignette/services/structure/OrganizationsService";





export let activeModel = makeEmptyModel(makeTx(), toModelId('mdl0'))

activeModel = dispatch(makeTx(), activeModel,{
    kind: 'llignette.structure.create-organization',
    name: "Alpha",
    id: makeOrganizationId()
})
activeModel = dispatch(makeTx(), activeModel,{
    kind: 'llignette.structure.create-organization',
    name: "Beta",
    id: makeOrganizationId()
})
activeModel = dispatch(makeTx(), activeModel,{
    kind: 'llignette.structure.create-organization',
    name: "Gamma",
    id: makeOrganizationId()
})


export const activeModelService: IModelService = {
    organizationsService: new OrganizationsService(activeModel)
}

