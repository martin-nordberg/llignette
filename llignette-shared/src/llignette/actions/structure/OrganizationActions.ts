import {fail} from "$shared/util/Assertions";
import {ModelAction, ModelActionJson} from "$shared/llignette/model/ModelAction";
import {Name, toName} from "$shared/llignette/nodes/core/Named";
import {OrganizationId, toOrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {ModelEdition} from "$shared/llignette/model/ModelEdition";
import {Tx} from "$shared/util/txcollections/Tx";


/** Creates one or more organizations. */
function createOrganization(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.organization.create',
        {
            name: Name,
            id: OrganizationId,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.organizationIds.add(tx, change.id)
        priorEdition.names.set(tx, change.id, change.name)
        priorEdition.allOrganizations.add(tx, priorEdition.modelId, change.id)
        console.debug(`Organization named '${change.name}' created.`)
    })
}


/** Deletes one or more organizations. */
function deleteOrganization(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.organization.delete',
        {
            id: OrganizationId,
        }
    >
) {
    action.changes.forEach(change => {
        // TODO: delete contents & links
        priorEdition.allOrganizations.delete(tx, change.id)
        priorEdition.organizationIds.delete(tx, change.id)
        console.debug(`Organization with ID='${change.id}' deleted.`)
    })
}


/** Dispatches an organization action. */
export function dispatchOrganizationAction(tx: Tx, priorEdition: ModelEdition, action: ModelActionJson) {
    switch (action.kind) {
        case 'llignette.structure.organization.create':
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
        case 'llignette.structure.organization.delete':
            deleteOrganization(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        id: toOrganizationId(c.id),
                    }
                })
            })
            break
        default:
            fail(`Unrecognized event kind: '${action.kind}'.`)
    }
}