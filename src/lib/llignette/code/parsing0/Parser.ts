//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {BinaryOperationExprTag, Expr, CompositeExpr, UnaryOperationExprTag} from "./Expressions"
import type {ScanningOutcome as PriorOutcome} from "../scanning/Scanner"
import type {Token} from "../scanning/Token"
import type {TokenType} from "../scanning/TokenType"
import {SourcePos} from "../util/SourcePos"
import {type CompositeExprTag, isCompositeExpr} from "./Expressions"
import {type CompositeTree} from "../../graphs/CompositeTree";
import {MutableCompositeTree} from "../../graphs/impl/MutableCompositeTree";

//=====================================================================================================================

/**
 * Edge properties for the parent-child relationship.
 */
export type ChildIndex = {
    /** The order of a child within its parent. */
    readonly index: number
}

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
    readonly model: Expr,

    /** Tree structure defining the AST. */
    readonly _parent_child_: CompositeTree<CompositeExpr, Expr, ChildIndex>
}

//=====================================================================================================================

/**
 * Generates a JSON representation of the AST for debugging purposes.
 * @param parseResult the outcome of parsing
 */
export function toJson(parseResult: ParsingOutcome): string {
    return JSON.stringify(toJsonRec(parseResult.model, parseResult._parent_child_), null, 2)
}

//=====================================================================================================================

/**
 * Recursively generates a JSON representation of the AST for debugging purposes.
 * @param model the AST node to start from
 * @param _parent_child_ the graph of parent-child links
 */
function toJsonRec(model: Expr, _parent_child_: CompositeTree<CompositeExpr, Expr, ChildIndex>): object {

    if (isCompositeExpr(model)) {
        let children: object[] = []
        _parent_child_.forEachOutJoinedVertex(v => children.push(toJsonRec(v, _parent_child_)))(model)

        // TODO instead: fluent API
        // let children = _parent_child_.forEachHeadVertex().joinedFromVertex(model).map(
        //     v => toJsonRec(v, _parent_child_)
        // )

        return {...model, children}
    }

    return {...model}
}

//=====================================================================================================================

/**
 * Generates an S-Expression representation of the AST for debugging purposes.
 * @param parseResult the outcome of parsing
 */
export function toSExpression(parseResult: ParsingOutcome): string {
    return toSExpressionRec(parseResult.model, parseResult._parent_child_, "")
}

//=====================================================================================================================

/**
 * Recursively generates a JSON representation of the AST for debugging purposes.
 * @param model the AST node to start from
 * @param _parent_child_ the graph of parent-child links
 * @param indent the characters of indentation for the current level
 */
function toSExpressionRec(model: Expr, _parent_child_: CompositeTree<CompositeExpr, Expr, ChildIndex>, indent: string): string {

    let result = getBaseSExpression(model, indent)

    if (isCompositeExpr(model)) {
        _parent_child_.forEachOutJoinedVertex(
            v => result = result + toSExpressionRec(v, _parent_child_, indent + "  ")
        )(model)

        // TODO instead: fluent API
        // let children = _parent_child_.forEachHeadVertex().joinedFromVertex(model).map(
        //     v => . . .
        // )
    }

    return result
}

function getBaseSExpression(model: Expr, indent: string) {
    let result = `${model.sourcePos.startOffset}..${model.sourcePos.endOffset}:`.padEnd(12," ")

    result += indent
    result += `${model.tag}`

    switch (model.tag) {
        case '#BooleanLiteralExpr':
            result += ` ${model.value}`
            break
        case '#Int64LiteralExpr':
            result += ` ${model.value}`
            break
        case '#Float64LiteralExpr':
            result += ` ${model.value}`
            break
        case '#IdentifierExpr':
            result += ` ${model.name}`
            break
        case '#SingleQuotedStringExpr':
            result += ` '${model.value}'`
            break
        case '#DoubleQuotedStringExpr':
            result += ` "${model.value}"`
            break
        case '#BackTickedStringExpr':
            result += "\\`" + `${model.value}` + "`"
            break
        case '#SingleQuotedStringBlockExpr':
        case '#DoubleQuotedStringBlockExpr':
        case '#BackTickedStringBlockExpr':
            result += ` ${model.value}`
            break
        case '#LeadingDocumentationExpr':
        case '#TrailingDocumentationExpr':
            result += ` ${model.text}`
            break
    }

    return result + "\n"
}

//=====================================================================================================================

/**
 * Parses a top level expression from a scan result.
 * @param scanResult the tokens from the scanner.
 */
export function parseExpression(scanResult: PriorOutcome): ParsingOutcome {

    const _parent_child_ = new MutableCompositeTree<CompositeExpr, Expr, ChildIndex>()

    const parser = new Parser(scanResult, _parent_child_)

    const model = parser.parseExprBindingPower(0)

    return {
        sourceCode: scanResult.sourceCode,
        newLineOffsets: scanResult.newLineOffsets,
        model,
        _parent_child_: _parent_child_.freeze()
    }

}

//---------------------------------------------------------------------------------------------------------------------

// TODO: ParseTopLevel
// ParseParenthesizedItems parses a non-empty sequence of code expected to be the items within a record literal, e.g.
// the top level of a file.
//func ParseParenthesizedItems(sourceCode string, tokens []: Token) : Expr {
//	parser = newParser(sourceCode, tokens)
//
//	return parser.parseParenthesizedExpression(tokens[0], '#TokenType_Eof)
//}

//=====================================================================================================================

class Parser {
    private readonly _parent_child_: MutableCompositeTree<CompositeExpr, Expr, ChildIndex>
    private readonly sourceCode: string
    private readonly tokens: Token[]
    private tokensIndex: number

    constructor(scanResult: PriorOutcome, _parent_child_: MutableCompositeTree<CompositeExpr, Expr, ChildIndex>) {
        this._parent_child_ = _parent_child_
        this.sourceCode = scanResult.sourceCode
        this.tokens = scanResult.tokens
        this.tokensIndex = 0
    }

    /**
     * Parses an expression, continuing until encountering an operation with binding power greater than the given value.
     * @param minBindingPower operations with binding power greater than this threshold signal the start of a larger
     *                        parent expression with the so-far parsed expression as its left hand side.
     */
    parseExprBindingPower(minBindingPower: number): Expr {

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

    #getBackTickedStringValue(sourcePos: SourcePos) {
        const lines = sourcePos.getText(this.sourceCode).split('\n')
        let value = ""
        for (let line of lines) {
            value += line.substring(line.indexOf("`") + 1).trimEnd()
        }
        return value
    }

    #getQuotedStringValue(sourcePos: SourcePos) {
        let value = sourcePos.getText(this.sourceCode)
        value = value.substring(1, value.length - 1)
        // TODO: convert escape sequences
        return value
    }

    /**
     * Constructs an expression from given attributes and establishes its operands in the AST.
     * @param tag the type of expression.
     * @param sourcePos the source code range containing the expression
     * @param operands the operands of the expression
     * @private
     */
    #makeOperationExpr(
        tag: CompositeExprTag,
        sourcePos: SourcePos,
        operands: Expr[]
    ): CompositeExpr {
        const result: CompositeExpr = {
            key: Symbol(),
            tag,
            sourcePos
        }

        operands.forEach((operand, index) => {
            this._parent_child_.join(result, operand, {index})
        })

        return result
    }

    #parseArrayLiteral(token: Token): Expr {

        const startSourcePos = SourcePos.fromToken(token)
        const operands: Expr[] = []

        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_RightBracket') {
            const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
            this.tokensIndex += 1
            return this.#makeOperationExpr(
                '#ArrayLiteralExpr',
                startSourcePos.thru(endSourcePos),
                operands
            )
        }

        while (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightBracket') {
            // Parse one expression.
            operands.push(this.parseExprBindingPower(0))

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

        return this.#makeOperationExpr(
            '#ArrayLiteralExpr',
            startSourcePos.thru(endSourcePos),
            operands
        )

    }

    #parseFunctionArgumentsExpression(
        token: Token,
    ): Expr {

        const operands: Expr[] = []

        while (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightParenthesis') {
            // Parse one expression.
            operands.push(this.parseExprBindingPower(0))

            if (this.tokens[this.tokensIndex].tokenType != '#TokenType_Comma') {
                break
            }
            this.tokensIndex += 1
        }

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightParenthesis') {
            throw Error("Expected right parenthesis.")
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return this.#makeOperationExpr(
            '#FunctionArgumentsExpr',
            SourcePos.fromToken(token).thru(endSourcePos),
            operands
        )

    }

    /**
     * Parses an infix expression after the left hand side and the operator token have been consumed.
     */
    #parseInfixOperation(
        lhs: Expr,
        bindingPower: InfixBindingPower
    ): Expr {
        const rhs = this.parseExprBindingPower(bindingPower.right)
        const sourcePos = lhs.sourcePos.thru(rhs.sourcePos)

        return this.#makeOperationExpr(bindingPower.exprTag, sourcePos, [lhs, rhs])
    }

    #parseLeftHandSide(): Expr {

        const token = this.tokens[this.tokensIndex]
        this.tokensIndex += 1

        const sourcePos = SourcePos.fromToken(token)

        switch (token.tokenType) {

            case '#TokenType_AtSign':
            case '#TokenType_Dash':
            case '#TokenType_Hash':
            case '#TokenType_Not':
                return this.#parseUnaryOperationExpression(token)

            case '#TokenType_BackTickedString':
                return {
                    key: Symbol(),
                    tag: '#BackTickedStringBlockExpr',
                    sourcePos,
                    value: this.#getBackTickedStringValue(sourcePos)
                }

            case '#TokenType_Boolean':
                return {
                    key: Symbol(),
                    tag: '#BuiltInTypeBooleanExpr',
                    sourcePos,
                }

            case '#TokenType_DoubleQuotedString':
                return {
                    key: Symbol(),
                    tag: '#DoubleQuotedStringExpr',
                    sourcePos,
                    value: this.#getQuotedStringValue(sourcePos)
                }

            case '#TokenType_False':
                return {
                    key: Symbol(),
                    tag: '#BooleanLiteralExpr',
                    sourcePos,
                    value: false,
                }

            case '#TokenType_Float64':
                return {
                    key: Symbol(),
                    tag: '#BuiltInTypeFloat64Expr',
                    sourcePos,
                }

            case '#TokenType_FloatingPointLiteral':
                return {
                    key: Symbol(),
                    tag: '#Float64LiteralExpr',
                    sourcePos,
                    value: +sourcePos.getText(this.sourceCode),// TODO: better parsing
                }

            case '#TokenType_Identifier':
                return {
                    key: Symbol(),
                    tag: '#IdentifierExpr',
                    sourcePos,
                    name: sourcePos.getText(this.sourceCode)
                }

            case '#TokenType_Int64':
                return {
                    key: Symbol(),
                    tag: '#BuiltInTypeInt64Expr',
                    sourcePos,
                }

            case '#TokenType_IntegerLiteral':
                return {
                    key: Symbol(),
                    tag: '#Int64LiteralExpr',
                    sourcePos,
                    value: +sourcePos.getText(this.sourceCode),// TODO: better parsing
                }

            case '#TokenType_LeftBrace':
                return this.#parseRecordExpression(token)

            case '#TokenType_LeftBracket':
                return this.#parseArrayLiteral(token)

            case '#TokenType_LeftParenthesis':
                return this.#parseParenthesizedExpression(token)

            case '#TokenType_SingleQuotedString':
                return {
                    key: Symbol(),
                    tag: '#SingleQuotedStringExpr',
                    sourcePos: SourcePos.fromToken(token),
                    value: this.#getQuotedStringValue(sourcePos)
                }

            case '#TokenType_String':
                return {
                    key: Symbol(),
                    tag: '#BuiltInTypeStringExpr',
                    sourcePos: SourcePos.fromToken(token)
                }

            case '#TokenType_True':
                return {
                    key: Symbol(),
                    tag: '#BooleanLiteralExpr',
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

    #parseParenthesizedExpression(
        token: Token,
    ): Expr {

        // Handle empty parentheses specially.
        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_RightParenthesis') {
            const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
            this.tokensIndex += 1
            const sourcePos = SourcePos.fromToken(token).thru(endSourcePos)
            return this.#makeOperationExpr(
                '#ParenthesizedExpr',
                sourcePos,
                [{key: Symbol(), tag: '#EmptyExpr', sourcePos}]
            )
        }

        // Parse the expression inside the parentheses
        const inner = this.parseExprBindingPower(0)

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightParenthesis') {
            throw Error("Expected " + '#TokenType_RightParenthesis')
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return this.#makeOperationExpr(
            '#ParenthesizedExpr',
            SourcePos.fromToken(token).thru(endSourcePos),
            [inner]
        )

    }

    #parsePostfixExpression(lhs: Expr, opToken: Token): Expr {

        switch (opToken.tokenType) {

            case '#TokenType_LeftParenthesis':
                const rhs = this.#parseFunctionArgumentsExpression(opToken)
                return this.#makeOperationExpr(
                    '#FunctionCallExpr',
                    lhs.sourcePos.thru(rhs.sourcePos),
                    [lhs, rhs]
                )

            case '#TokenType_Question':
                return this.#makeOperationExpr(
                    '#OptionalExpr',
                    lhs.sourcePos,
                    [lhs]
                )

        }

        throw Error("Unfinished postfix parsing code: '" + opToken.tokenType + "'.")

    }

    #parseRecordExpression(
        token: Token,
    ): Expr {

        const operands: Expr[] = []

        while (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightBrace') {
            // Parse one expression.
            operands.push(this.parseExprBindingPower(0))

            if (this.tokens[this.tokensIndex].tokenType != '#TokenType_Comma') {
                break
            }

            this.tokensIndex += 1
        }

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_RightBrace') {
            throw Error("Expected right brace.")
        }

        const endSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return this.#makeOperationExpr(
            '#RecordExpr',
            SourcePos.fromToken(token).thru(endSourcePos),
            operands
        )

    }

    #parseUnaryOperationExpression(
        token: Token
    ): Expr {
        const bindingPower = prefixBindingPowers.get(token.tokenType)!
        const rhs = this.parseExprBindingPower(bindingPower.right)
        return this.#makeOperationExpr(
            bindingPower.exprTag,
            SourcePos.fromToken(token),
            [rhs]
        )
    }

}

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

infixBindingPowers.set('#TokenType_Colon', {left: level, right: level + 1, exprTag: '#QualificationExpr'})
infixBindingPowers.set('#TokenType_Equals', {left: level, right: level + 1, exprTag: '#IntersectAssignValueExpr'})
infixBindingPowers.set('#TokenType_QuestionColon', {
    left: level,
    right: level + 1,
    exprTag: '#IntersectDefaultValueExpr'
})

level += 2

infixBindingPowers.set('#TokenType_AmpersandAmpersand', {
    left: level,
    right: level + 1,
    exprTag: '#IntersectLowPrecedenceExpr'
})

level += 2

infixBindingPowers.set('#TokenType_VerticalBar', {left: level, right: level + 1, exprTag: '#UnionExpr'})

level += 2

infixBindingPowers.set('#TokenType_Ampersand', {left: level, right: level + 1, exprTag: '#IntersectExpr'})

level += 2

infixBindingPowers.set('#TokenType_When', {left: level, right: level + 1, exprTag: '#WhenExpr'})
infixBindingPowers.set('#TokenType_Where', {left: level, right: level + 1, exprTag: '#WhereExpr'})

level += 2

infixBindingPowers.set('#TokenType_Or', {left: level, right: level + 1, exprTag: '#LogicalOrExpr'})

level += 2

infixBindingPowers.set('#TokenType_And', {left: level, right: level + 1, exprTag: '#LogicalAndExpr'})

level += 2

prefixBindingPowers.set('#TokenType_Not', {right: level, exprTag: '#LogicalNotExpr'})

level += 2

infixBindingPowers.set('#TokenType_EqualsEquals', {left: level, right: level + 1, exprTag: '#EqualsExpr'})
infixBindingPowers.set('#TokenType_ExclamationEquals', {left: level, right: level + 1, exprTag: '#NotEqualsExpr'})
infixBindingPowers.set('#TokenType_GreaterThan', {left: level, right: level + 1, exprTag: '#GreaterThanExpr'})
infixBindingPowers.set('#TokenType_GreaterThanOrEquals', {
    left: level,
    right: level + 1,
    exprTag: '#GreaterThanOrEqualsExpr'
})
infixBindingPowers.set('#TokenType_LessThan', {left: level, right: level + 1, exprTag: '#LessThanExpr'})
infixBindingPowers.set('#TokenType_LessThanOrEquals', {
    left: level,
    right: level + 1,
    exprTag: '#LessThanOrEqualsExpr'
})

level += 2

infixBindingPowers.set('#TokenType_In', {left: level, right: level + 1, exprTag: '#InExpr'})
infixBindingPowers.set('#TokenType_Is', {left: level, right: level + 1, exprTag: '#IsExpr'})
infixBindingPowers.set('#TokenType_EqualsTilde', {left: level, right: level + 1, exprTag: '#MatchExpr'})
infixBindingPowers.set('#TokenType_ExclamationTilde', {left: level, right: level + 1, exprTag: '#NotMatchExpr'})

level += 2

infixBindingPowers.set('#TokenType_DotDot', {left: level, right: level + 1, exprTag: '#RangeExpr'})

level += 2

infixBindingPowers.set('#TokenType_Dash', {left: level, right: level + 1, exprTag: '#SubtractionExpr'})
infixBindingPowers.set('#TokenType_Plus', {left: level, right: level + 1, exprTag: '#AdditionExpr'})

level += 2

infixBindingPowers.set('#TokenType_Asterisk', {left: level, right: level + 1, exprTag: '#MultiplicationExpr'})
infixBindingPowers.set('#TokenType_Slash', {left: level, right: level + 1, exprTag: '#DivisionExpr'})

level += 2

prefixBindingPowers.set('#TokenType_Dash', {right: level, exprTag: '#NegationExpr'})

level += 2

infixBindingPowers.set('#TokenType_DashArrow', {left: level, right: level + 1, exprTag: '#FunctionArrowExpr'})

level += 2

prefixBindingPowers.set('#TokenType_AtSign', {right: level, exprTag: '#AnnotationExpr'})

level += 2

infixBindingPowers.set('#TokenType_Dot', {left: level, right: level + 1, exprTag: '#FieldReferenceExpr'})

level += 2

prefixBindingPowers.set('#TokenType_Hash', {right: level, exprTag: '#TagExpr'})

level += 2

postfixBindingPowers.set('#TokenType_LeftParenthesis', level)
postfixBindingPowers.set('#TokenType_LeftBracket', level)
postfixBindingPowers.set('#TokenType_Question', level)

//=====================================================================================================================
