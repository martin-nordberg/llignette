import {Model} from "../../model/Model";
import {ModelEdit} from "../../model/ModelEdit";
import {UndeleteNode} from "./UndeleteNode";
import {Id, Node} from "../../core/nodes/Node";
import {NodeLens} from "../../model/NodeLens";

/** A model edit to delete a node. */
export class DeleteNode<IdBrand, T extends Node<IdBrand>> implements ModelEdit {

    constructor(
        private lens: NodeLens<IdBrand, T>,
        private nodeId: Id<IdBrand>
    ) {
    }

    apply(model: Model) {
        const node = this.lens.get(model, this.nodeId)

        this.lens.put(model, {
            ...node,
            isDeleted: true
        });
    }

    reversingEdit(): ModelEdit {
        return new UndeleteNode(this.lens, this.nodeId)
    }

}



