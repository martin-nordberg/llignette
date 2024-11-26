import {Branded} from "../../../../common/util/Branded";

/** Unique branded ID for a specific concrete node type. */
export type Id<IdBrand> = Branded<string, IdBrand>

/** Ultimate base type for all model nodes. */
export type Node<IdBrand> = {

    /** The unique ID of the entity. */
    readonly id: Id<IdBrand>

    /** True if this node has been deleted. */
    readonly isDeleted: boolean

}
