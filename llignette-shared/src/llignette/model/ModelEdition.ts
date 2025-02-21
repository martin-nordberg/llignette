import {makeEmptyTxLinks1toN, TxLinks1toN} from "$shared/util/txcollections/TxLinks1toN";
import {makeEmptyTxSet, TxSet} from "$shared/util/txcollections/TxSet";
import {OrganizationId} from "$shared/llignette/nodes/structure/Organization";
import {ProjectId} from "$shared/llignette/nodes/structure/Project";
import {makeEmptyTxMap, TxMap} from "$shared/util/txcollections/TxMap";
import {DescribedId, Description, Summary} from "$shared/llignette/nodes/core/Described";
import {Name, NamedId} from "$shared/llignette/nodes/core/Named";
import {Tx} from "$shared/util/txcollections/Tx";
import {ModelId} from "$shared/llignette/model/ModelId";
import {PackageId} from "$shared/llignette/nodes/structure/Package";
import {ModuleId} from "$shared/llignette/nodes/structure/Module";
import {makeEmptyTxLinksNtoN, TxLinksNtoN} from "$shared/util/txcollections/TxLinksNtoN";

/** A graph of model nodes, links, and properties. One version in the history of a model.*/
export type ModelEdition = {
    readonly modelId: ModelId,

    // Node IDs
    readonly moduleIds: TxSet<ModuleId>,
    readonly organizationIds: TxSet<OrganizationId>,
    readonly packageIds: TxSet<PackageId>,
    readonly projectIds: TxSet<ProjectId>,

    // Links
    readonly allOrganizations: TxLinks1toN<ModelId, OrganizationId>
    readonly moduleDependencies: TxLinksNtoN<ModuleId, ModuleId>
    readonly moduleOwnerships: TxLinks1toN<PackageId, ModuleId>
    readonly projectDependencies: TxLinksNtoN<ProjectId, ProjectId>
    readonly projectOwnerships: TxLinks1toN<OrganizationId, ProjectId>
    readonly subPackages: TxLinks1toN<PackageId, PackageId>
    readonly topLevelPackages: TxLinks1toN<ProjectId, PackageId>

    // Properties
    readonly descriptions: TxMap<DescribedId, Description>,
    readonly names: TxMap<NamedId, Name>,
    readonly summaries: TxMap<DescribedId, Summary>
};

/** Constructs an empty model edition. */
export function makeEmptyModelEdition(tx: Tx, modelId: ModelId): ModelEdition {
    return {
        modelId: modelId,

        moduleIds: makeEmptyTxSet<ModuleId>(tx),
        organizationIds: makeEmptyTxSet<OrganizationId>(tx),
        packageIds: makeEmptyTxSet<PackageId>(tx),
        projectIds: makeEmptyTxSet<ProjectId>(tx),

        allOrganizations: makeEmptyTxLinks1toN<ModelId, OrganizationId>(tx),
        moduleDependencies: makeEmptyTxLinksNtoN<ModuleId, ModuleId>(tx),
        moduleOwnerships: makeEmptyTxLinks1toN<PackageId, ModuleId>(tx),
        projectDependencies: makeEmptyTxLinksNtoN<ProjectId, ProjectId>(tx),
        projectOwnerships: makeEmptyTxLinks1toN<OrganizationId, ProjectId>(tx),
        subPackages: makeEmptyTxLinks1toN<PackageId, PackageId>(tx),
        topLevelPackages: makeEmptyTxLinks1toN<ProjectId, PackageId>(tx),

        descriptions: makeEmptyTxMap<DescribedId, Description>(tx),
        names: makeEmptyTxMap<NamedId, Name>(tx),
        summaries: makeEmptyTxMap<DescribedId, Summary>(tx),
    }
}

/**
 * Commits model changes in progress and returns the new edition.
 * @param tx the active transaction
 * @param modelEdition the model edition with changes in progress
 */
export function commitChanges(tx: Tx, modelEdition: ModelEdition): ModelEdition {
    return {
        modelId: modelEdition.modelId,

        moduleIds: modelEdition.moduleIds.withChangesCommitted(tx),
        organizationIds: modelEdition.organizationIds.withChangesCommitted(tx),
        packageIds: modelEdition.packageIds.withChangesCommitted(tx),
        projectIds: modelEdition.projectIds.withChangesCommitted(tx),

        allOrganizations: modelEdition.allOrganizations.withChangesCommitted(tx),
        moduleDependencies: modelEdition.moduleDependencies.withChangesCommitted(tx),
        moduleOwnerships: modelEdition.moduleOwnerships.withChangesCommitted(tx),
        projectDependencies: modelEdition.projectDependencies.withChangesCommitted(tx),
        projectOwnerships: modelEdition.projectOwnerships.withChangesCommitted(tx),
        subPackages: modelEdition.subPackages.withChangesCommitted(tx),
        topLevelPackages: modelEdition.topLevelPackages.withChangesCommitted(tx),

        descriptions: modelEdition.descriptions.withChangesCommitted(tx),
        names: modelEdition.names.withChangesCommitted(tx),
        summaries: modelEdition.summaries.withChangesCommitted(tx),
    }
}