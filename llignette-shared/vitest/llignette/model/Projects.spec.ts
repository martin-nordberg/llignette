import {describe, it, expect} from 'vitest';
import {makeEmptyModel} from "$shared/llignette/model/Model";
import {makeOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {makeProjectId} from "$shared/llignette/nodes/structure/Project";
import {makeTx} from "$shared/util/txcollections/Tx";
import {toModelId} from "$shared/llignette/model/ModelId";
import {extendModelOnBranch} from "$shared/llignette/model/dispatchAction";

describe('Project actions test', () => {
    it('manages projects within a model', () => {
        let model = makeEmptyModel(makeTx(), toModelId('mdl0'))

        const orgId = makeOrganizationId()
        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.structure.organization.create',
            changes: [{
                name: "org1",
                id: orgId
            }]
        })

        const proj1Id = makeProjectId()
        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.structure.project.create',
            changes: [
                {
                    name: "project1",
                    id: proj1Id,
                    organizationId: orgId
                }
            ]
        })

        const proj2Id = makeProjectId()
        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.structure.project.create',
            changes: [
                {
                    name: "project2",
                    id: proj2Id,
                    organizationId: orgId
                }
            ]
        })

        expect(model.branches["main"].editions.item.projectIds.has(proj1Id)).toBeTruthy()
        expect(model.branches["main"].editions.item.names.get(proj1Id)).toEqual("project1")
        expect(model.branches["main"].editions.item.projectOwnerships.getTail(proj1Id)).toEqual(orgId)
        expect(model.branches["main"].editions.item.projectIds.has(proj2Id)).toBeTruthy()
        expect(model.branches["main"].editions.item.names.get(proj2Id)).toEqual("project2")
        expect(model.branches["main"].editions.item.projectOwnerships.getTail(proj2Id)).toEqual(orgId)

        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.core.rename',
            changes: [
                {
                    name: "projectOne",
                    id: proj1Id
                }
            ]
        })

        expect(model.branches["main"].editions.item.names.get(proj1Id)).toEqual("projectOne")

        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.core.summarize',
            changes: [
                {
                    summary: "The first project",
                    id: proj1Id
                }
            ]
        })

        expect(model.branches["main"].editions.item.summaries.get(proj1Id)).toEqual("The first project")

        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.core.describe',
            changes: [
                {
                    description: "The first project\nwith extra lines of text",
                    id: proj1Id
                }
            ]
        })

        expect(model.branches["main"].editions.item.descriptions.get(proj1Id)).toEqual("The first project\nwith extra lines of text")

        model = extendModelOnBranch(makeTx(), model, "main", {
            kind: 'llignette.structure.project.add-dependency',
            changes: [
                {
                    consumerId: proj1Id,
                    supplierId: proj2Id
                }
            ]
        })

        let count = 0
        model.branches["main"].editions.item.projectDependencies.forEachHead(proj1Id, supplierId => {
            count += 1
            expect(supplierId).toEqual(proj2Id)
        })
        expect(count).toEqual(1)

        count = 0
        model.branches["main"].editions.item.projectDependencies.forEachTail(proj2Id, supplierId => {
            count += 1
            expect(supplierId).toEqual(proj1Id)
        })
        expect(count).toEqual(1)


    })
})