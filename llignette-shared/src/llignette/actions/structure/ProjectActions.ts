import {fail} from "$shared/util/Assertions";
import {ProjectId, toProjectId} from "$shared/llignette/nodes/structure/Project";
import {ModelAction, ModelActionJson} from "$shared/llignette/model/ModelAction";
import {Name, toName} from "$shared/llignette/nodes/core/Named";
import {OrganizationId, toOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {ModelEdition} from "$shared/llignette/model/ModelEdition";
import {Tx} from "$shared/util/txcollections/Tx";


/** Creates one or more projects. */
function createProject(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.project.create',
        {
            name: Name,
            id: ProjectId,
            organizationId: OrganizationId,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.projectIds.add(tx, change.id)
        priorEdition.names.set(tx, change.id, change.name)
        priorEdition.projectOwnerships.add(tx, change.organizationId, change.id)
    })
}


/** Removes one or more projects. */
function removeProject(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.project.remove',
        {
            id: ProjectId,
        }
    >
) {
    action.changes.forEach(change => {
        // TODO: delete contents & links
        priorEdition.projectIds.delete(tx, change.id)
        priorEdition.projectOwnerships.delete(tx, change.id)
    })
}


/** Creates one or more project dependencies. */
function addProjectDependency(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.project.add-dependency',
        {
            consumerId: ProjectId,
            supplierId: ProjectId,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.projectDependencies.add(tx, change.consumerId, change.supplierId)
    })
}

/** Removes one or more project dependencies. */
function removeProjectDependency(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.project.remove-dependency',
        {
            consumerId: ProjectId,
            supplierId: ProjectId,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.projectDependencies.delete(tx, change.consumerId, change.supplierId)
    })
}


/** Dispatches a project action. */
export function dispatchProjectAction(tx: Tx, priorEdition: ModelEdition, action: ModelActionJson) {
    switch (action.kind) {
        case 'llignette.structure.project.create':
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
        case 'llignette.structure.project.add-dependency':
            addProjectDependency(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        consumerId: toProjectId(c.consumerId),
                        supplierId: toProjectId(c.supplierId),
                    }
                })
            })
            break
        case 'llignette.structure.project.remove':
            removeProject(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        id: toProjectId(c.id),
                    }
                })

            })
            break
        case 'llignette.structure.project.remove-dependency':
            removeProjectDependency(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        consumerId: toProjectId(c.consumerId),
                        supplierId: toProjectId(c.supplierId),
                    }
                })
            })
            break
        default:
            fail(`Unrecognized event kind: '${action.kind}'.`)
    }
}