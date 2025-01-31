import {fail} from "$shared/util/Assertions";
import {ProjectId, toProjectId} from "$shared/llignette/nodes/structure/Project";
import {ModelAction, ModelActionJson} from "$shared/llignette/model/ModelAction";
import {Name, toName} from "$shared/llignette/nodes/core/Named";
import {OrganizationId, toOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {ModelEdition} from "$shared/llignette/model/ModelEdition";
import {Tx} from "$shared/util/txcollections/Tx";


/** One organization creation change. */
export type CreateOrganizationChange = {
    name: Name,
    id: OrganizationId,
}

/** A model action to create an organization. */
export type CreateOrganizationAction = ModelAction<'llignette.structure.create-organization', CreateOrganizationChange>

function createOrganization(tx: Tx, priorEdition: ModelEdition, action: CreateOrganizationAction) {
    action.changes.forEach(change => {
        priorEdition.organizationIds.add(tx, change.id)
        priorEdition.names.set(tx, change.id, change.name)
        priorEdition.allOrganizations.add(tx, priorEdition.modelId, change.id)
    })
}


/** One organization deletion change. */
export type RemoveOrganizationChange = {
    id: OrganizationId,
}

/** A model action to delete an organization. */
export type RemoveOrganizationAction = ModelAction<'llignette.structure.remove-organization', RemoveOrganizationChange>

function removeOrganization(tx: Tx, priorEdition: ModelEdition, action: RemoveOrganizationAction) {
    action.changes.forEach(change => {
        // TODO: delete contents & links
        priorEdition.allOrganizations.delete(tx, change.id)
        priorEdition.organizationIds.delete(tx, change.id)
    })
}


/** One project creation change. */
export type CreateProjectChange = {
    name: Name,
    id: ProjectId,
    organizationId: OrganizationId,
}

/** A model action to create a project. */
export type CreateProjectAction = ModelAction<'llignette.structure.create-project', CreateProjectChange>

function createProject(tx: Tx, priorEdition: ModelEdition, action: CreateProjectAction) {
    action.changes.forEach(change => {
        priorEdition.projectIds.add(tx, change.id)
        priorEdition.names.set(tx, change.id, change.name)
        priorEdition.projectOwnerships.add(tx, change.organizationId, change.id)
    })
}


/** One project deletion change. */
export type RemoveProjectChange = {
    id: ProjectId,
}

/** A model action to delete a project. */
export type RemoveProjectAction = ModelAction<'llignette.structure.remove-project', RemoveProjectChange>

function removeProject(tx: Tx, priorEdition: ModelEdition, action: RemoveProjectAction) {
    action.changes.forEach(change => {
        // TODO: delete contents & links
        priorEdition.projectIds.delete(tx, change.id)
        priorEdition.projectOwnerships.delete(tx, change.id)
    })
}


export function dispatchStructureAction(tx: Tx, priorEdition: ModelEdition, action: ModelActionJson) {
    switch (action.kind) {
        case 'llignette.structure.create-organization':
            createOrganization(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        name: toName(c.name),
                        id: toOrganizationId(c.id)
                    }
                }),
            })
            break
        case 'llignette.structure.create-project':
            createProject(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        name: toName(c.name),
                        id: toProjectId(c.id),
                        organizationId: toOrganizationId(c.organizationId)
                    }
                })
            })
            break
        case 'llignette.structure.remove-organization':
            removeOrganization(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        id: toOrganizationId(c.id),
                    }
                })
            })
            break
        case 'llignette.structure.remove-project':
            removeProject(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        id: toProjectId(c.id),
                    }
                })

            })
            break
        default:
            fail(`Unrecognized event kind: '${action.kind}'.`)
    }
}