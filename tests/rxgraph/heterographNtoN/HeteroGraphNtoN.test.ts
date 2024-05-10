import {describe, it, expect} from 'vitest';
import {heteroGraphNtoN} from "../../../src/lib/llignette/rxgraph/Graphs";
import {type Keyed} from "../../../src/lib/llignette/rxgraph/Keyed";
import {value} from "../../../src/lib/llignette/util/Optional";

type Tail = Keyed & {
    t: string
}

type Head = Keyed & {
    h: string
}

type Edge = {
    w: number
}

describe('HeteroGraphNtoN Tests', () => {

    it('initializes to empty', () => {
        const graph = heteroGraphNtoN<Tail, Head, Edge>().make().freeze()

        expect(graph.size).toBe(0)
        expect(graph.order).toBe(0)
    });

    it('handles a few vertices and edges', () => {
        const mgraph = heteroGraphNtoN<Tail, Head, Edge>().make()

        const t00 = {key: Symbol(), t: "t00"}
        const h00 = {key: Symbol(), h: "h00"}

        const t01 = {key: Symbol(), t: "T01"}
        const t02 = {key: Symbol(), t: "T02"}
        const t03 = {key: Symbol(), t: "T03"}
        const h01 = {key: Symbol(), h: "H01"}
        const h02 = {key: Symbol(), h: "H02"}

        const e0101 = mgraph.join(t01, h01, {w:1} )
        const e0202 = mgraph.join(t02, h02, {w:1} )
        const e0301 = mgraph.join(t03, h01, {w:1} )
        const e0302 = mgraph.join(t03, h02, {w:1} )

        const graph = mgraph.freeze()

        expect(graph.size).toBe(4)
        expect(graph.order).toBe(5)

        expect(graph.hasTailVertex(t01)).toBeTruthy()
        expect(graph.hasTailVertex(t02)).toBeTruthy()
        expect(graph.hasTailVertex(t03)).toBeTruthy()
        expect(graph.hasHeadVertex(h01)).toBeTruthy()
        expect(graph.hasHeadVertex(h02)).toBeTruthy()
        expect(graph.hasEdge(e0101)).toBeTruthy()

        expect(value(graph.tailVertexWithKey(t01.key), t00)).toBe(t01)
        expect(value(graph.headVertexWithKey(h01.key), h00)).toBe(h01)

        expect(graph.inDegree(h01)).toEqual(2)
        expect(graph.inDegree(h02)).toEqual(2)

        expect(graph.outDegree(t01)).toEqual(1)
        expect(graph.outDegree(t02)).toEqual(1)
        expect(graph.outDegree(t03)).toEqual(2)
    });

});
