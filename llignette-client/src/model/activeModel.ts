import {makeEmptyModel} from "$shared/llignette/model/Model";
import {makeTx} from "$shared/util/txcollections/Tx";
import {toModelId} from "$shared/llignette/model/ModelId";
import {makeOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {ModelService} from "$shared/llignette/services/ModelService";
import {extendModelOnBranch} from "$shared/llignette/model/dispatchAction";
import {makeProjectId} from "$shared/llignette/nodes/structure/Project";


export let activeModel = makeEmptyModel(makeTx(), toModelId('mdl0'))

const orgA = makeOrganizationId()
const orgB = makeOrganizationId()
const orgC = makeOrganizationId()
const orgD = makeOrganizationId()
const prjA1 = makeProjectId()
const prjA2 = makeProjectId()

activeModel = extendModelOnBranch(
    makeTx(),
    activeModel,
    "main",
    {
        kind: 'llignette.structure.organization.create',
        changes: [
            {
                name: "Alpha",
                id: orgA
            }, {
                name: "Beta",
                id: orgB
            }, {
                name: "Charlie",
                id: orgC
            }, {
                name: "Delta",
                id: orgD
            }
        ]
    }
)

activeModel = extendModelOnBranch(
    makeTx(),
    activeModel,
    "main",
    {
        kind: 'llignette.structure.project.create',
        changes: [
            {
                id: prjA1,
                name: "ProjectA1",
                organizationId: orgA
            },
            {
                id: prjA2,
                name: "ProjectA2",
                organizationId: orgA
            }
        ]
    }
)

activeModel = extendModelOnBranch(
    makeTx(),
    activeModel,
    "main",
    {
        kind: 'llignette.core.summarize',
        changes: [
            {
                id: orgA,
                summary: "The first and best"
            }, {
                id: orgB,
                summary: "The second and very good"
            }, {
                id: prjA1,
                summary: "The first project"
            }
        ]
    }
)

activeModel = extendModelOnBranch(
    makeTx(),
    activeModel,
    "main",
    {
        kind: 'llignette.core.describe',
        changes: [
            {
                id: orgA,
                description: "It can be described as the first.\nIt can also be described as the best."
            }, {
                id: prjA1,
                description: "This project is very interesting.\nIt is described by these words."
            }
        ]
    }
)


export let activeModelService: ModelService = new ModelService(activeModel, "main")

// TODO: store or better custom mechanism
export function updateActiveModelService(model: ModelService) {
    activeModelService = model
}