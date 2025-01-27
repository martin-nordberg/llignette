import {makeEmptyTxLinks1toN, TxLinks1toN} from "$shared/util/txcollections/TxLinks1toN";
import {makeEmptyTxSet, TxSet} from "$shared/util/txcollections/TxSet";
import {OrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {ProjectId} from "$shared/llignette/nodes/structure/Project";
import {makeEmptyTxMap, TxMap} from "$shared/util/txcollections/TxMap";
import {DescribedId, Description, Summary} from "$shared/llignette/nodes/core/Described";
import {Name, NamedId} from "$shared/llignette/nodes/core/Named";
import {Tx} from "$shared/util/txcollections/Tx";
import {ModelId} from "$shared/llignette/model/ModelId";

/** A graph of model nodes, links, and properties. One version in the history of a model.*/
export type ModelEdition = {
    readonly modelId: ModelId,
    readonly organizationIds: TxSet<OrganizationId>,
    readonly projectIds: TxSet<ProjectId>,

    readonly allOrganizations: TxLinks1toN<ModelId, OrganizationId>
    readonly projectOwnerships: TxLinks1toN<OrganizationId, ProjectId>

    readonly descriptions: TxMap<DescribedId, Description>,
    readonly names: TxMap<NamedId, Name>,
    readonly summaries: TxMap<DescribedId, Summary>
};

/** Constructs an empty model. */
export function makeEmptyModelEdition(tx: Tx, modelId: ModelId): ModelEdition {
    return {
        modelId: modelId,
        organizationIds: makeEmptyTxSet<OrganizationId>(tx),
        projectIds: makeEmptyTxSet<ProjectId>(tx),

        allOrganizations: makeEmptyTxLinks1toN<ModelId, OrganizationId>(tx),
        projectOwnerships: makeEmptyTxLinks1toN<OrganizationId, ProjectId>(tx),

        descriptions: makeEmptyTxMap<DescribedId, Description>(tx),
        names: makeEmptyTxMap<NamedId, Name>(tx),
        summaries: makeEmptyTxMap<DescribedId, Summary>(tx),
    }
}

/** Commits model changes in progress and returns the new edition. */
export function commitChanges(tx: Tx, modelEdition: ModelEdition): ModelEdition {
    return {
        modelId: modelEdition.modelId,
        organizationIds: modelEdition.organizationIds.withChangesCommitted(tx),
        projectIds: modelEdition.projectIds.withChangesCommitted(tx),

        allOrganizations: modelEdition.allOrganizations.withChangesCommitted(tx),
        projectOwnerships: modelEdition.projectOwnerships.withChangesCommitted(tx),

        descriptions: modelEdition.descriptions.withChangesCommitted(tx),
        names: modelEdition.names.withChangesCommitted(tx),
        summaries: modelEdition.summaries.withChangesCommitted(tx),
    }
}