import {z} from "zod";

declare const __nodeBrand: unique symbol;

/** Unique branded ID for a specific concrete node type. */
export type NodeId = string & {
    readonly [__nodeBrand]: 'Node';
}

/** Validates the format of a node ID. */
export const nodeIdSchema =
    z.string({message: "Node ID must be a string."})
        .trim()
        .cuid2("Node ID must be in CUID2 format.")

/** Constructs an organization ID from a string. */
export function toNodeId(id: unknown) {
    return nodeIdSchema.parse(id) as NodeId
}

/** Ultimate base type for all model nodes. */
export type Node = {

    /** The unique ID of the entity. */
    readonly id: NodeId

}
