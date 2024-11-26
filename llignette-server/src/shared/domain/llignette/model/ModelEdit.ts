import {Model} from "./Model";

export interface ModelEdit {
    apply(model: Model): void

    reversingEdit(): ModelEdit
}
