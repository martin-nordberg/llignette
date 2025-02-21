import {fail} from "$shared/util/Assertions";
import {PackageId, toPackageId} from "$shared/llignette/nodes/structure/Package";
import {ModelAction, ModelActionJson} from "$shared/llignette/model/ModelAction";
import {Name, toName} from "$shared/llignette/nodes/core/Named";
import {ProjectId, toProjectId} from "$shared/llignette/nodes/structure/Project";
import {ModelEdition} from "$shared/llignette/model/ModelEdition";
import {Tx} from "$shared/util/txcollections/Tx";


/** Creates one or more subpackages. */
function createSubPackage(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.package.create',
        {
            name: Name,
            id: PackageId,
            parentPackageId: PackageId,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.packageIds.add(tx, change.id)
        priorEdition.names.set(tx, change.id, change.name)
        priorEdition.subPackages.add(tx, change.parentPackageId, change.id)
    })
}


/** Creates one or more top level packages. */
function createTopLevelPackage(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.package.create-top-level',
        {
            name: Name,
            id: PackageId,
            projectId: ProjectId,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.packageIds.add(tx, change.id)
        priorEdition.names.set(tx, change.id, change.name)
        priorEdition.topLevelPackages.add(tx, change.projectId, change.id)
    })
}


/** Removes one or more subpackages. */
function removeSubPackage(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.package.remove',
        {
            id: PackageId,
        }
    >
) {
    action.changes.forEach(change => {
        // TODO: delete contents & links
        priorEdition.packageIds.delete(tx, change.id)
        priorEdition.subPackages.delete(tx, change.id)
    })
}


/** Removes one or more top level packages. */
function removeTopLevelPackage(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.package.remove-top-level',
        {
            id: PackageId,
        }
    >
) {
    action.changes.forEach(change => {
        // TODO: delete contents & links
        priorEdition.packageIds.delete(tx, change.id)
        priorEdition.topLevelPackages.delete(tx, change.id)
    })
}


/** Dispatches a package action. */
export function dispatchPackageAction(tx: Tx, priorEdition: ModelEdition, action: ModelActionJson) {
    switch (action.kind) {
        case 'llignette.structure.package.create':
            createSubPackage(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        name: toName(c.name),
                        id: toPackageId(c.id),
                        parentPackageId: toPackageId(c.parentPackageId),
                    }
                })
            })
            break
        case 'llignette.structure.package.create-top-level':
            createTopLevelPackage(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        name: toName(c.name),
                        id: toPackageId(c.id),
                        projectId: toProjectId(c.projectId)
                    }
                })
            })
            break
        case 'llignette.structure.package.remove':
            removeSubPackage(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        id: toPackageId(c.id),
                    }
                })

            })
            break
        case 'llignette.structure.package.remove-top-level':
            removeTopLevelPackage(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        id: toPackageId(c.id),
                    }
                })

            })
            break
        default:
            fail(`Unrecognized event kind: '${action.kind}'.`)
    }
}