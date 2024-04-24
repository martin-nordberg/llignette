//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import {type Keyed} from "./Keyed";
import {type Optional} from "../util/Optional";
import {type HeteroEdge} from "./Edges";
import {type Observer, type Subscription} from "rxjs";

//=====================================================================================================================

export interface SubscribableHeadVertexTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties> {

    subscribe(observer: Partial<Observer<HeadVertex>> | ((value: HeadVertex) => void)): Subscription

}

//=====================================================================================================================

export interface SubscribableHeteroEdgeTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties> {

    subscribe(observer: Partial<Observer<HeteroEdge<TailVertex, HeadVertex, EdgeProperties>>> |
        ((value: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>) => void)): Subscription

}

//=====================================================================================================================

export interface SubscribableTailVertexTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties> {

    subscribe(observer: Partial<Observer<TailVertex>> | ((value: TailVertex) => void)): Subscription

}

//=====================================================================================================================

export interface FilterableHeadVertexTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>
    extends SubscribableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties> {

    and(): HeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    or(): HeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

}

//=====================================================================================================================

export interface FilterableHeteroEdgeTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>
    extends SubscribableHeteroEdgeTraversal<TailVertex , HeadVertex , EdgeProperties> {

    and(): HeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    or(): HeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

}

//=====================================================================================================================

export interface FilterableTailVertexTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>
    extends SubscribableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>{

    and(): TailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    or(): TailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

}

//=====================================================================================================================

export interface HeadVertexTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>
    extends SubscribableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties> {

    joinedFromVertex(
        vertex: TailVertex
    ): FilterableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    joinedFromVertexWithKey(
        key: symbol
    ): FilterableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    matching(
        predicate: (vertex: HeadVertex) => boolean
    ): FilterableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    withKey(
        key: symbol
    ): FilterableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    withIncomingEdgeMatching(
        predicate: (edge: EdgeProperties) => boolean
    ): FilterableHeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

}

//=====================================================================================================================

export interface HeteroEdgeTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>
    extends SubscribableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties> {

    connecting(
        tailVertex: TailVertex,
        headVertex: HeadVertex
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    intoVertex(
        vertex: HeadVertex
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    intoVertexWithKey(
        key: symbol
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    intoVerticesMatching(
        predicate: (vertex: HeadVertex) => boolean
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    matching(
        predicate: (edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>) => boolean
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    outFromVertex(
        vertex: TailVertex
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    outFromVertexWithKey(
        key: symbol
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    outFromVerticesMatching(
        predicate: (vertex: TailVertex) => boolean
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    withKey(
        key: symbol
    ): FilterableHeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

}

//=====================================================================================================================

export interface TailVertexTraversal<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>
    extends SubscribableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties> {

    joinedToVertex(
        vertex: HeadVertex
    ): FilterableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    joinedToVertexWithKey(
        key: symbol
    ): FilterableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    matching(
        predicate: (vertex: TailVertex) => boolean
    ): FilterableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    withKey(
        key: symbol
    ): FilterableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    withOutgoingEdgeMatching(
        predicate: (edge: EdgeProperties) => boolean
    ): FilterableTailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

}

//=====================================================================================================================

/**
 * A directed graph where tail and head vertices are different types.
 */
export interface HeteroGraph<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties> {

    /**
     * Begins an algorithm to be applied to a subsequently specified set of edges within the graph.
     *
     * @example
     *  graph.edges()
     *       .outFromVertex(myVertex)
     *       .subscribe({next: }v => console.log(v.name)})
     */
    edges(): HeteroEdgeTraversal<TailVertex, HeadVertex, EdgeProperties>

    /**
     * Tests whether a given edge belongs to this graph.
     * @param edge the edge to check
     */
    hasEdge(edge: HeteroEdge<TailVertex, HeadVertex, EdgeProperties>): boolean

    /**
     * Tests whether a given head vertex belongs to this graph.
     * @param vertex the vertex to check
     */
    hasHeadVertex(vertex: HeadVertex): boolean

    /**
     * Tests whether a given parent vertex belongs to this graph.
     * @param vertex the vertex to check
     */
    hasTailVertex(vertex: TailVertex): boolean

    /**
     * Returns the head vertex with given key (or None).
     * @param key the unique key of a vertex to find
     */
    headVertexWithKey(key: symbol): Optional<HeadVertex>

    /**
     * Begins an algorithm to be applied to a subsequently specified set of head vertices within the graph.
     *
     * @example
     *  graph.headVertices()
     *       .matching(v => v.tag == '#MyTag')
     *       .subscribe({next: v => {
     *           // stuff
     *       }})
     */
    headVertices(): HeadVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

    /**
     * The number of edges coming in to the given head vertex.
     * @param vertex the vertex to query
     */
    inDegree(vertex: HeadVertex): number

    /**
     * The number of vertices in the graph.
     */
    get order(): number

    /**
     * The number of edges going out of the given tail vertex (0 or more).
     * @param vertex the vertex to query
     */
    outDegree(vertex: TailVertex): number

    /**
     * The number of edges in the graph.
     */
    get size(): number

    /**
     * Returns the tail vertex with given key.
     * @param key the unique key of a vertex to find
     */
    tailVertexWithKey(key: symbol): Optional<TailVertex>

    /**
     * Begins an algorithm to be applied to a subsequently specified set of tail vertices within the graph.
     */
    tailVertices(): TailVertexTraversal<TailVertex, HeadVertex, EdgeProperties>

}

//=====================================================================================================================

