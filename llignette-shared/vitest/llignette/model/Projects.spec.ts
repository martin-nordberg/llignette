import { describe, it, expect } from 'vitest';
import {makeEmptyModel} from "$shared/llignette/model/Model";
import {makeOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {dispatch} from "$shared/llignette/model/ModelAction";
import {makeProjectId} from "$shared/llignette/nodes/structure/Project";
import {makeTx} from "$shared/util/txcollections/Tx";
import {toModelId} from "$shared/llignette/model/ModelId";

describe('Project actions test', () => {
    it('manages projects within a model', () => {
        let model = makeEmptyModel(makeTx(), toModelId('mdl0'))

        const orgId = makeOrganizationId()
        model = dispatch(makeTx(), model,{
            kind: 'llignette.structure.create-organization',
            changes: [{
                name: "org1",
                id: orgId
            }]
        })

        const projId = makeProjectId()
        model = dispatch(makeTx(), model,{
            kind: 'llignette.structure.create-project',
            changes: [
                {
                    name: "project1",
                    id: projId,
                    organizationId: orgId
                }
            ]
        })

        expect(model.currentEdition.projectIds.has(projId)).toBeTruthy()
        expect(model.currentEdition.names.get(projId)).toEqual("project1")
        expect(model.currentEdition.projectOwnerships.getTail(projId)).toEqual(orgId)

        model = dispatch(makeTx(), model,{
            kind: 'llignette.core.rename',
            changes: [
                {
                    name: "projectOne",
                    id: projId
                }
            ]

        })

        expect(model.currentEdition.names.get(projId)).toEqual("projectOne")

        model = dispatch(makeTx(), model,{
            kind: 'llignette.core.summarize',
            changes: [
                {
                    summary: "The first project",
                    id: projId
                }
            ]

        })

        expect(model.currentEdition.summaries.get(projId)).toEqual("The first project")

        model = dispatch(makeTx(), model,{
            kind: 'llignette.core.describe',
            changes: [
                {
                    description: "The first project\nwith extra lines of text",
                    id: projId
                }
            ]

        })

        expect(model.currentEdition.descriptions.get(projId)).toEqual("The first project\nwith extra lines of text")


    })
})