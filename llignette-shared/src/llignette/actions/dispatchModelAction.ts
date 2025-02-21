import {ModelEdition} from "$shared/llignette/model/ModelEdition";
import {ModelActionJson} from "$shared/llignette/model/ModelAction";
import {dispatchCoreAction} from "$shared/llignette/actions/core/CoreActions";
import {dispatchStructureAction} from "$shared/llignette/actions/structure/StructureActions";
import {fail} from "$shared/util/Assertions";
import {Tx} from "$shared/util/txcollections/Tx";

export function dispatchModelAction(tx: Tx, modelEdition: ModelEdition, actionJson: ModelActionJson) {
    if (actionJson.kind.startsWith('llignette.core')) {
        dispatchCoreAction(tx, modelEdition, actionJson);
    } else if (actionJson.kind.startsWith('llignette.structure')) {
        dispatchStructureAction(tx, modelEdition, actionJson);
    } else {
        fail(`Unrecognized event kind: '${actionJson.kind}'.`)
    }
}