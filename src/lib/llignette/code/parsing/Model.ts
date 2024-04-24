//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import type {SourcePos} from "../util/SourcePos"
import type {Keyed} from "../../graphs/Keyed"
import type {Optional} from "../../util/Optional";

//=====================================================================================================================

/**
 * Any model element deriving from source code.
 */
export type Sourced = Keyed & {
    readonly sourcePos: SourcePos,
}

//=====================================================================================================================

/**
 * An "absent" (not applicable) field in code generation.
 */
export type Absent = Sourced & {
    readonly tag: '#Model_Absent'
}

//=====================================================================================================================

/**
 * An array indexing expression (postfix '[expr]').
 */
export type ArrayIndexing = Sourced & {
    readonly tag: '#Model_ArrayIndexing',
    readonly baseExpression: Model,
    readonly index: Model
}

//=====================================================================================================================

/**
 * A single integer literal.
 */
export type ArrayLiteral = Sourced & {
    readonly tag: '#Model_ArrayLiteral',
    readonly elements: Model[]
}

//=====================================================================================================================

/**
 * An array type (postfix '[]').
 */
export type ArrayType = Sourced & {
    readonly tag: '#Model_ArrayType',
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
    '#Model_SubtypeExpr': "<:",
    '#Model_TypeState': "~",
    '#Model_TypeStateChange': "~=",
    '#Model_TypeStateEffect': "~>",
    '#Model_UnionExpr': "|",
    '#Model_WhenExpr': "when",
    '#Model_WhereExpr': "where",
}

export type BinaryOperationExprTag = keyof typeof binaryOperationExprTagObj

let binaryOperationExprTagSet = new Set(Object.keys(binaryOperationExprTagObj))

export type BinaryOperationExpr = Sourced & {
    readonly tag: BinaryOperationExprTag,
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
export type BooleanLiteral = Sourced & {
    readonly tag: '#Model_Literal_Boolean',
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

export type BuiltInType = Sourced & {
    readonly tag: BuiltInTypeTag,
}

export function isBuiltInTypeExpr(expr: Model): expr is BuiltInType {
    return builtInTypeTagSet.has(expr.tag)
}

//=====================================================================================================================

/**
 * An empty expression, generally the inside of "()".
 */
export type EmptyExpr = Sourced & {
    readonly tag: '#Model_EmptyExpr'
}

//=====================================================================================================================

/**
 * A single floating point literal.
 */
export type Float64Literal = Sourced & {
    readonly tag: '#Model_Literal_Float64',
    readonly value: number
}

//=====================================================================================================================

/**
 * A function declaration.
 */
export type FunctionDeclaration = Sourced & {
    readonly tag: '#Model_FunctionDeclaration',
    readonly argumentRecord: Record,
    readonly returnType: Optional<Model>
    readonly body: Model
}

//=====================================================================================================================

/**
 * A generator declaration.
 */
export type GeneratorDeclaration = Sourced & {
    readonly tag: '#Model_GeneratorDeclaration',
    readonly argumentRecord: Record,
    readonly returnType: Optional<Model>
    readonly body: Model
}

//=====================================================================================================================

/**
 * An ordinary identifier.
 */
export type NamedIdentifier = Sourced & {
    readonly tag: '#Model_Identifier',
    readonly name: string
}

/**
 * A mustache-enclosed expression evaluating to an identifier.
 */
export type InterpolatedIdentifier = Sourced & {
    readonly tag: '#Model_InterpolatedIdentifier',
    readonly expression: Model
}

export type Identifier =
    | NamedIdentifier
    | InterpolatedIdentifier

export function isIdentifier(expr: Model): expr is Identifier {
    return expr.tag == '#Model_Identifier' || expr.tag == '#Model_InterpolatedIdentifier'
}

//=====================================================================================================================

/**
 * A single integer literal.
 */
export type Int64Literal = Sourced & {
    readonly tag: '#Model_Literal_Int64',
    readonly value: number
}

//=====================================================================================================================

/**
 * A literal fragment within an interpolated string.
 */
export type StringFragment = Sourced & {
    readonly tag: '#Model_Literal_StringFragment',
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

export type StringLiteral = Sourced & {
    readonly tag: StringLiteralTag,
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

export type TypeConstraint = Sourced & {
    readonly tag: TypeConstraintTag,
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
    '#Model_MetaExpr': "^",
    '#Model_NegationExpr': "-",
    '#Model_OptionalExpr': "?",
    '#Model_OtherwiseExpr': "otherwise",
    '#Model_ParenthesizedExpr': "(...)",
    '#Model_TagExpr': "#",
}

export type UnaryOperationExprTag = keyof typeof unaryOperationExprTagObj

let unaryOperationExprTagSet = new Set(Object.keys(unaryOperationExprTagObj))

export type UnaryOperationExpr = Sourced & {
    readonly tag: UnaryOperationExprTag,
    readonly operand: Model
}

export function isUnaryOperationExpr(expr: Model): expr is UnaryOperationExpr {
    return unaryOperationExprTagSet.has(expr.tag)
}

//=====================================================================================================================
//=====================================================================================================================

export type FieldValueType =
    | '#FieldValue_Alias'
    | '#FieldValue_Default'
    | '#FieldValue_Fixed'
    | '#FieldValue_None'
    | '#FieldValue_Partial'
    | '#FieldValue_StateChange'

export type FieldPurpose =
    | '#FieldPurpose_Result'
    | '#FieldPurpose_Temporary'
    | '#FieldPurpose_Verification'

/**
 * A field within a structure.
 */
export type Field = Sourced & {
    readonly tag: '#Model_Field',
    readonly fieldName: Identifier,
    readonly documentation: Optional<StringLiteral>,
    readonly typeExpr: Optional<Model>,
    readonly metaTypeExpr: Optional<Model>,
    readonly valueExpr: Optional<Model>,
    readonly valueType: FieldValueType,
    readonly purpose: FieldPurpose
}

//=====================================================================================================================

/**
 * A structure is a set of fields.
 */
export type Structure = Sourced & {
    readonly fields: Field[]
}

//=====================================================================================================================

export type Module = Structure & {
    readonly tag: '#Model_Module',

    // TODO: Source file name

    /** The original source code. */
    readonly sourceCode: string,

    /** Offsets of new line characters in the source code. */
    readonly newLineOffsets: number[],

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
    | Absent
    | ArrayIndexing
    | ArrayLiteral
    | ArrayType
    | BinaryOperationExpr
    | BooleanLiteral
    | BuiltInType
    | EmptyExpr
    | Float64Literal
    | FunctionDeclaration
    | GeneratorDeclaration
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

export type TopLevel = Keyed & {
    readonly modules: Module[]
}

//=====================================================================================================================
