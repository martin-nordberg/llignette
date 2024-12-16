import {Node} from "./Node";


/** Base type for model entities with a description. */
export type Described<IdBrand> = Node<IdBrand> & {

    /** A multi-line description of the entity. */
    readonly description?: string,

    /** A short one line summary description of the entity. */
    readonly summary?: string,

}
