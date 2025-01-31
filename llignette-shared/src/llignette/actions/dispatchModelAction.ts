import {ModelEdition} from "$shared/llignette/model/ModelEdition";
import {ModelActionJson} from "$shared/llignette/model/ModelAction";
import {dispatchCoreAction} from "$shared/llignette/actions/core/CoreActions";
import {dispatchStructureAction} from "$shared/llignette/actions/structure/StructureActions";
import {fail} from "$shared/util/Assertions";
import {Tx} from "$shared/util/txcollections/Tx";

export function dispatchModelAction(tx: Tx, modelEdition: ModelEdition, actionJson: ModelActionJson) {
    const kind = actionJson.kind.substring(0, actionJson.kind.indexOf(".", 10));
    switch (kind) {
        case 'llignette.core':
            dispatchCoreAction(tx, modelEdition, actionJson);
            break;
        case 'llignette.structure':
            dispatchStructureAction(tx, modelEdition, actionJson);
            break;
        default:
            fail(`Unrecognized event kind: '${actionJson.kind}'.`)
    }
}