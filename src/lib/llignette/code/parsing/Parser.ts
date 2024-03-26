//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import type {ScanningOutcome} from "../scanning/Scanner"
import type {
    BinaryOperationExprTag,
    Field,
    FieldValueType,
    FunctionDeclaration,
    Identifier,
    Model,
    Module,
    UnaryOperationExpr,
    UnaryOperationExprTag
} from "./Model";
import type {Token} from "../scanning/Token";
import {SourcePos} from "../util/SourcePos";
import {isNone, none, type Optional, some} from "../../util/Optional";
import type {TokenType} from "../scanning/TokenType";
import {isRecord} from "./Model";

//=====================================================================================================================

/**
 * The outcome of parsing.
 */
export type ParsingOutcome = {
    /** The original source code. */
    readonly sourceCode: string,

    /** Offsets of new line characters in the source code. */
    readonly newLineOffsets: number[],

    /** The root of the resulting AST. */
    readonly module: Module,
}

//=====================================================================================================================

/**
 * Parses a module from its scan result.
 * @param scanResult the tokens from the scanner.
 */
export function parseModule(scanResult: ScanningOutcome): ParsingOutcome {

    const parser = new Parser(scanResult)

    const module = parser.parseModule()

    return {
        sourceCode: scanResult.sourceCode,
        newLineOffsets: scanResult.newLineOffsets,
        module
    }

}

//=====================================================================================================================

class Parser {
    private readonly sourceCode: string
    private readonly tokens: Token[]
    private tokensIndex: number

    constructor(scanResult: ScanningOutcome) {
        this.sourceCode = scanResult.sourceCode
        this.tokens = scanResult.tokens
        this.tokensIndex = 0
    }

    /**
     * Parses one whole source file.
     */
    parseModule(): Module {

        const fields: Field[] = this.#parseFields()

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_Eof') {
            throw Error("Expected end of file")
        }

        return {
            tag: '#Model_Module',
            key: Symbol(),
            sourcePos: fields[0].sourcePos.thru(fields[fields.length - 1].sourcePos),
            fields
        }

    }

    /**
     * Parses one field in a structure.
     */
    #parseField(): Field {

        const startSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])

        const fieldName: Identifier = this.#parseIdentifier()
        let endSourcePos = fieldName.sourcePos

        let documentation: Optional<string> = none()
        let typeExpr: Optional<Model> = none()

        // Parse the documentation and type in either order.
        while (true) {
            if (this.tokens[this.tokensIndex].tokenType == '#TokenType_ColonColon' && isNone(documentation)) {
                this.tokensIndex += 1
                switch (this.tokens[this.tokensIndex].tokenType) {
                    case '#TokenType_BackTickedString':
                        documentation = some(this.#getQuotedStringValue(SourcePos.fromToken(this.tokens[this.tokensIndex])))
                        break
                    case '#TokenType_TripleBackTickedString':
                        documentation = some(this.#getTripleQuotedStringValue(SourcePos.fromToken(this.tokens[this.tokensIndex])))
                        break
                    case '#TokenType_DoubleQuotedString':
                        documentation = some(this.#getQuotedStringValue(SourcePos.fromToken(this.tokens[this.tokensIndex])))
                        break
                    case '#TokenType_TripleDoubleQuotedString':
                        documentation = some(this.#getTripleQuotedStringValue(SourcePos.fromToken(this.tokens[this.tokensIndex])))
                        break
                    case '#TokenType_SingleQuotedString':
                        documentation = some(this.#getQuotedStringValue(SourcePos.fromToken(this.tokens[this.tokensIndex])))
                        break
                    case '#TokenType_TripleSingleQuotedString':
                        documentation = some(this.#getTripleQuotedStringValue(SourcePos.fromToken(this.tokens[this.tokensIndex])))
                        break
                    default:
                        throw Error("Expected documentation string")
                }
                this.tokensIndex += 1
            } else if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Colon' && isNone(typeExpr)) {
                this.tokensIndex += 1
                const expr: Model = this.parseExprWithBindingPower(0)
                endSourcePos = expr.sourcePos
                typeExpr = some(expr)
            } else {
                break;
            }
        }

        // Parse the value or the default value or a type state change.
        let valueExpr: Optional<Model> = none()
        let valueType: FieldValueType = '#FieldValue_None'
        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Equals') {
            this.tokensIndex += 1
            const expr: Model = this.parseExprWithBindingPower(0)
            endSourcePos = expr.sourcePos
            valueExpr = some(expr)
            valueType = '#FieldValue_Fixed'
        } else if (this.tokens[this.tokensIndex].tokenType == '#TokenType_AmpersandEquals') {
            this.tokensIndex += 1
            const expr: Model = this.parseExprWithBindingPower(0)
            endSourcePos = expr.sourcePos
            valueExpr = some(expr)
            valueType = '#FieldValue_Partial'
        } else if (this.tokens[this.tokensIndex].tokenType == '#TokenType_QuestionQuestionEquals') {
            this.tokensIndex += 1
            const expr: Model = this.parseExprWithBindingPower(0)
            endSourcePos = expr.sourcePos
            valueExpr = some(expr)
            valueType = '#FieldValue_Default'
        } else if (this.tokens[this.tokensIndex].tokenType == '#TokenType_TildeEquals') {
            this.tokensIndex += 1
            const expr: Model = this.parseExprWithBindingPower(0)
            endSourcePos = expr.sourcePos
            valueExpr = some(expr)
            valueType = '#FieldValue_StateChange'
        }

        return {
            tag: '#Model_Field',
            key: Symbol(),
            sourcePos: startSourcePos.thru(endSourcePos),
            fieldName,
            documentation,
            typeExpr,
            valueExpr,
            valueType
        }

    }

    /**
     * Parses a sequence of fields in a structure.
     */
    #parseFields(): Field[] {

        let fields: Field[] = []

        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Identifier') {
            // First field.
            fields.push(this.#parseField())

            while (true) {
                // Subsequent field after a comma.
                if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Comma') {
                    this.tokensIndex += 1
                    if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Identifier') {
                        fields.push(this.#parseField())
                        continue
                    }
                }

                // Subsequent field after an intervening blank line.
                else if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Identifier') {
                    const betweenTokensStart = this.tokens[this.tokensIndex - 1].sourceOffset +
                        this.tokens[this.tokensIndex - 1].sourceLength
                    const betweenTokensEnd = this.tokens[this.tokensIndex].sourceOffset

                    const betweenTokens = this.sourceCode.substring(betweenTokensStart, betweenTokensEnd)
                    if (betweenTokens.split("\n").length > 2) {
                        fields.push(this.#parseField())
                        continue
                    }
                }

                break
            }
        }

        return fields

    }

    /**
     * Parses one identifier.
     */
    #parseIdentifier(): Identifier {

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_Identifier') {
            throw Error("Expected field name (identifier).")
        }

        const sourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        const name = sourcePos.getText(this.sourceCode)
        this.tokensIndex += 1

        return {
            tag: '#Model_Identifier',
            key: Symbol(),
            sourcePos,
            name
        }

    }


    /**
     * Parses an expression, continuing until encountering an operation with binding power greater than the given value.
     * @param minBindingPower operations with binding power greater than this threshold signal the start of a larger
     *                        parent expression with the so-far parsed expression as its left hand side.
     */
    parseExprWithBindingPower(minBindingPower: number = 0): Model {

        let lhs = this.#parseLeftHandSide()

        while (true) {

            // Look ahead for an operator continuing the expression.
            const opToken = this.tokens[this.tokensIndex]

            // Handle postfix operators ...
            const pBindingPower = postfixBindingPowers.get(opToken.tokenType)!

            if (pBindingPower) {
                if (pBindingPower < minBindingPower) {
                    break
                }

                this.tokensIndex += 1
                lhs = this.#parsePostfixExpression(lhs, opToken)
                continue
            }

            // Handle infix operators ...
            const iBindingPower = infixBindingPowers.get(opToken.tokenType)!

            if (iBindingPower) {
                if (iBindingPower.left < minBindingPower) {
                    break
                }

                this.tokensIndex += 1
                lhs = this.#parseInfixOperation(lhs, iBindingPower)
                continue
            }

            break

        }

        return lhs
    }

    #getQuotedStringValue(sourcePos: SourcePos) {
        let value = sourcePos.getText(this.sourceCode)
        value = value.substring(1, value.length - 1)
        // TODO: convert escape sequences
        // TODO: interpolations
        return value
    }

    #getTripleQuotedStringValue(sourcePos: SourcePos) {
        let value = sourcePos.getText(this.sourceCode)
        value = value.substring(3, value.length - 3)
        // TODO: convert escape sequences
        // TODO: interpolations
        return value
    }

    #isTokenAfterRecordFieldName(tokenType: TokenType) {
        return tokenType == '#TokenType_Comma' ||
            tokenType == '#TokenType_AmpersandEquals' ||
            tokenType == '#TokenType_Equals' ||
            tokenType == '#TokenType_Colon' ||
            tokenType == '#TokenType_ColonColon' ||
            tokenType == '#TokenType_QuestionQuestionEquals' ||
            tokenType == '#TokenType_RightParenthesis' ||
            tokenType == '#TokenType_TildeEquals'
    }

    #parseArrayLiteral(token: Token): Model {

        const startSourcePos = SourcePos.fromToken(token)
        const elements: Model[] = []

        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_RightBracket') {
            const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
            this.tokensIndex += 1
            return {
                key: Symbol(),
                tag: '#Model_ArrayLiteral',
                sourcePos: startSourcePos.thru(endSourcePos),
                elements
            }
        }

        while (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightBracket') {
            // Parse one expression.
            elements.push(this.parseExprWithBindingPower(0))

            if (this.tokens[this.tokensIndex].tokenType != '#TokenType_Comma') {
                break
            }

            this.tokensIndex += 1
        }

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightBracket') {
            throw Error("Expected right bracket.")
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return {
            key: Symbol(),
            tag: '#Model_ArrayLiteral',
            sourcePos: startSourcePos.thru(endSourcePos),
            elements
        }

    }

    #parseFunctionDeclaration(fnToken: Token): FunctionDeclaration {
        const lParenToken = this.tokens[this.tokensIndex]

        if (lParenToken.tokenType != '#TokenType_LeftParenthesis') {
            throw Error("Expected left parenthesis")
        }

        this.tokensIndex += 1

        const argumentRecord = this.#parseParenthesizedExpression(lParenToken)

        if (!isRecord(argumentRecord)) {
            throw Error("Expected argument list")
        }

        let returnType: Optional<Model> = none()

        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_DashArrow') {
            this.tokensIndex += 1
            returnType = some(this.parseExprWithBindingPower(0))
        }

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_EqualsArrow') {
            throw Error("Expected double arrow")
        }

        this.tokensIndex += 1

        const body = this.parseExprWithBindingPower(0)

        return {
            key: Symbol(),
            tag: '#Model_FunctionDeclaration',
            sourcePos: SourcePos.fromToken(fnToken).thru(body.sourcePos),
            argumentRecord,
            returnType,
            body
        }
    }

    /**
     * Parses an infix expression after the left hand side and the operator token have been consumed.
     */
    #parseInfixOperation(
        leftOperand: Model,
        bindingPower: InfixBindingPower
    ): Model {
        const rightOperand = this.parseExprWithBindingPower(bindingPower.right)
        const sourcePos = leftOperand.sourcePos.thru(rightOperand.sourcePos)

        return {
            tag: bindingPower.exprTag,
            key: Symbol(),
            sourcePos,
            leftOperand,
            rightOperand
        }
    }

    #parseLeftHandSide(): Model {

        const token = this.tokens[this.tokensIndex]
        this.tokensIndex += 1

        const sourcePos = SourcePos.fromToken(token)

        switch (token.tokenType) {

            case '#TokenType_AtSign':
            case '#TokenType_Dash':
            case '#TokenType_Hash':
            case '#TokenType_Not':
                return this.#parseUnaryPrefixOperationExpression(token)

            case '#TokenType_BackTickedString':
                return {
                    key: Symbol(),
                    tag: '#Model_Literal_String_BackTicked',
                    sourcePos,
                    value: this.#getQuotedStringValue(sourcePos)
                }

            case '#TokenType_Boolean':
                return {
                    key: Symbol(),
                    tag: '#Model_BuiltInType_Boolean',
                    sourcePos,
                }

            case '#TokenType_DoubleQuotedString':
                return {
                    key: Symbol(),
                    tag: '#Model_Literal_String_DoubleQuoted',
                    sourcePos,
                    value: this.#getQuotedStringValue(sourcePos)
                }

            case '#TokenType_Dot':
                const dotOperand = this.parseExprWithBindingPower(0)
                return {
                    key: Symbol(),
                    tag: '#Model_TypeConstraint_FieldReference',
                    sourcePos: sourcePos.thru(dotOperand.sourcePos),
                    operand: dotOperand
                }

            case '#TokenType_False':
                return {
                    key: Symbol(),
                    tag: '#Model_Literal_Boolean',
                    sourcePos,
                    value: false,
                }

            case '#TokenType_Float64':
                return {
                    key: Symbol(),
                    tag: '#Model_BuiltInType_Float64',
                    sourcePos,
                }

            case '#TokenType_FloatingPointLiteral':
                return {
                    key: Symbol(),
                    tag: '#Model_Literal_Float64',
                    sourcePos,
                    value: +sourcePos.getText(this.sourceCode),// TODO: better scanning
                }

            case '#TokenType_Fn':
                return this.#parseFunctionDeclaration(token)

            case '#TokenType_GreaterThan':
                const gtOperand = this.parseExprWithBindingPower(0)
                return {
                    key: Symbol(),
                    tag: '#Model_TypeConstraint_GreaterThan',
                    sourcePos: sourcePos.thru(gtOperand.sourcePos),
                    operand: gtOperand
                }

            case '#TokenType_GreaterThanOrEquals':
                const gteOperand = this.parseExprWithBindingPower(0)
                return {
                    key: Symbol(),
                    tag: '#Model_TypeConstraint_GreaterThan',
                    sourcePos: sourcePos.thru(gteOperand.sourcePos),
                    operand: gteOperand
                }

            case '#TokenType_Identifier':
                return {
                    key: Symbol(),
                    tag: '#Model_Identifier',
                    sourcePos,
                    name: sourcePos.getText(this.sourceCode)
                }

            case '#TokenType_Int64':
                return {
                    key: Symbol(),
                    tag: '#Model_BuiltInType_Int64',
                    sourcePos,
                }

            case '#TokenType_IntegerLiteral':
                return {
                    key: Symbol(),
                    tag: '#Model_Literal_Int64',
                    sourcePos,
                    value: +sourcePos.getText(this.sourceCode),// TODO: better parsing
                }

            // TODO
            // case '#TokenType_LeftBrace':
            //     return this.#parseSetExpression(token)

            case '#TokenType_LeftBracket':
                return this.#parseArrayLiteral(token)

            case '#TokenType_LeftParenthesis':
                return this.#parseParenthesizedExpression(token)

            case '#TokenType_LessThan':
                const ltOperand = this.parseExprWithBindingPower(0)
                return {
                    key: Symbol(),
                    tag: '#Model_TypeConstraint_LessThan',
                    sourcePos: sourcePos.thru(ltOperand.sourcePos),
                    operand: ltOperand
                }

            case '#TokenType_LessThanOrEquals':
                const lteOperand = this.parseExprWithBindingPower(0)
                return {
                    key: Symbol(),
                    tag: '#Model_TypeConstraint_LessThan',
                    sourcePos: sourcePos.thru(lteOperand.sourcePos),
                    operand: lteOperand
                }

            case '#TokenType_SingleQuotedString':
                return {
                    key: Symbol(),
                    tag: '#Model_Literal_String_SingleQuoted',
                    sourcePos: SourcePos.fromToken(token),
                    value: this.#getQuotedStringValue(sourcePos)
                }

            case '#TokenType_String':
                return {
                    key: Symbol(),
                    tag: '#Model_BuiltInType_String',
                    sourcePos: SourcePos.fromToken(token)
                }

            case '#TokenType_TripleBackTickedString':
                return {
                    key: Symbol(),
                    tag: '#Model_Literal_String_BackTickedBlock',
                    sourcePos,
                    value: this.#getTripleQuotedStringValue(sourcePos)
                }

            case '#TokenType_TripleDoubleQuotedString':
                return {
                    key: Symbol(),
                    tag: '#Model_Literal_String_DoubleQuotedBlock',
                    sourcePos,
                    value: this.#getTripleQuotedStringValue(sourcePos)
                }

            case '#TokenType_TripleSingleQuotedString':
                return {
                    key: Symbol(),
                    tag: '#Model_Literal_String_SingleQuotedBlock',
                    sourcePos,
                    value: this.#getTripleQuotedStringValue(sourcePos)
                }

            case '#TokenType_True':
                return {
                    key: Symbol(),
                    tag: '#Model_Literal_Boolean',
                    sourcePos,
                    value: true,
                }

            //	default:
            //	this.expectedType(
            //	LlaceTokenType.CHAR_LITERAL,
            //	LlaceTokenType.DASH,
            //	LlaceTokenType.IDENTIFIER,
            //	LlaceTokenType.INTEGER_LITERAL,
            //	LlaceTokenType.STRING_LITERAL
            //	)

        }

        throw Error("Unfinished parsing code: '" + token.tokenType + "'.")

    }

    #parseParenthesizedExpression(lParenToken: Token): Model {

        // Handle empty parentheses specially.
        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_RightParenthesis') {
            const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
            this.tokensIndex += 1
            const sourcePos = SourcePos.fromToken(lParenToken).thru(endSourcePos)
            return {
                key: Symbol(),
                tag: '#Model_Record',
                sourcePos,
                fields: []
            }
        }

        // Parse as a record if it starts out like one.
        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Identifier' &&
            this.#isTokenAfterRecordFieldName(this.tokens[this.tokensIndex + 1].tokenType)) {
            const fields = this.#parseFields()

            if (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightParenthesis') {
                throw Error("Expected ',' or ')'.")
            }

            const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
            this.tokensIndex += 1

            return {
                key: Symbol(),
                tag: '#Model_Record',
                sourcePos: SourcePos.fromToken(lParenToken).thru(endSourcePos),
                fields
            }
        }

        // Parse the expression inside the parentheses.
        const operand = this.parseExprWithBindingPower(0)

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightParenthesis') {
            throw Error("Expected " + '#TokenType_RightParenthesis')
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return {
            key: Symbol(),
            tag: '#Model_ParenthesizedExpr',
            sourcePos: SourcePos.fromToken(lParenToken).thru(endSourcePos),
            operand
        }

    }

    #parsePostfixExpression(leftOperand: Model, opToken: Token): Model {

        switch (opToken.tokenType) {

            case '#TokenType_LeftBracket':
                let rBrToken = this.tokens[this.tokensIndex]
                if (rBrToken.tokenType == '#TokenType_RightBracket') {
                    this.tokensIndex += 1
                    return {
                        key: Symbol(),
                        tag: '#Model_ArrayType',
                        sourcePos: leftOperand.sourcePos.thru(SourcePos.fromToken(rBrToken)),
                        baseType: leftOperand
                    }
                }

                const index = this.parseExprWithBindingPower(0)

                if (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightBracket') {
                    throw Error("Expected right bracket while parsing array index expression.")
                }

                rBrToken = this.tokens[this.tokensIndex]
                this.tokensIndex += 1

                return {
                    key: Symbol(),
                    tag: '#Model_ArrayIndexing',
                    sourcePos: leftOperand.sourcePos.thru(SourcePos.fromToken(rBrToken)),
                    baseExpression: leftOperand
                }

            case '#TokenType_LeftParenthesis':
                const rightOperand = this.#parseParenthesizedExpression(opToken)
                return {
                    key: Symbol(),
                    tag: '#Model_FunctionCallExpr',
                    sourcePos: leftOperand.sourcePos.thru(rightOperand.sourcePos),
                    leftOperand,
                    rightOperand
                }

            case '#TokenType_Otherwise':
                return {
                    key: Symbol(),
                    tag: '#Model_OtherwiseExpr',
                    sourcePos: leftOperand.sourcePos.thru(SourcePos.fromToken(opToken)),
                    operand: leftOperand
                }

            case '#TokenType_Question':
                return {
                    key: Symbol(),
                    tag: '#Model_OptionalExpr',
                    sourcePos: leftOperand.sourcePos.thru(SourcePos.fromToken(opToken)),
                    operand: leftOperand
                }

        }

        throw Error("Unfinished postfix parsing code: '" + opToken.tokenType + "'.")

    }

    #parseUnaryPrefixOperationExpression(
        token: Token
    ): UnaryOperationExpr {
        const bindingPower = prefixBindingPowers.get(token.tokenType)!
        const operand = this.parseExprWithBindingPower(bindingPower.right)
        return {
            tag: bindingPower.exprTag,
            key: Symbol(),
            sourcePos: SourcePos.fromToken(token).thru(operand.sourcePos),
            operand
        }
    }

}

//=====================================================================================================================
//=====================================================================================================================

/**
 * Captures the left binding power, right binding power, and corresponding expression tag for a given infix operator.
 */
type InfixBindingPower = {
    readonly left: number
    readonly right: number
    readonly exprTag: BinaryOperationExprTag
}

/**
 * Captures the right binding power and corresponding expression tag for a given prefix operator.
 */
type PrefixBindingPower = {
    readonly right: number
    readonly exprTag: UnaryOperationExprTag
}

/** Binding power pairs for infix operators. */
const infixBindingPowers = new Map<TokenType, InfixBindingPower>()

/** Binding powers for prefix operators. */
const prefixBindingPowers = new Map<TokenType, PrefixBindingPower>()

/** Binding powers for postfix operators. */
const postfixBindingPowers = new Map<TokenType, number>()

let level = 1

infixBindingPowers.set(
    '#TokenType_TildeArrow',
    {left: level, right: level + 1, exprTag: '#Model_TypeStateEffect'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_AmpersandAmpersand',
    {left: level, right: level + 1, exprTag: '#Model_IntersectLowPrecedenceExpr'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_VerticalBar',
    {left: level, right: level + 1, exprTag: '#Model_UnionExpr'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_Ampersand',
    {left: level, right: level + 1, exprTag: '#Model_IntersectExpr'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_Tilde',
    {left: level, right: level + 1, exprTag: '#Model_TypeState'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_When',
    {left: level, right: level + 1, exprTag: '#Model_WhenExpr'}
)
postfixBindingPowers.set('#TokenType_Otherwise', level)

level += 2

infixBindingPowers.set(
    '#TokenType_Or',
    {left: level, right: level + 1, exprTag: '#Model_LogicalOrExpr'}
)
infixBindingPowers.set(
    '#TokenType_Xor',
    {left: level, right: level + 1, exprTag: '#Model_LogicalXorExpr'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_And',
    {left: level, right: level + 1, exprTag: '#Model_LogicalAndExpr'}
)

level += 2

prefixBindingPowers.set(
    '#TokenType_Not',
    {right: level, exprTag: '#Model_LogicalNotExpr'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_EqualsEquals',
    {left: level, right: level + 1, exprTag: '#Model_EqualsExpr'}
)
infixBindingPowers.set(
    '#TokenType_ExclamationEquals',
    {left: level, right: level + 1, exprTag: '#Model_NotEqualsExpr'}
)
infixBindingPowers.set(
    '#TokenType_GreaterThan',
    {left: level, right: level + 1, exprTag: '#Model_GreaterThanExpr'}
)
infixBindingPowers.set(
    '#TokenType_GreaterThanOrEquals',
    {left: level, right: level + 1, exprTag: '#Model_GreaterThanOrEqualsExpr'}
)
infixBindingPowers.set(
    '#TokenType_LessThan',
    {left: level, right: level + 1, exprTag: '#Model_LessThanExpr'}
)
infixBindingPowers.set(
    '#TokenType_LessThanOrEquals',
    {left: level, right: level + 1, exprTag: '#Model_LessThanOrEqualsExpr'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_In',
    {left: level, right: level + 1, exprTag: '#Model_InExpr'}
)
infixBindingPowers.set(
    '#TokenType_Is',
    {left: level, right: level + 1, exprTag: '#Model_IsExpr'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_DotDot',
    {left: level, right: level + 1, exprTag: '#Model_RangeExpr'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_Dash',
    {left: level, right: level + 1, exprTag: '#Model_SubtractionExpr'}
)
infixBindingPowers.set(
    '#TokenType_Plus',
    {left: level, right: level + 1, exprTag: '#Model_AdditionExpr'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_Asterisk',
    {left: level, right: level + 1, exprTag: '#Model_MultiplicationExpr'}
)
infixBindingPowers.set(
    '#TokenType_Mod',
    {left: level, right: level + 1, exprTag: '#Model_ModuloExpr'}
)
infixBindingPowers.set(
    '#TokenType_Slash',
    {left: level, right: level + 1, exprTag: '#Model_DivisionExpr'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_AsteriskAsterisk',
    {left: level, right: level + 1, exprTag: '#Model_ExponentiationExpr'}
)

level += 2

prefixBindingPowers.set(
    '#TokenType_Dash',
    {right: level, exprTag: '#Model_NegationExpr'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_DashArrow',
    {left: level, right: level + 1, exprTag: '#Model_FunctionArrowExpr'}
)

level += 2

prefixBindingPowers.set(
    '#TokenType_AtSign',
    {right: level, exprTag: '#Model_AnnotationExpr'}
)

level += 2

infixBindingPowers.set(
    '#TokenType_Dot',
    {left: level, right: level + 1, exprTag: '#Model_FieldReferenceExpr'}
)

level += 2

prefixBindingPowers.set(
    '#TokenType_Hash',
    {right: level, exprTag: '#Model_TagExpr'}
)

level += 2

postfixBindingPowers.set('#TokenType_LeftParenthesis', level)
postfixBindingPowers.set('#TokenType_LeftBracket', level)
postfixBindingPowers.set('#TokenType_Question', level)

//=====================================================================================================================

