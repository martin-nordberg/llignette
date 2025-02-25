import {Model} from "$shared/llignette/model/Model";
import {dispatchModelAction} from "$shared/llignette/actions/dispatchModelAction";
import {commitChanges} from "$shared/llignette/model/ModelEdition";
import {Tx} from "$shared/util/txcollections/Tx";

/** A single change within an action. */
export type ModelChangeJson = {
    readonly [key: string]: string | number | boolean
}

/** Object serializable as JSON to represent the action. */
export type ModelActionJson = {
    readonly kind: string,
    readonly changes: ModelChangeJson[]
}

/** Generic model action. */
export type ModelAction<kindStr, Change> = {
    readonly kind: kindStr,
    readonly changes: Change[],
}
