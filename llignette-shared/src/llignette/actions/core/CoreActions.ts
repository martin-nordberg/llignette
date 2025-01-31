import {fail} from "$shared/util/Assertions";
import {ModelAction, ModelActionJson} from "$shared/llignette/model/ModelAction";
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


/** One change to a description. */
export type DescriptionChange = {
    id: DescribedId,
    description: Description,
}

/** A model action to change one or more model elements' descriptions. */
export type DescribeAction = ModelAction<'llignette.core.describe', DescriptionChange>

function describe(tx: Tx, priorEdition: ModelEdition, action: DescribeAction) {
    action.changes.forEach(change => {
        priorEdition.descriptions.set(tx, change.id, change.description)
    })
}


/** One description removal change. */
export type RemoveDescriptionChange = {
    id: DescribedId,
}

/** A model action to remove a model element's description. */
export type RemoveDescriptionAction = ModelAction<'llignette.core.remove-description', RemoveDescriptionChange>

function removeDescription(tx: Tx, priorEdition: ModelEdition, action: RemoveDescriptionAction) {
    action.changes.forEach(change => {
        priorEdition.descriptions.delete(tx, change.id)
    })
}


/* One summary removal change. */
export type RemoveSummaryChange = {
    id: DescribedId,
}

/** A model action to remove a model element's summary. */
export type RemoveSummaryAction = ModelAction<'llignette.core.remove-summary', RemoveSummaryChange>

function removeSummary(tx: Tx, priorEdition: ModelEdition, action: RemoveSummaryAction) {
    action.changes.forEach(change => {
        priorEdition.summaries.delete(tx, change.id)
    })
}


/** One renaming change. */
export type RenameChange = {
    id: NamedId,
    name: Name,
}

/** A model action to rename a model element. */
export type RenameAction = ModelAction<'llignette.core.rename', RenameChange>

function rename(tx: Tx, priorEdition: ModelEdition, action: RenameAction) {
    action.changes.forEach(change => {
        priorEdition.names.set(tx, change.id, change.name)
    })
}


export type SummarizeChange = {
    id: DescribedId,
    summary: Summary,
}

/** A model action to change a model element's summary. */
export type SummarizeAction = ModelAction<'llignette.core.summarize', SummarizeChange>

function summarize(tx: Tx, priorEdition: ModelEdition, action: SummarizeAction) {
    action.changes.forEach(change => {
        priorEdition.summaries.set(tx, change.id, change.summary)
    })
}


export function dispatchCoreAction(tx: Tx, priorEdition: ModelEdition, action: ModelActionJson) {
    switch (action.kind) {
        case 'llignette.core.describe':
            describe(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        id: toDescribedId(c.id),
                        description: toDescription(c.description)
                    }
                }),
            })
            break
        case 'llignette.core.remove-description':
            removeDescription(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        id: toDescribedId(c.id)
                    }
                }),
            })
            break
        case 'llignette.core.remove-summary':
            removeSummary(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        id: toDescribedId(c.id)
                    }
                }),
            })
            break
        case 'llignette.core.rename':
            rename(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        name: toName(c.name),
                        id: toNamedId(c.id),
                    }
                }),
            })
            break
        case 'llignette.core.summarize':
            summarize(tx, priorEdition, {
                kind: action.kind,
                changes: action.changes.map(c => {
                    return {
                        summary: toSummary(c.summary),
                        id: toDescribedId(c.id),
                    }
                })
            })
            break
        default:
            fail(`Unrecognized event kind: '${action.kind}'.`)
    }
}


