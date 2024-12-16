import {Model} from "./Model";

export type ModelEventKind = {
    kind: string[3]
}

/** Object serializable as JSON to represent the event. */
export type ModelEventJson = ModelEventKind & { [key: string]: string | number | boolean }

/** Interface to an event that edits a Llignette model. */
export interface ModelEvent {

    /** Executes the event. */
    apply(model: Model): void

    /** Returns a compensating edit that will reverse this edit. */
    reversingEdit(): ModelEvent

    /** Returns this edit as a JSON-serializable object. */
    toJson(): ModelEventJson

}
