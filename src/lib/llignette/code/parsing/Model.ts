//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import type {SourcePos} from "../util/SourcePos"
import type {Keyed} from "../../graphs/Keyed"
import type {Optional} from "../../util/Optional";

//=====================================================================================================================

/**
 * A boolean literal expression.
 */
export type BooleanLiteral = Keyed & {
    readonly tag: '#Model_BooleanLiteral',
    readonly sourcePos: SourcePos,
    readonly value: boolean
}

//=====================================================================================================================

/**
 * A built-in fundamental type name expression.
 */
let builtInTypeTagObj = {
    '#Model_BuiltInTypeBoolean': true,
    '#Model_BuiltInTypeInt64': true,
    '#Model_BuiltInTypeFloat64': true,
    '#Model_BuiltInTypePackage': true,
    '#Model_BuiltInTypeString': true,
    '#Model_BuiltInTypeType': true,
}

type BuiltInTypeTag = keyof typeof builtInTypeTagObj

let builtInTypeTagSet = new Set(Object.keys(builtInTypeTagObj))

export type BuiltInType = Keyed & {
    readonly tag: BuiltInTypeTag,
    readonly sourcePos: SourcePos
}

export function isBuiltInTypeExpr(expr: Model): expr is BuiltInType {
    return builtInTypeTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * An empty expression, generally the inside of "()".
 */
export type EmptyExpr = Keyed & {
    readonly tag: '#Model_EmptyExpr',
    readonly sourcePos: SourcePos
}

//=====================================================================================================================

/**
 * A single floating point literal.
 */
export type Float64Literal = Keyed & {
    readonly tag: '#Model_Float64Literal',
    readonly sourcePos: SourcePos,
    readonly value: number
}

//=====================================================================================================================

/**
 * A single identifier.
 */
export type Identifier = Keyed & {
    readonly tag: '#Model_Identifier',
    readonly sourcePos: SourcePos,
    readonly name: string
}

//=====================================================================================================================

/**
 * A single integer literal.
 */
export type Int64Literal = Keyed & {
    readonly tag: '#Model_Int64Literal',
    readonly sourcePos: SourcePos,
    readonly value: number
}

//=====================================================================================================================
//=====================================================================================================================

/**
 * A field within a structure.
 */
export type Field = Keyed & {
    readonly tag: '#Model_Field',
    readonly sourcePos: SourcePos,
    readonly fieldName: Identifier,
    readonly typeExpr: Optional<Model>,
    readonly valueExpr: Optional<Model>,
    readonly defaultValueExpr: Optional<Model>
}

//=====================================================================================================================

/**
 * A structure is a set of fields.
 */
export type Structure = Keyed & {
    readonly sourcePos: SourcePos,
    readonly fields: Field[]
}

//=====================================================================================================================

export type Module = Structure & {
    readonly tag: '#Model_Module'
}

//=====================================================================================================================

export type Record = Structure & {
    readonly tag: '#Model_Record'
}

//=====================================================================================================================
//=====================================================================================================================

/**
 * Llignette model nodes.
 */
export type Model =
    | BooleanLiteral
    | BuiltInType
    | EmptyExpr
    | Float64Literal
    | Identifier
    | Int64Literal
    | Record

//=====================================================================================================================

export type TopLevel = {
    readonly modules: Module[]
}

//=====================================================================================================================
