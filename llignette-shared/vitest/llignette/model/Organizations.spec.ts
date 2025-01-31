import { describe, it, expect } from 'vitest';
import {makeEmptyModel} from "$shared/llignette/model/Model";
import {makeOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {dispatch} from "$shared/llignette/model/ModelAction";
import {makeTx} from "$shared/util/txcollections/Tx";
import {toModelId} from "$shared/llignette/model/ModelId";

describe('Organization actions test', () => {
    it('manages organizations within a model', () => {
        let model = makeEmptyModel(makeTx(), toModelId('mdl0'))

        const org1Id = makeOrganizationId()
        model = dispatch(makeTx(), model,{
            kind: 'llignette.structure.create-organization',
            changes: [
                {
                    name: "org1",
                    id: org1Id
                }
            ]

        })

        expect(model.currentEdition.organizationIds.has(org1Id)).toBeTruthy()
        expect(model.currentEdition.names.get(org1Id)).toEqual("org1")

        model = dispatch(makeTx(), model,{
            kind: 'llignette.core.rename',
            changes: [
                {
                    name: "orgOne",
                    id: org1Id
                }
            ]

        })

        expect(model.currentEdition.names.get(org1Id)).toEqual("orgOne")

        model = dispatch(makeTx(), model,{
            kind: 'llignette.core.summarize',
            changes: [
                {
                    summary: "The first organization",
                    id: org1Id
                }
            ]

        })

        expect(model.currentEdition.summaries.get(org1Id)).toEqual("The first organization")

        model = dispatch(makeTx(), model,{
            kind: 'llignette.core.describe',
            changes: [
                {
                    description: "The first organization\nwith extra lines of text",
                    id: org1Id
                }
            ]

        })

        expect(model.currentEdition.descriptions.get(org1Id)).toEqual("The first organization\nwith extra lines of text")

        model = dispatch(makeTx(), model,{
            kind: 'llignette.core.remove-summary',
            changes: [
                {
                    id: org1Id
                }
            ]

        })

        expect(model.currentEdition.summaries.get(org1Id)).toBeNull()
        expect(model.priorEdition.summaries.get(org1Id)).toEqual("The first organization")

        model = dispatch(makeTx(), model,{
            kind: 'llignette.core.remove-description',
            changes: [
                {
                    id: org1Id
                }
            ]

        })

        expect(model.currentEdition.descriptions.get(org1Id)).toBeNull()
        expect(model.priorEdition.descriptions.get(org1Id)).toEqual("The first organization\nwith extra lines of text")

    })
})