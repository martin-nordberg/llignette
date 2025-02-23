import {ModelCommit} from "$shared/llignette/model/ModelCommit";
import {ModelEdition} from "$shared/llignette/model/ModelEdition";
import {HistoryList} from "$shared/util/HistoryList";


/** Represents an active branch of model editing starting from a given commit. */
export type ModelBranch = {
    baseCommit: ModelCommit,
    editions: HistoryList<ModelEdition>,
    name: string,
}