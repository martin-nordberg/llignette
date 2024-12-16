import {Id, Node} from "../nodes/core/Node";
import {check, checkNonNull} from "../../util/Assertions";

/** A map of nodes indexed by ID. */
export class NodesById<IdBrand, T extends Node<IdBrand>> {

    private map = new Map<Id<IdBrand>, T>()

    get(nodeId: Id<IdBrand>): T {
        const result = this.map.get(nodeId)

        checkNonNull(result, () => `Node with ID '${nodeId}' must be present in the model.`)
        check(!result.isDeleted, () => `Node with ID '${nodeId}' must not have been previously deleted.`)

        return result
    }

    getAll(): T[] {
        return this.map.values().toArray()
    }

    getDeleted(nodeId: Id<IdBrand>): T {
        const result = this.map.get(nodeId)

        checkNonNull(result, () => `Node with ID '${nodeId}' must be present in the model.`)
        check(result.isDeleted, () => `Node with ID '${nodeId}' must have been previously deleted.`)

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

