import {makeEmptyModelEdition, ModelEdition} from "$shared/llignette/model/ModelEdition";
import {Tx} from "$shared/util/txcollections/Tx";
import {ModelId} from "$shared/llignette/model/ModelId";

/** The current edition of a model with a link to the prior edition. */
export type Model = {
    readonly currentEdition: ModelEdition
    readonly priorEdition: ModelEdition
}

/** Constructs an empty model. */
export function makeEmptyModel(tx: Tx, modelId: ModelId): Model {
    const edition0 = makeEmptyModelEdition(tx, modelId)

    return {
        currentEdition: edition0,
        priorEdition: edition0,
    }
}


