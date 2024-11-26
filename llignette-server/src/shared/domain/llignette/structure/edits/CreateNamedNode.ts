import {Model} from "../../model/Model";
import {checkNonNull} from "../../../../common/util/Assertions";
import {ModelEdit} from "../../model/ModelEdit";
import {Name, Named} from "../../core/nodes/Named";
import {createId} from '@paralleldrive/cuid2';
import {Id} from "../../core/nodes/Node";
import {DeleteNode} from "./DeleteNode";
import {NodeLens} from "../../model/NodeLens";

/** A model edit to create a brand-new node with its name set. */
export class CreateNamedNode<IdBrand, T extends Named<IdBrand>> implements ModelEdit {

    #newNodeId?: Id<IdBrand>

    constructor(
        private lens: NodeLens<IdBrand, T>,
        private name: Name
    ) {
    }

    apply(model: Model) {
        this.#newNodeId = this.lens.toId(`${this.lens.idPrefix()}${createId()}`)

        const node = {
            id: this.#newNodeId,
            isDeleted: false,
            name: this.name,
        } as T

        // Add the organization.
        this.lens.put(model, node)

        // Ensure it has a set of project ownerships.
        this.lens.initializeLinkSets(model, node)
    }

    reversingEdit(): ModelEdit {
        checkNonNull(this.#newNodeId, "Cannot reverse this edit until it has been applied.")

        return new DeleteNode(this.lens, this.#newNodeId)
    }

}



