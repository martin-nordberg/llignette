import {ModelActionJson} from "$shared/llignette/model/ModelAction";
import {ModelEdition} from "$shared/llignette/model/ModelEdition";
import {Tx} from "$shared/util/txcollections/Tx";
import {dispatchOrganizationAction} from "$shared/llignette/actions/structure/OrganizationActions";
import {dispatchProjectAction} from "$shared/llignette/actions/structure/ProjectActions";
import {fail} from "$shared/util/Assertions";
import {dispatchPackageAction} from "$shared/llignette/actions/structure/PackageActions";
import {dispatchModuleAction} from "$shared/llignette/actions/structure/ModuleActions";


/** Dispatches a structure action. */
export function dispatchStructureAction(tx: Tx, priorEdition: ModelEdition, action: ModelActionJson) {
    if (action.kind.startsWith('llignette.structure.module')) {
        dispatchModuleAction(tx, priorEdition, action)
    } else if (action.kind.startsWith('llignette.structure.organization')) {
        dispatchOrganizationAction(tx, priorEdition, action)
    } else if (action.kind.startsWith('llignette.structure.package')) {
        dispatchPackageAction(tx, priorEdition, action)
    } else if (action.kind.startsWith('llignette.structure.project')) {
        dispatchProjectAction(tx, priorEdition, action)
    } else {
        fail(`Unrecognized event kind: '${action.kind}'.`)
    }
}