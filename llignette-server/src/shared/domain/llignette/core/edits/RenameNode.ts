import {Model} from "../../model/Model";
import {checkNonNull} from "../../../../common/util/Assertions";
import {ModelEdit} from "../../model/ModelEdit";
import {Name, Named} from "../nodes/Named";
import {Id} from "../nodes/Node";
import {NodeLens} from "../../model/NodeLens";

/** A generic model edit to rename a named node. */
export class RenameNode<IdBrand, T extends Named<IdBrand>> implements ModelEdit {

    #priorName?: Name

    constructor(
        private lens: NodeLens<IdBrand, T>,
        private nodeId: Id<IdBrand>,
        private name: Name
    ) {
    }

    apply(model: Model) {
        const node = this.lens.get(model, this.nodeId)

        this.lens.put(model, {
            ...node,
            name: this.name
        })
    }

    reversingEdit(): ModelEdit {
        checkNonNull(this.#priorName, "Cannot reverse this edit until it has been applied.")

        return new RenameNode(this.lens, this.nodeId, this.#priorName)
    }

}
