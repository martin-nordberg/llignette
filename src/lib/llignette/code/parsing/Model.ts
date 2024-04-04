//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import type {SourcePos} from "../util/SourcePos"
import type {Keyed} from "../../graphs/Keyed"
import type {Optional} from "../../util/Optional";

//=====================================================================================================================

/**
 * An array indexing expression (postfix '[expr]').
 */
export type ArrayIndexing = Keyed & {
    readonly tag: '#Model_ArrayIndexing',
    readonly sourcePos: SourcePos,
    readonly baseExpression: Model,
    readonly index: Model
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
    '#Model_AdditionExpr': "+",
    '#Model_DivisionExpr': "/",
    '#Model_EqualsExpr': "==",
    '#Model_ExponentiationExpr': "**",
    '#Model_FieldReferenceExpr': ".",
    '#Model_FunctionArrowExpr': "->",
    '#Model_FunctionCallExpr': "...(...)",
    '#Model_GreaterThanExpr': ">",
    '#Model_GreaterThanOrEqualsExpr': ">=",
    '#Model_InExpr': "in",
    '#Model_IntersectExpr': "&",
    '#Model_IntersectLowPrecedenceExpr': "&&",
    '#Model_IsExpr': "is",
    '#Model_LessThanExpr': "<",
    '#Model_LessThanOrEqualsExpr': "<=",
    '#Model_LogicalAndExpr': "and",
    '#Model_LogicalOrExpr': "or",
    '#Model_LogicalXorExpr': "xor",
    '#Model_ModuloExpr': "mod",
    '#Model_MultiplicationExpr': "*",
    '#Model_NotEqualsExpr': "!=",
    '#Model_RangeExpr': "..",
    '#Model_SubtractionExpr': "-",
    '#Model_TypeState': "~",
    '#Model_TypeStateChange': "~=",
    '#Model_TypeStateEffect': "~>",
    '#Model_UnionExpr': "|",
    '#Model_WhenExpr': "when",
    '#Model_WhereExpr': "where",
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
    readonly returnType: Optional<Model>
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

export type StringFragment = Keyed & {
    readonly tag: '#Model_Literal_StringFragment',
    readonly sourcePos: SourcePos,
    readonly value: string
}

//=====================================================================================================================

/**
 * String literals distinguished by start/stop delimiters.
 */
let stringLiteralTagObj = {
    '#Model_Literal_String_BackTicked': true,
    '#Model_Literal_String_DoubleQuoted': true,
    '#Model_Literal_String_SingleQuoted': true,
    '#Model_Literal_String_TripleBackTicked': true,
    '#Model_Literal_String_TripleDoubleQuote': true,
    '#Model_Literal_String_TripleSingleQuoted': true,
    // TODO: exclamation string?
}

export type StringLiteralTag = keyof typeof stringLiteralTagObj

let stringLiteralTagSet = new Set(Object.keys(stringLiteralTagObj))

export type StringLiteral = Keyed & {
    readonly tag: StringLiteralTag,
    readonly sourcePos: SourcePos,
    readonly fragments: Model[]
}

export function isStringLiteral(expr: Model): expr is StringLiteral {
    return stringLiteralTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * Enumeration of operations with one operand (linked by the operands tree).
 */
let typeConstraintTagObj = {
    '#Model_TypeConstraint_GreaterThan': ">",
    '#Model_TypeConstraint_GreaterThanOrEqual': ">=",
    '#Model_TypeConstraint_LessThan': "<",
    '#Model_TypeConstraint_LessThanOrEqual': "<=",
    '#Model_TypeConstraint_FieldReference': ".",
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
    '#Model_AnnotationExpr': "@",
    '#Model_LogicalNotExpr': "not",
    '#Model_NegationExpr': "-",
    '#Model_OptionalExpr': "?",
    '#Model_OtherwiseExpr': "otherwise",
    '#Model_ParenthesizedExpr': "(...)",
    '#Model_TagExpr': "#",
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

export type FieldValueType =
    | '#FieldValue_Default'
    | '#FieldValue_Fixed'
    | '#FieldValue_Partial'
    | '#FieldValue_None'
    | '#FieldValue_StateChange'

/**
 * A field within a structure.
 */
export type Field = Keyed & {
    readonly tag: '#Model_Field',
    readonly sourcePos: SourcePos,
    readonly fieldName: Identifier,
    readonly documentation: Optional<StringLiteral>,
    readonly typeExpr: Optional<Model>,
    readonly valueExpr: Optional<Model>,
    readonly valueType: FieldValueType
}

//=====================================================================================================================

/**
 * A record value injected into a larger record using '...'.
 */
export type InjectedRecord = Keyed & {
    readonly tag: '#Model_InjectedRecord',
    readonly sourcePos: SourcePos,
    readonly injectedValue: Model,
}

//=====================================================================================================================

export type RecordEntry = Field | InjectedRecord

//=====================================================================================================================

/**
 * A structure is a set of fields or injected records.
 */
export type Structure = Keyed & {
    readonly sourcePos: SourcePos,
    readonly entries: RecordEntry[]
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
    | ArrayIndexing
    | ArrayLiteral
    | ArrayType
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
    | StringFragment
    | TypeConstraint
    | UnaryOperationExpr

//=====================================================================================================================

export type ModelTag = Model["tag"]

//=====================================================================================================================

export type TopLevel = {
    readonly modules: Module[]
}

//=====================================================================================================================
