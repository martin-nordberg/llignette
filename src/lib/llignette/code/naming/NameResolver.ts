//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import type {
    Field,
    Identifier,
    Module,
    TopLevel,
} from "../parsing/Model";
import type {HeteroGraph} from "../../graphs/HeteroGraph";
import {MutableHeteroGraphNto1} from "../../graphs/impl/MutableHeteroGraphNto1";

//=====================================================================================================================

type NameResolutionMethod =
    | '#NameResolutionMethod_FieldReference'
    | '#NameResolutionMethod_FunctionParameter'
    | '#NameResolutionMethod_LanguageCore'
    | '#NameResolutionMethod_PeerField'
    | '#NameResolutionMethod_TopLevel'

//=====================================================================================================================

/**
 * The outcome of name resolution.
 */
export type NamingOutcome = {

    /** The top level root of the overall AST. */
    readonly topLevel: TopLevel,

    /** For given name key, the modules containing a package, value, or type with that name. */
    readonly modulesWithTopLevelName: Map<string, Module[]>,

    /** A graph from identifiers to the fields they reference. */
    readonly nameGraph: HeteroGraph<Identifier, Field, NameResolutionMethod>

}

//=====================================================================================================================

/**
 * Resolves names of identifiers in the model.
 */
export function resolveNames(topLevel: TopLevel): NamingOutcome {

    const nameGraph = new MutableHeteroGraphNto1<Identifier, Field, NameResolutionMethod>()

    const modulesWithTopLevelName = new Map<string, Module[]>()

    // TODO: resolve names

    return {
        topLevel,
        modulesWithTopLevelName,
        nameGraph
    }

}

//=====================================================================================================================

class NameResolver {
}

//=====================================================================================================================
