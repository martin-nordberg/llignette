import {fail} from "$shared/util/Assertions";
import {ProjectId, toProjectId} from "$shared/llignette/nodes/structure/Project";
import {ModelAction} from "$shared/llignette/model/ModelAction";
import {Name, toName} from "$shared/llignette/nodes/core/Named";
import {OrganizationId, toOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {ModelEdition} from "$shared/llignette/model/ModelEdition";
import {Tx} from "$shared/util/txcollections/Tx";


/** A model action to create an organization. */
export type CreateOrganizationAction = ModelAction & {
    kind: 'llignette.structure.create-organization',
    name: Name,
    id: OrganizationId,
}

function createOrganization(tx: Tx, priorEdition: ModelEdition, action: CreateOrganizationAction) {
    priorEdition.organizationIds.add(tx, action.id)
    priorEdition.names.set(tx, action.id, action.name)
    priorEdition.allOrganizations.add(tx, priorEdition.modelId, action.id)
}


/** A model action to delete an organization. */
export type RemoveOrganizationAction = ModelAction & {
    kind: 'llignette.structure.remove-organization',
    id: OrganizationId,
}

function removeOrganization(tx: Tx, priorEdition: ModelEdition, action: RemoveOrganizationAction) {
    // TODO: delete contents & links
    priorEdition.allOrganizations.delete(tx, action.id)
    priorEdition.organizationIds.delete(tx, action.id)
}


/** A model action to create a project. */
export type CreateProjectAction = ModelAction & {
    kind: 'llignette.structure.create-project',
    name: Name,
    id: ProjectId,
    organizationId: OrganizationId,
}

function createProject(tx: Tx, priorEdition: ModelEdition, action: CreateProjectAction) {
    priorEdition.projectIds.add(tx, action.id)
    priorEdition.names.set(tx, action.id, action.name)
    priorEdition.projectOwnerships.add(tx, action.organizationId, action.id)
}


/** A model action to delete a project. */
export type RemoveProjectAction = ModelAction & {
    kind: 'llignette.structure.remove-project',
    id: ProjectId,
}

function removeProject(tx: Tx, priorEdition: ModelEdition, action: RemoveProjectAction) {
    // TODO: delete contents & links
    priorEdition.projectIds.delete(tx, action.id)
    priorEdition.projectOwnerships.delete(tx, action.id)
}



export function dispatchStructureAction(tx: Tx, priorEdition: ModelEdition, action: ModelAction) {
    switch (action.kind) {
        case 'llignette.structure.create-organization':
            createOrganization(tx, priorEdition, {
                kind: action.kind,
                name: toName(action.name),
                id: toOrganizationId(action.id)
            })
            break
        case 'llignette.structure.create-project':
            createProject(tx, priorEdition, {
                kind: action.kind,
                name: toName(action.name),
                id: toProjectId(action.id),
                organizationId: toOrganizationId(action.organizationId)
            })
            break
        case 'llignette.structure.remove-organization':
            removeOrganization(tx, priorEdition, {
                kind: action.kind,
                id: toOrganizationId(action.id),
            })
            break
        case 'llignette.structure.remove-project':
            removeProject(tx, priorEdition, {
                kind: action.kind,
                id: toProjectId(action.id),
            })
            break
        default:
            fail(`Unrecognized event kind: '${action.kind}'.`)
    }
}