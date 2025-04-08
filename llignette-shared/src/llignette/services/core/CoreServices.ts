import {Model} from "$shared/llignette/model/Model";
import {NamedId} from "$shared/llignette/nodes/core/Named";
import {DescribedId} from "$shared/llignette/nodes/core/Described";
import {extendModelOnBranch} from "$shared/llignette/model/dispatchAction";
import {makeTx} from "$shared/util/txcollections/Tx";
import {fail} from "$shared/util/Assertions";


export interface ICoreServices<This extends ICoreServices<This>> {
    /** Finds the description of an element. */
    findDescription(id: DescribedId): string | null

    /** Finds the name of an element. */
    findName(id: NamedId): string | null

    /** Finds the summary of an element. */
    findSummary(id: DescribedId): string | null

    /** Changes the description of an element. */
    updateDescription(id: DescribedId, name: string): This

    /** Changes the name of an element. */
    updateName(id: NamedId, name: string): This

    /** Changes the summary of an element. */
    updateSummary(id: DescribedId, name: string): This
}

/** Finds the description of an element. */
export function findDescription(model: Model, branchName: string, id: DescribedId): string | null {
    const branch = model.branches[branchName] ?? fail(`Branch "${branchName}" does not exist`)
    const modelEdition = branch.editions.item
    return modelEdition.descriptions.get(id)
}

/** Finds the name of an element. */
export function findName(model: Model, branchName: string, id: NamedId): string | null {
    const branch = model.branches[branchName] ?? fail(`Branch "${branchName}" does not exist`)
    const modelEdition = branch.editions.item
    return modelEdition.names.get(id)
}

/** Finds the summary of an element. */
export function findSummary(model: Model, branchName: string, id: DescribedId): string | null {
    const branch = model.branches[branchName] ?? fail(`Branch "${branchName}" does not exist`)
    const modelEdition = branch.editions.item
    return modelEdition.summaries.get(id)
}

/** Changes the description of an element. */
export function updateDescription(model: Model, branchName: string, id: DescribedId, description: string): Model {
    return extendModelOnBranch(
        makeTx(),
        model,
        branchName,
        {
            kind: 'llignette.core.describe',
            changes: [
                {id, description}
            ]
        }
    )
}

/** Changes the name of an element. */
export function updateName(model: Model, branchName: string, id: NamedId, name: string): Model {
    return extendModelOnBranch(
        makeTx(),
        model,
        branchName,
        {
            kind: 'llignette.core.rename',
            changes: [
                {id, name}
            ]
        }
    )
}

/** Changes the summary of an element. */
export function updateSummary(model: Model, branchName: string, id: DescribedId, summary: string): Model {
    return extendModelOnBranch(
        makeTx(),
        model,
        branchName,
        {
            kind: 'llignette.core.summarize',
            changes: [
                {id, summary}
            ]
        }
    )
}
