//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "./Keyed"
import {type HeteroGraph} from "./HeteroGraph"
import {type HeteroEdge} from "./Edges";

//=====================================================================================================================

/**
 * Mutable implementation of HeteroGraph.
 */
export interface MutableHeteroGraph<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>
    extends HeteroGraph<TailVertex, HeadVertex, EdgeProperties> {

    /**
     * Freezes the underlying graph implementation to prevent further mutation.
     */
    freeze(): HeteroGraph<TailVertex, HeadVertex, EdgeProperties>

    /**
     * Adds an unconnected head vertex to this graph.
     * @param vertex the vertex to add
     */
    includeHead(vertex: HeadVertex): HeadVertex

    /**
     * Adds an unconnected tail vertex to this graph.
     * @param vertex the vertex to add
     */
    includeTail(vertex: TailVertex): TailVertex

    /**
     * Adds an edge to this graph from tail to head.
     * @param tail the vertex at the tail of the new edge (added to the graph if not already present)
     * @param head the vertex at the head of the new edge (added to the graph if not already present)
     * @param edgeProperties the additional properties of the new edge
     */
    join(
        tail: TailVertex,
        head: HeadVertex,
        edgeProperties: EdgeProperties
    ): HeteroEdge<TailVertex, HeadVertex, EdgeProperties>

}

//=====================================================================================================================
