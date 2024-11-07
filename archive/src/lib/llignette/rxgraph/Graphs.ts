//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import {type MutableHeteroGraph} from "./MutableHeteroGraph";
import {type Keyed} from "./Keyed";
import {MutableHeteroGraphNtoN} from "./impl/MutableHeteroGraphNtoN";

//=====================================================================================================================

export function heteroGraphNtoN<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties>():
    HeteroGraphBuilder<TailVertex, HeadVertex, EdgeProperties> {
    return new HeteroGraphBuilder(new MutableHeteroGraphNtoN())
}

//=====================================================================================================================

export class HeteroGraphBuilder<TailVertex extends Keyed, HeadVertex extends Keyed, EdgeProperties> {

    #graph: MutableHeteroGraph<TailVertex, HeadVertex, EdgeProperties>

    constructor(graph: MutableHeteroGraph<TailVertex, HeadVertex, EdgeProperties>) {
        this.#graph = graph
    }

    make(): MutableHeteroGraph<TailVertex, HeadVertex, EdgeProperties> {
        return this.#graph
    }

    // withoutMultiEdges
    // withoutSelfLoops
    // withMaxOutDegree
    // withMaxInDegree

}

//=====================================================================================================================

