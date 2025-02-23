import {Tx} from "$shared/util/txcollections/Tx";
import {ModelBranch} from "$shared/llignette/model/ModelBranch";
import {ModelActionJson} from "$shared/llignette/model/ModelAction";
import {dispatchModelAction} from "$shared/llignette/actions/dispatchModelAction";
import {commitChanges} from "$shared/llignette/model/ModelEdition";
import {addLink} from "$shared/util/HistoryList";
import {Model} from "$shared/llignette/model/Model";
import {fail} from "$shared/util/Assertions";


/** Top level dispatch function for model actions. */
function extendBranch(tx: Tx, branch: ModelBranch, action: ModelActionJson): ModelBranch {
    const latestEdition = branch.editions.item
    dispatchModelAction(tx, latestEdition, action)
    return {
        ...branch,
        editions: addLink(branch.editions, commitChanges(tx, latestEdition)),
    }
}

/** Creates a new version of a given model by performing an action on one of the model's branches. */
export function extendModelOnBranch(
    tx: Tx,
    model: Model,
    branchName: string,
    action: ModelActionJson
): Model {
    const branch = model.branches[branchName] ?? fail(`Branch "${branchName}" does not exist`)

    const branches = {
        ...model.branches,
        [branchName]: extendBranch(tx, branch, action)
    }

    return {
        ...model,
        branches
    }
}

