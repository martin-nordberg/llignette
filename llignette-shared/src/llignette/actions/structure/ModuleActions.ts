import {fail} from "$shared/util/Assertions";
import {ModuleId, toModuleId} from "$shared/llignette/nodes/structure/Module";
import {ModelAction, ModelActionJson} from "$shared/llignette/model/ModelAction";
import {Name, toName} from "$shared/llignette/nodes/core/Named";
import {PackageId, toPackageId} from "$shared/llignette/nodes/structure/Package";
import {ModelEdition} from "$shared/llignette/model/ModelEdition";
import {Tx} from "$shared/util/txcollections/Tx";


/** Creates one or more modules. */
function createModule(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.module.create',
        {
            name: Name,
            id: ModuleId,
            packageId: PackageId,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.moduleIds.add(tx, change.id)
        priorEdition.names.set(tx, change.id, change.name)
        priorEdition.moduleOwnerships.add(tx, change.packageId, change.id)
    })
}


/** Removes one or more modules. */
function removeModule(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.module.remove',
        {
            id: ModuleId,
        }
    >
) {
    action.changes.forEach(change => {
        // TODO: delete contents & links
        priorEdition.moduleIds.delete(tx, change.id)
        priorEdition.moduleOwnerships.delete(tx, change.id)
    })
}


/** Creates one or more module dependencies. */
function addModuleDependency(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.module.add-dependency',
        {
            consumerId: ModuleId,
            supplierId: ModuleId,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.moduleDependencies.add(tx, change.consumerId, change.supplierId)
    })
}

/** Removes one or more module dependencies. */
function removeModuleDependency(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.structure.module.remove-dependency',
        {
            consumerId: ModuleId,
            supplierId: ModuleId,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.moduleDependencies.delete(tx, change.consumerId, change.supplierId)
    })
}


/** Dispatches a module action. */
export function dispatchModuleAction(tx: Tx, priorEdition: ModelEdition, action: ModelActionJson) {
    switch (action.kind) {
        case 'llignette.structure.module.create':
            createModule(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        name: toName(c.name),
                        id: toModuleId(c.id),
                        packageId: toPackageId(c.packageId)
                    }
                })
            })
            break
        case 'llignette.structure.module.add-dependency':
            addModuleDependency(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        consumerId: toModuleId(c.consumerId),
                        supplierId: toModuleId(c.supplierId),
                    }
                })
            })
            break
        case 'llignette.structure.module.remove':
            removeModule(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        id: toModuleId(c.id),
                    }
                })

            })
            break
        case 'llignette.structure.module.remove-dependency':
            removeModuleDependency(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        consumerId: toModuleId(c.consumerId),
                        supplierId: toModuleId(c.supplierId),
                    }
                })
            })
            break
        default:
            fail(`Unrecognized event kind: '${action.kind}'.`)
    }
}