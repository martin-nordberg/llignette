import {Id, Node} from "../core/nodes/Node";
import {check, checkNonNull} from "../../../common/util/Assertions";

/** A map of nodes indexed by ID. */
export class NodesById<IdBrand, T extends Node<IdBrand>> {

    private map = new Map<Id<IdBrand>, T>()

    get(nodeId: Id<IdBrand>): T {
        const result = this.map.get(nodeId)

        checkNonNull(result, "Node must be present in the model.")
        check(!result.isDeleted, "Node must not have been previously deleted.")

        return result
    }

    getDeleted(nodeId: Id<IdBrand>): T {
        const result = this.map.get(nodeId)

        checkNonNull(result, "Node must be present in the model.")
        check(result.isDeleted, "Node must have been previously deleted.")

        return result
    }

    isPresent(nodeId: Id<IdBrand>): boolean {
        const result = this.map.get(nodeId)
        return result != null && !result.isDeleted
    }

    put(node: T) {
        this.map.set(node.id, node)
    }

}

