import {Model} from "../../model/Model";
import {ModelEdit} from "../../model/ModelEdit";
import {Id, Node} from "../../core/nodes/Node";
import {DeleteNode} from "./DeleteNode";
import {NodeLens} from "../../model/NodeLens";

/** A model edit to reverse deletion of a node. */
export class UndeleteNode<IdBrand, T extends Node<IdBrand>> implements ModelEdit {

    constructor(
        private lens: NodeLens<IdBrand, T>,
        private nodeId: Id<IdBrand>
    ) {
    }


    apply(model: Model) {
        const node = this.lens.getDeleted(model, this.nodeId)

        this.lens.put(model,{
            ...node,
            isDeleted: false
        });
    }

    reversingEdit(): ModelEdit {
        return new DeleteNode(this.lens, this.nodeId)
    }

}



