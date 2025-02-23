import {describe, it, expect} from 'vitest';
import {makeEmptyModel} from "$shared/llignette/model/Model";
import {makeOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {makeTx} from "$shared/util/txcollections/Tx";
import {toModelId} from "$shared/llignette/model/ModelId";
import {extendModelOnBranch} from "$shared/llignette/model/dispatchAction";

describe('Organization actions test', () => {
    it('manages organizations within a model', () => {
        let model = makeEmptyModel(makeTx(), toModelId('mdl0'))

        const org1Id = makeOrganizationId()
        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.structure.organization.create',
            changes: [
                {
                    name: "org1",
                    id: org1Id
                }
            ]
        })

        expect(model.branches["main"].editions.item.organizationIds.has(org1Id)).toBeTruthy()
        expect(model.branches["main"].editions.item.names.get(org1Id)).toEqual("org1")

        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.core.rename',
            changes: [
                {
                    name: "orgOne",
                    id: org1Id
                }
            ]
        })

        expect(model.branches["main"].editions.item.names.get(org1Id)).toEqual("orgOne")

        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.core.summarize',
            changes: [
                {
                    summary: "The first organization",
                    id: org1Id
                }
            ]
        })

        expect(model.branches["main"].editions.item.summaries.get(org1Id)).toEqual("The first organization")

        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.core.describe',
            changes: [
                {
                    description: "The first organization\nwith extra lines of text",
                    id: org1Id
                }
            ]
        })

        expect(model.branches["main"].editions.item.descriptions.get(org1Id)).toEqual("The first organization\nwith extra lines of text")

        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.core.remove-summary',
            changes: [
                {
                    id: org1Id
                }
            ]
        })

        expect(model.branches["main"].editions.item.summaries.get(org1Id)).toBeNull()
        expect(model.branches["main"].editions.priorLink?.item.summaries.get(org1Id)).toEqual("The first organization")

        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.core.remove-description',
            changes: [
                {
                    id: org1Id
                }
            ]
        })

        expect(model.branches["main"].editions.item.descriptions.get(org1Id)).toBeNull()
        expect(model.branches["main"].editions.priorLink?.item.descriptions.get(org1Id)).toEqual("The first organization\nwith extra lines of text")

    })
})