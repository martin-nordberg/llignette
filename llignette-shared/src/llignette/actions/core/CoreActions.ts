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


/** Change one or more model element descriptions. */
function describe(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.core.describe',
        {
            id: DescribedId,
            description: Description,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.descriptions.set(tx, change.id, change.description)
    })
}


/** Remove one or more model elements' description. */
function removeDescription(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.core.remove-description',
        {
            id: DescribedId,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.descriptions.delete(tx, change.id)
    })
}


/** Remove one or more model elements' summaries. */
function removeSummary(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.core.remove-summary',
        {
            id: DescribedId,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.summaries.delete(tx, change.id)
    })
}


/** Renames one or more model elements. */
function rename(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.core.rename',
        {
            id: NamedId,
            name: Name,
        }
    >
) {
    action.changes.forEach(change => {
        priorEdition.names.set(tx, change.id, change.name)
    })
}


/** Changes the summary for one or more model elements. */
function summarize(
    tx: Tx,
    priorEdition: ModelEdition,
    action: ModelAction<
        'llignette.core.summarize',
        {
            id: DescribedId,
            summary: Summary,
        }
    >
) {
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


