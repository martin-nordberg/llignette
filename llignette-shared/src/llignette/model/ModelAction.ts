import {Model} from "$shared/llignette/model/Model";
import {dispatchModelAction} from "$shared/llignette/actions/dispatchModelAction";
import {commitChanges} from "$shared/llignette/model/ModelEdition";
import {Tx} from "$shared/util/txcollections/Tx";

/** Object serializable as JSON to represent the action. */
export type ModelAction = {
    readonly kind: string,
    readonly [key: string]: string | number | boolean
}

/** Top level dispatch function for model actions. */
export function dispatch(tx: Tx, model: Model, action: ModelAction): Model {
    dispatchModelAction(tx, model.currentEdition, action)
    return {
        priorEdition: model.currentEdition,
        currentEdition: commitChanges(tx, model.currentEdition)
    }
}

