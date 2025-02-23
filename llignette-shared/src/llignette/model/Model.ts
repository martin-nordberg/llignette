import {makeEmptyModelEdition} from "$shared/llignette/model/ModelEdition";
import {Tx} from "$shared/util/txcollections/Tx";
import {ModelId} from "$shared/llignette/model/ModelId";
import {ModelCommit} from "$shared/llignette/model/ModelCommit";
import {ModelBranch} from "$shared/llignette/model/ModelBranch";
import {Instant} from "@js-joda/core";

/**
 * One edition in the evolution of a versioned map.
 */
export type BranchMap = {
    [key: string]: ModelBranch
}

/** A model of llignette code. */
export type Model = {
    readonly branches: BranchMap
    readonly commits: ModelCommit[]
}

/** Constructs an empty model. */
export function makeEmptyModel(tx: Tx, modelId: ModelId): Model {
    const edition0 = makeEmptyModelEdition(tx, modelId)

    const commit0: ModelCommit = {
        commitTime: Instant.now(),
        details: "",
        modelEdition: edition0,
        priorCommits: [],
        summary: "Initial empty commit",
    }

    const branch0: ModelBranch = {
        baseCommit: commit0,
        name: "main",
        editions: {
            item: edition0,
            priorLink: null
        },
    }

    return {
        branches: {
            main: branch0,
        },
        commits: [commit0]
    }
}


