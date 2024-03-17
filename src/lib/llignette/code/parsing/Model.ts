//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import type {SourcePos} from "../util/SourcePos"
import type {Keyed} from "../../graphs/Keyed"
import type {Optional} from "../../util/Optional";

//=====================================================================================================================

/**
 * One alternative in a sequence.
 */
export type Alternative = Keyed & {
    readonly tag: '#Model_Alternative',
    readonly sourcePos: SourcePos,
    readonly condition: Optional<Model>,
    readonly value: Model
}

//=====================================================================================================================

/**
 * A sequence of conditional alternatives.
 */
export type AlternativesSequence = Keyed & {
    readonly tag: '#Model_AlternativesSequence',
    readonly sourcePos: SourcePos,
    readonly alternatives: Alternative[]
}

//=====================================================================================================================

/**
 * A single integer literal.
 */
export type ArrayLiteral = Keyed & {
    readonly tag: '#Model_ArrayLiteral',
    readonly sourcePos: SourcePos,
    readonly elements: Model[]
}

//=====================================================================================================================

/**
 * An array type (postfix '[]').
 */
export type ArrayType = Keyed & {
    readonly tag: '#Model_ArrayType',
    readonly sourcePos: SourcePos,
    readonly baseType: Model
}

//=====================================================================================================================

/**
 * Enumeration of operators linking a left hand side and a right hand side.
 */
let binaryOperationExprTagObj = {
    '#Model_AdditionExpr': true,
    '#Model_DivisionExpr': true,
    '#Model_EqualsExpr': true,
    '#Model_ExponentiationExpr': true,
    '#Model_FieldOptReferenceExpr': true,
    '#Model_FieldReferenceExpr': true,
    '#Model_FunctionArrowExpr': true,
    '#Model_FunctionCallExpr': true,
    '#Model_GreaterThanExpr': true,
    '#Model_GreaterThanOrEqualsExpr': true,
    '#Model_InExpr': true,
    '#Model_IntersectExpr': true,
    '#Model_IntersectLowPrecedenceExpr': true,
    '#Model_IsExpr': true,
    '#Model_LessThanExpr': true,
    '#Model_LessThanOrEqualsExpr': true,
    '#Model_LogicalAndExpr': true,
    '#Model_LogicalOrExpr': true,
    '#Model_LogicalXorExpr': true,
    '#Model_MatchExpr': true,
    '#Model_MultiplicationExpr': true,
    '#Model_NotEqualsExpr': true,
    '#Model_NotMatchExpr': true,
    '#Model_RangeExpr': true,
    '#Model_SubtractionExpr': true,
    '#Model_UnionExpr': true,
    '#Model_WhenExpr': true,
    '#Model_WhereExpr': true,
}

export type BinaryOperationExprTag = keyof typeof binaryOperationExprTagObj

let binaryOperationExprTagSet = new Set(Object.keys(binaryOperationExprTagObj))

export type BinaryOperationExpr = Keyed & {
    readonly tag: BinaryOperationExprTag,
    readonly sourcePos: SourcePos,
    readonly leftOperand: Model,
    readonly rightOperand: Model
}

export function isBinaryOperationExpr(expr: Model): expr is BinaryOperationExpr {
    return binaryOperationExprTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * A boolean literal expression.
 */
export type BooleanLiteral = Keyed & {
    readonly tag: '#Model_Literal_Boolean',
    readonly sourcePos: SourcePos,
    readonly value: boolean
}

//=====================================================================================================================

/**
 * A built-in fundamental type name expression.
 */
let builtInTypeTagObj = {
    '#Model_BuiltInType_Boolean': true,
    '#Model_BuiltInType_Int64': true,
    '#Model_BuiltInType_Float64': true,
    '#Model_BuiltInType_Package': true,
    '#Model_BuiltInType_String': true,
    '#Model_BuiltInType_Type': true,
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
    readonly tag: '#Model_Literal_Float64',
    readonly sourcePos: SourcePos,
    readonly value: number
}

//=====================================================================================================================

/**
 * A function declaration.
 */
export type FunctionDeclaration = Keyed & {
    readonly tag: '#Model_FunctionDeclaration',
    readonly sourcePos: SourcePos,
    readonly argumentRecord: Record,
    readonly body: Model
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
    readonly tag: '#Model_Literal_Int64',
    readonly sourcePos: SourcePos,
    readonly value: number
}

//=====================================================================================================================

/**
 * String literals distinguished by start/stop delimiters.
 */
let stringLiteralTagObj = {
    '#Model_Literal_String_BackTicked': true,
    '#Model_Literal_String_DoubleQuoted': true,
    '#Model_Literal_String_SingleQuoted': true,
    '#Model_Literal_String_BackTickedBlock': true,
    '#Model_Literal_String_DoubleQuotedBlock': true,
    '#Model_Literal_String_SingleQuotedBlock': true,
    // TODO: exclamation string
}

export type StringLiteralTag = keyof typeof stringLiteralTagObj

let stringLiteralTagSet = new Set(Object.keys(stringLiteralTagObj))

export type StringLiteral = Keyed & {
    readonly tag: StringLiteralTag,
    readonly sourcePos: SourcePos,
    readonly value: string
}

export function isStringLiteral(expr: Model): expr is StringLiteral {
    return stringLiteralTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * Enumeration of operations with one operand (linked by the operands tree).
 */
let typeConstraintTagObj = {
    '#Model_TypeConstraint_GreaterThan': true,
    '#Model_TypeConstraint_GreaterThanOrEqual': true,
    '#Model_TypeConstraint_LessThan': true,
    '#Model_TypeConstraint_LessThanOrEqual': true,
    '#Model_TypeConstraint_FieldReference': true,
}

export type TypeConstraintTag = keyof typeof typeConstraintTagObj

let typeConstraintTagSet = new Set(Object.keys(typeConstraintTagObj))

export type TypeConstraint = Keyed & {
    readonly tag: TypeConstraintTag,
    readonly sourcePos: SourcePos,
    readonly operand: Model
}

export function isTypeConstraint(expr: Model): expr is TypeConstraint {
    return typeConstraintTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * Enumeration of operations with one operand (linked by the operands tree).
 */
let unaryOperationExprTagObj = {
    '#Model_AnnotationExpr': true,
    '#Model_LogicalNotExpr': true,
    '#Model_NegationExpr': true,
    '#Model_OptionalExpr': true,
    '#Model_ParenthesizedExpr': true,
    '#Model_TagExpr': true,
}

export type UnaryOperationExprTag = keyof typeof unaryOperationExprTagObj

let unaryOperationExprTagSet = new Set(Object.keys(unaryOperationExprTagObj))

export type UnaryOperationExpr = Keyed & {
    readonly tag: UnaryOperationExprTag,
    readonly sourcePos: SourcePos,
    readonly operand: Model
}

export function isUnaryOperationExpr(expr: Model): expr is UnaryOperationExpr {
    return unaryOperationExprTagSet.has(expr.tag)
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
    readonly documentation: Optional<string>,
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

export function isRecord(expr: Model): expr is Record {
    return expr.tag == '#Model_Record'
}

//=====================================================================================================================
//=====================================================================================================================

/**
 * Llignette model nodes.
 */
export type Model =
    | AlternativesSequence
    | ArrayType
    | ArrayLiteral
    | BinaryOperationExpr
    | BooleanLiteral
    | BuiltInType
    | EmptyExpr
    | Float64Literal
    | FunctionDeclaration
    | Identifier
    | Int64Literal
    | Record
    | StringLiteral
    | TypeConstraint
    | UnaryOperationExpr

//=====================================================================================================================

export type TopLevel = {
    readonly modules: Module[]
}

//=====================================================================================================================
