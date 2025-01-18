import {fail} from "$shared/util/Assertions";
import {ModelAction} from "$shared/llignette/model/ModelAction";
import {
    DescribedId,
    Description,
    Summary,
    toDescribedId,
    toDescription,
    toSummary
} from "$shared/llignette/nodes/core/Described";
import {ModelEdition} from "$shared/llignette/model/ModelEdition";
import {Name, NamedId, toName, toNamedId} from "$shared/llignette/nodes/core/Named";
import {Tx} from "$shared/util/txcollections/Tx";

/** A model action to change a model element's description. */
export type DescribeAction = ModelAction & {
    kind: 'llignette.core.describe',
    description: Description,
    id: DescribedId,
}

function describe(tx: Tx, priorEdition: ModelEdition, action: DescribeAction) {
    priorEdition.descriptions.set(tx, action.id, action.description)
}


/** A model action to remove a model element's description. */
export type RemoveDescriptionAction = ModelAction & {
    kind: 'llignette.core.remove-description',
    id: DescribedId,
}

function removeDescription(tx: Tx, priorEdition: ModelEdition, action: RemoveDescriptionAction) {
    priorEdition.descriptions.delete(tx, action.id)
}


/** A model action to remove a model element's summary. */
export type RemoveSummaryAction = ModelAction & {
    kind: 'llignette.core.remove-summary',
    id: DescribedId,
}

function removeSummary(tx: Tx, priorEdition: ModelEdition, action: RemoveSummaryAction) {
    priorEdition.summaries.delete(tx, action.id)
}


/** A model action to rename a model element. */
export type RenameAction = ModelAction & {
    kind: 'llignette.core.rename',
    name: Name,
    id: NamedId,
}

function rename(tx: Tx, priorEdition: ModelEdition, action: RenameAction) {
    priorEdition.names.set(tx, action.id, action.name)
}


/** A model action to change a model element's summary. */
export type SummarizeAction = ModelAction & {
    kind: 'llignette.core.summarize',
    summary: Summary,
    id: DescribedId,
}

function summarize(tx: Tx, priorEdition: ModelEdition, action: SummarizeAction) {
    priorEdition.summaries.set(tx, action.id, action.summary)
}


export function dispatchCoreAction(tx: Tx, priorEdition: ModelEdition, action: ModelAction) {
    switch (action.kind) {
        case 'llignette.core.describe':
            describe(tx, priorEdition, {
                kind: action.kind,
                description: toDescription(action.description),
                id: toDescribedId(action.id),
            })
            break
        case 'llignette.core.remove-description':
            removeDescription(tx, priorEdition, {
                kind: action.kind,
                id: toDescribedId(action.id),
            })
            break
        case 'llignette.core.remove-summary':
            removeSummary(tx, priorEdition, {
                kind: action.kind,
                id: toDescribedId(action.id),
            })
            break
        case 'llignette.core.rename':
            rename(tx, priorEdition, {
                kind: action.kind,
                name: toName(action.name),
                id: toNamedId(action.id)
            })
            break
        case 'llignette.core.summarize':
            summarize(tx, priorEdition, {
                kind: action.kind,
                summary: toSummary(action.summary),
                id: toDescribedId(action.id),
            })
            break
        default:
            fail(`Unrecognized event kind: '${action.kind}'.`)
    }
}


