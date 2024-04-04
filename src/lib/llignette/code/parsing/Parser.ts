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
    InjectedRecord,
    Model, ModelTag,
    Module,
    RecordEntry,
    UnaryOperationExpr,
    UnaryOperationExprTag
} from "./Model";
import {isRecord, type StringLiteral, type StringLiteralTag} from "./Model";
import type {Token} from "../scanning/Token";
import {getSourcePos} from "../scanning/Token";
import {SourcePos} from "../util/SourcePos";
import {isNone, none, type Optional, some} from "../../util/Optional";
import type {TokenType} from "../scanning/TokenType";

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

    readonly newLineOffsets: number[]
    private readonly sourceCode: string
    private readonly tokens: Token[]
    private tokensIndex: number

    constructor(scanResult: ScanningOutcome) {
        this.newLineOffsets = scanResult.newLineOffsets
        this.sourceCode = scanResult.sourceCode
        this.tokens = scanResult.tokens
        this.tokensIndex = 0
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

    /**
     * Parses one whole source file.
     */
    parseModule(): Module {

        const entries: RecordEntry[] = this.#parseRecordEntries()

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_Eof') {
            this.#addError("Expected end of file")
        }

        return {
            tag: '#Model_Module',
            key: Symbol(),
            sourcePos: entries[0].sourcePos.thru(entries[entries.length - 1].sourcePos),
            entries
        }

    }

    ///////////////////////////////////////////////////////////////////////////

    /**
     * Adds an error message with source position taken from the current token
     * of the parse.
     * @param message the error message
     */
    #addError(message: string): never {
        const sourcePos = getSourcePos(this.tokens[this.tokensIndex])
        this.#addErrorAtPos(message, sourcePos)
    }

    /**
     * Adds an error message with given source position.
     * @param message the error message
     * @param sourcePos the source position
     * @private
     */
    #addErrorAtPos(message: string, sourcePos: SourcePos): never {
        const lineCol = sourcePos.toLineAndColumn(this.newLineOffsets)

        // TODO: accumulate errors; support recovery

        throw Error(`${message} at (${lineCol.line},${lineCol.column}).`)
    }

    /**
     * Adds an error message with source position taken from a given token
     * of the parse.
     * @param message the error message
     * @param token the token where the error applies
     */
    #addErrorAtToken(message: string, token: Token): never {
        const sourcePos = getSourcePos(token)
        this.#addErrorAtPos(message, sourcePos)
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

    /**
     * tests whether the given token can come after a field name in a structure.
     * @param tokenType the type of token
     */
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

    /**
     * Parses an array literal just after consuming the opening left bracket.
     * @param lBracketToken the left bracket token (used for source position)
     */
    #parseArrayLiteral(lBracketToken: Token): Model {

        const startSourcePos = getSourcePos(lBracketToken)
        const elements: Model[] = []

        // Handle an empty array specifically.
        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_RightBracket') {
            const endSourcePos = getSourcePos(this.tokens[this.tokensIndex])
            this.tokensIndex += 1
            return {
                key: Symbol(),
                tag: '#Model_ArrayLiteral',
                sourcePos: startSourcePos.thru(endSourcePos),
                elements
            }
        }

        // Loop through the array elements.
        while (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightBracket') {
            // Parse one expression.
            elements.push(this.parseExprWithBindingPower(0))

            if (this.tokens[this.tokensIndex].tokenType != '#TokenType_Comma') {
                break
            }

            this.tokensIndex += 1
        }

        // Must end with a right bracket.
        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightBracket') {
            this.#addError("Expected right bracket.")
        }

        const endSourcePos = getSourcePos(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return {
            key: Symbol(),
            tag: '#Model_ArrayLiteral',
            sourcePos: startSourcePos.thru(endSourcePos),
            elements
        }

    }

    /**
     * Parses one field in a structure.
     */
    #parseField(): Field {

        const startSourcePos = getSourcePos(this.tokens[this.tokensIndex])

        const fieldName: Identifier = this.#parseIdentifier()
        let endSourcePos = fieldName.sourcePos

        let documentation: Optional<StringLiteral> = none()
        let typeExpr: Optional<Model> = none()

        // Parse the documentation and type in either order.
        while (true) {
            if (this.tokens[this.tokensIndex].tokenType == '#TokenType_ColonColon' && isNone(documentation)) {
                this.tokensIndex += 1
                switch (this.tokens[this.tokensIndex].tokenType) {
                    case '#TokenType_BackTick':
                        this.tokensIndex += 1
                        documentation = some(this.#parseString(startSourcePos, '#TokenType_BackTick', '#Model_Literal_String_BackTicked'))
                        break
                    case '#TokenType_DoubleQuote':
                        this.tokensIndex += 1
                        documentation = some(this.#parseString(startSourcePos, '#TokenType_DoubleQuote', '#Model_Literal_String_DoubleQuoted'))
                        break
                    case '#TokenType_SingleQuote':
                        this.tokensIndex += 1
                        documentation = some(this.#parseString(startSourcePos, '#TokenType_SingleQuote', '#Model_Literal_String_DoubleQuoted'))
                        break
                    case '#TokenType_TripleBackTick':
                        this.tokensIndex += 1
                        documentation = some(this.#parseString(startSourcePos, '#TokenType_TripleBackTick', '#Model_Literal_String_TripleBackTicked'))
                        break
                    case '#TokenType_TripleDoubleQuote':
                        this.tokensIndex += 1
                        documentation = some(this.#parseString(startSourcePos, '#TokenType_TripleDoubleQuote', '#Model_Literal_String_TripleDoubleQuote'))
                        break
                    case '#TokenType_TripleSingleQuote':
                        this.tokensIndex += 1
                        documentation = some(this.#parseString(startSourcePos, '#TokenType_TripleSingleQuote', '#Model_Literal_String_TripleSingleQuoted'))
                        break
                    default:
                        this.#addError("Expected documentation string")
                }
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
     * Parses a function declaration after consuming the opening 'fn' token.
     * @param fnToken the 'fn' token that starts the declaration.
     */
    #parseFunctionDeclaration(fnToken: Token): FunctionDeclaration {
        const lParenToken = this.tokens[this.tokensIndex]

        if (lParenToken.tokenType != '#TokenType_LeftParenthesis') {
            this.#addError("Expected left parenthesis")
        }

        this.tokensIndex += 1

        const argumentRecord = this.#parseParenthesizedExpression(lParenToken)

        if (!isRecord(argumentRecord)) {
            this.#addErrorAtPos("Expected argument list", argumentRecord.sourcePos)
        }

        let returnType: Optional<Model> = none()

        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_DashArrow') {
            this.tokensIndex += 1
            returnType = some(this.parseExprWithBindingPower(0))
        }

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_EqualsArrow') {
            this.#addError("Expected double arrow")
        }

        this.tokensIndex += 1

        const body = this.parseExprWithBindingPower(0)

        return {
            key: Symbol(),
            tag: '#Model_FunctionDeclaration',
            sourcePos: getSourcePos(fnToken).thru(body.sourcePos),
            argumentRecord,
            returnType,
            body
        }
    }

    /**
     * Parses one identifier.
     */
    #parseIdentifier(): Identifier {

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_Identifier') {
            this.#addError("Expected field name (identifier).")
        }

        const sourcePos = getSourcePos(this.tokens[this.tokensIndex])
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
     * Parses an infix expression after the left hand side and the operator token have been consumed.
     * @param leftOperand the already parsed left hand side expression
     * @param bindingPower the binding power of the operator
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

    /**
     * Parses an injected record ( '...' expression ) after recognizing (but not consuming)
     * the '...' token.
     */
    #parseInjectedRecord(): InjectedRecord {

        const startToken = this.tokens[this.tokensIndex]
        this.tokensIndex += 1

        const injectedValue = this.parseExprWithBindingPower(0)

        return {
            key: Symbol(),
            tag: '#Model_InjectedRecord',
            sourcePos: getSourcePos(startToken).thru(injectedValue.sourcePos),
            injectedValue
        }

    }

    /**
     * Parses an expression up to the first binary operator found (or the end of the expression).
     */
    #parseLeftHandSide(): Model {

        const token = this.tokens[this.tokensIndex]
        this.tokensIndex += 1

        const sourcePos = getSourcePos(token)

        switch (token.tokenType) {

            case '#TokenType_AtSign':
            case '#TokenType_Dash':
            case '#TokenType_Hash':
            case '#TokenType_Not':
                return this.#parseUnaryPrefixOperationExpression(token)

            case '#TokenType_BackTick':
                return this.#parseString(sourcePos, '#TokenType_BackTick', '#Model_Literal_String_BackTicked')

            case '#TokenType_Boolean':
                return {
                    key: Symbol(),
                    tag: '#Model_BuiltInType_Boolean',
                    sourcePos,
                }

            case '#TokenType_DoubleQuote':
                return this.#parseString(sourcePos, '#TokenType_DoubleQuote', '#Model_Literal_String_DoubleQuoted')

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

            case '#TokenType_SingleQuote':
                return this.#parseString(sourcePos, '#TokenType_SingleQuote', '#Model_Literal_String_SingleQuoted')

            case '#TokenType_String':
                return {
                    key: Symbol(),
                    tag: '#Model_BuiltInType_String',
                    sourcePos: getSourcePos(token)
                }

            case '#TokenType_TripleBackTick':
                return this.#parseString(sourcePos, '#TokenType_TripleBackTick', '#Model_Literal_String_TripleBackTicked')

            case '#TokenType_TripleDoubleQuote':
                return this.#parseString(sourcePos, '#TokenType_TripleDoubleQuote', '#Model_Literal_String_TripleDoubleQuote')

            case '#TokenType_TripleSingleQuote':
                return this.#parseString(sourcePos, '#TokenType_TripleSingleQuote', '#Model_Literal_String_TripleSingleQuoted')

            case '#TokenType_True':
                return {
                    key: Symbol(),
                    tag: '#Model_Literal_Boolean',
                    sourcePos,
                    value: true,
                }

        }

        this.#addErrorAtToken("Expected the start of an expression: '" + token.tokenType + "'", token)

    }

    /**
     * Parses a parenthesized expression after consuming the opening parenthesis.
     * @param lParenToken the left parenthesis token already consumed
     */
    #parseParenthesizedExpression(lParenToken: Token): Model {

        // Handle empty parentheses specially.
        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_RightParenthesis') {
            const endSourcePos = getSourcePos(this.tokens[this.tokensIndex])
            this.tokensIndex += 1
            const sourcePos = getSourcePos(lParenToken).thru(endSourcePos)
            return {
                key: Symbol(),
                tag: '#Model_Record',
                sourcePos,
                entries: []
            }
        }

        // Parse as a record if it starts out with a field name and qualifier.
        const lookAheadIsField = this.tokens[this.tokensIndex].tokenType == '#TokenType_Identifier' &&
            this.#isTokenAfterRecordFieldName(this.tokens[this.tokensIndex + 1].tokenType)
        const lookAheadIsInjection = this.tokens[this.tokensIndex].tokenType == '#TokenType_DotDotDot'

        if (lookAheadIsField || lookAheadIsInjection) {
            const entries = this.#parseRecordEntries()

            if (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightParenthesis') {
                this.#addError("Expected ',' or ')'.")
            }

            const endSourcePos = getSourcePos(this.tokens[this.tokensIndex])
            this.tokensIndex += 1

            return {
                key: Symbol(),
                tag: '#Model_Record',
                sourcePos: getSourcePos(lParenToken).thru(endSourcePos),
                entries
            }
        }

        // Parse the expression inside the parentheses.
        const operand = this.parseExprWithBindingPower(0)

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightParenthesis') {
            this.#addError("Expected " + '#TokenType_RightParenthesis')
        }

        const endSourcePos = getSourcePos(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return {
            key: Symbol(),
            tag: '#Model_ParenthesizedExpr',
            sourcePos: getSourcePos(lParenToken).thru(endSourcePos),
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
                        sourcePos: leftOperand.sourcePos.thru(getSourcePos(rBrToken)),
                        baseType: leftOperand
                    }
                }

                const index = this.parseExprWithBindingPower(0)

                if (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightBracket') {
                    this.#addError("Expected right bracket while parsing array index expression.")
                }

                rBrToken = this.tokens[this.tokensIndex]
                this.tokensIndex += 1

                return {
                    key: Symbol(),
                    tag: '#Model_ArrayIndexing',
                    sourcePos: leftOperand.sourcePos.thru(getSourcePos(rBrToken)),
                    baseExpression: leftOperand,
                    index
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
                    sourcePos: leftOperand.sourcePos.thru(getSourcePos(opToken)),
                    operand: leftOperand
                }

            case '#TokenType_Question':
                return {
                    key: Symbol(),
                    tag: '#Model_OptionalExpr',
                    sourcePos: leftOperand.sourcePos.thru(getSourcePos(opToken)),
                    operand: leftOperand
                }

        }

        this.#addErrorAtToken("Unfinished postfix parsing code: '" + opToken.tokenType + "'.", opToken)

    }

    #parseRecordEntries(): RecordEntry[] {

        let entries: RecordEntry[] = []

        // First entry.
        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Identifier') {
            entries.push(this.#parseField())
        } else if (this.tokens[this.tokensIndex].tokenType == '#TokenType_DotDotDot') {
            entries.push(this.#parseInjectedRecord())
        } else {
            this.#addError("Expected field declaration or record injection.")
        }

        // Subsequent entries.
        while (true) {
            // Subsequent entry after a comma.
            if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Comma') {
                this.tokensIndex += 1
                if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Identifier') {
                    entries.push(this.#parseField())
                    continue
                }
                if (this.tokens[this.tokensIndex].tokenType == '#TokenType_DotDotDot') {
                    entries.push(this.#parseInjectedRecord())
                    continue
                }
            }

            // Subsequent field name after an intervening new line.
            else if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Identifier') {
                const betweenTokensStart = this.tokens[this.tokensIndex - 1].sourceOffset +
                    this.tokens[this.tokensIndex - 1].sourceLength
                const betweenTokensEnd = this.tokens[this.tokensIndex].sourceOffset

                const betweenTokens = this.sourceCode.substring(betweenTokensStart, betweenTokensEnd)
                if (betweenTokens.split("\n").length > 1) {
                    entries.push(this.#parseField())
                    continue
                }
            }

                // Subsequent injected value after an intervening new line.
            // TODO: annotation, identifier interpolation
            else if (this.tokens[this.tokensIndex].tokenType == '#TokenType_DotDotDot') {
                const betweenTokensStart = this.tokens[this.tokensIndex - 1].sourceOffset +
                    this.tokens[this.tokensIndex - 1].sourceLength
                const betweenTokensEnd = this.tokens[this.tokensIndex].sourceOffset

                const betweenTokens = this.sourceCode.substring(betweenTokensStart, betweenTokensEnd)
                if (betweenTokens.split("\n").length > 1) {
                    entries.push(this.#parseInjectedRecord())
                    continue
                }
            }

            break
        }

        return entries

    }

    #parseString(startPos: SourcePos, delimiterType: TokenType, modelTag: StringLiteralTag): StringLiteral {
        const fragments = this.#parseStringFragments(delimiterType)
        return {
            key: Symbol(),
            tag: modelTag,
            sourcePos: startPos.thru(getSourcePos(this.tokens[this.tokensIndex - 1])),
            fragments
        }
    }

    #parseStringFragments(closingTokenType: TokenType): Model[] {
        const result: Model[] = []

        let moreToParse = true
        while (moreToParse) {
            const token = this.tokens[this.tokensIndex]
            this.tokensIndex += 1

            const sourcePos = getSourcePos(token)

            switch (token.tokenType) {
                case '#TokenType_StringFragment': {
                    let value = sourcePos.getText(this.sourceCode)
                    result.push({
                        tag: '#Model_Literal_StringFragment',
                        key: Symbol(),
                        sourcePos,
                        value
                    })
                    break
                }

                case '#TokenType_LeftGuillemot': {
                    result.push(this.parseExprWithBindingPower(0))

                    if (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightGuillemot') {
                        this.#addError("Expected right guillemot or mustache")
                    }
                    this.tokensIndex += 1
                    break
                }

                case closingTokenType:
                    moreToParse = false
                    break

                default:
                    this.#addErrorAtToken("Expected string fragment or interpolation", token)
                    moreToParse = false
                    break
            }
        }

        return result
    }

    #parseUnaryPrefixOperationExpression(
        token: Token
    ): UnaryOperationExpr {
        const bindingPower = prefixBindingPowers.get(token.tokenType)!
        const operand = this.parseExprWithBindingPower(bindingPower.right)
        return {
            tag: bindingPower.exprTag,
            key: Symbol(),
            sourcePos: getSourcePos(token).thru(operand.sourcePos),
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

