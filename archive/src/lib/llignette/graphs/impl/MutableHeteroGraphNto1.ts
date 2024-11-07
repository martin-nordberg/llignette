//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "../Keyed"
import {type HeadVertexTraversal, type HeteroEdgeTraversal, type HeteroGraph, type TailVertexTraversal} from "../HeteroGraph"
import {someOrNone, type Optional} from "../../util/Optional";
import {type HeteroEdge} from "../Edges";

//=====================================================================================================================

type VertexKey = symbol

//=====================================================================================================================

/**
 * Mutable implementation of HeteroGraph with at most one head vertex per tail vertex.
 */
export class MutableHeteroGraphNto1<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>
    implements HeteroGraph<TailVertex, HeadVertex, EdgeProperties> {

    private edgeCount: number
    private readonly edgeOut: Map<VertexKey, HeteroEdge<TailVertex, HeadVertex, EdgeProperties>>
    private readonly edgesIn: Map<VertexKey, HeteroEdge<TailVertex, HeadVertex, EdgeProperties>[]>
    private readonly headVerticesByKey: Map<VertexKey, HeadVertex>
    private readonly tailVerticesByKey: Map<VertexKey, TailVertex>
    private vertexCount: number

    constructor() {
        this.edgeCount = 0
        this.edgesIn = new Map()
        this.edgeOut = new Map()
        this.headVerticesByKey = new Map()
        this.tailVerticesByKey = new Map()
        this.vertexCount = 0
    }

    edges(): HeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties> {
        throw new Error("Not yet implemented")
    }

    #forEachIncomingEdge(
        callback: (edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>) => void
    ) {
        return (vertex: HeadVertex) => {
            const edgesIn = this.edgesIn.get(vertex.key)
            if (edgesIn) {
                edgesIn.forEach(callback)
            } else if (!this.hasHeadVertex(vertex)) {
                throw Error("Vertex not present in this graph.")
            }
        }
    }

    #forEachInJoinedVertex(
        callback: (vertex: TailVertex) => void
    ) {
        return this.#forEachIncomingEdge(edge => {
            callback(edge.tail)
        })
    }

    #forEachOutgoingEdge(
        callback: (edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>) => void
    ) {
        return (vertex: TailVertex) => {
            const edgeOut = this.edgeOut.get(vertex.key)
            if (edgeOut) {
                callback(edgeOut)
            } else if (!this.hasTailVertex(vertex)) {
                throw Error("Vertex not present in this graph.")
            }
        }
    }

    #forEachOutJoinedVertex(
        callback: (vertex: HeadVertex) => void
    ) {
        return this.#forEachOutgoingEdge(edge => {
            callback(edge.head)
        })
    }

    /**
     * Freezes the underlying graph implementation to prevent further mutation.
     */
    freeze(): HeteroGraph<TailVertex, HeadVertex, EdgeProperties> {
        Object.freeze(this.edgesIn)
        Object.freeze(this.edgeOut)
        Object.freeze(this.tailVerticesByKey)
        Object.freeze(this.headVerticesByKey)
        return Object.freeze(this)
    }

    hasEdge(edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>): boolean {
        const head = edge.head
        const tail = edge.tail
        return this.hasTailVertex(tail) && this.hasHeadVertex(head) &&
            this.edgesIn.get(head.key)!.includes(edge) &&
            this.edgeOut.get(tail.key) === edge
    }

    hasHeadVertex(vertex: HeadVertex): boolean {
        return this.headVerticesByKey.has(vertex.key)
    }

    hasTailVertex(vertex: TailVertex): boolean {
        return this.tailVerticesByKey.has(vertex.key)
    }

    headVertexWithKey(key: symbol): Optional<HeadVertex> {
        return someOrNone(this.headVerticesByKey.get(key))
    }

    headVertices(): HeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties> {
        throw new Error("Not yet implemented")
    }

    /**
     * Adds a head vertex to this graph.
     * @param vertex the vertex to add
     */
    #includeHead(vertex: HeadVertex): HeadVertex {
        if (!this.headVerticesByKey.get(vertex.key)) {
            this.headVerticesByKey.set(vertex.key, vertex)
            this.edgesIn.set(vertex.key, [])
            if (!this.tailVerticesByKey.get(vertex.key)) {
                this.vertexCount += 1
            }
        }
        return vertex
    }

    /**
     * Adds a tail vertex to this graph.
     * @param vertex the vertex to add
     */
    #includeTail(vertex: TailVertex): TailVertex {
        if (!this.tailVerticesByKey.get(vertex.key)) {
            this.tailVerticesByKey.set(vertex.key, vertex)
            if (!this.headVerticesByKey.get(vertex.key)) {
                this.vertexCount += 1
            }
        }
        return vertex
    }

    inDegree(vertex: HeadVertex): number {
        return this.edgesIn.get(vertex.key)?.length ?? 0
    }

    /**
     * Adds an edge to this graph from tail to head.
     * @param tail the vertex at the tail of the new edge
     * @param head the vertex at the head of the new edge
     * @param edgeProperties the additional properties of the new edge
     */
    join(
        tail: TailVertex,
        head: HeadVertex,
        edgeProperties: EdgeProperties
    ): HeteroEdge<TailVertex, HeadVertex, EdgeProperties> {
        if (head.key === tail.key) {
            throw Error("Self loops not allowed.")
        }
        if (this.edgeOut.get(tail.key)) {
            throw Error("Tail vertex is already linked to a different head.")
        }

        this.#includeTail(tail)
        this.#includeHead(head)

        const result: HeteroEdge<TailVertex, HeadVertex, EdgeProperties> = {
            key: Symbol(),
            tail,
            head,
            ...edgeProperties
        }

        this.edgeCount += 1
        this.edgeOut.set(tail.key, result)
        this.edgesIn.get(head.key)!.push(result)

        return result
    }

    get order(): number {
        return this.vertexCount
    }

    outDegree(vertex: TailVertex): number {
        return this.edgeOut.get(vertex.key) ? 1 : 0
    }

    get size(): number {
        return this.edgeCount
    }

    tailVertexWithKey(key: symbol): Optional<TailVertex> {
        return someOrNone(this.tailVerticesByKey.get(key))
    }

    tailVertices(): TailVertexTraversal<TailVertex, HeadVertex, EdgeProperties> {
        throw new Error("Not yet implemented")
    }

}

//=====================================================================================================================

