import {ModelEdition} from "$shared/llignette/model/ModelEdition";
import {Instant} from "@js-joda/core";

/** Represents a milestone edition in the history of a model. */
export type ModelCommit = {
    commitTime: Instant,
    details: string,
    modelEdition: ModelEdition,
    priorCommits: ModelCommit[]
    summary: string,
}