//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

import type {ScanningOutcome} from "../scanning/Scanner"
import type {Field, Identifier, Model, Module} from "./Model";
import type {Token} from "../scanning/Token";
import {SourcePos} from "../util/SourcePos";
import {none, type Optional, some} from "../../util/Optional";

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
            sourcePos: fields[0].sourcePos.thru(fields[fields.length-1].sourcePos),
            fields
        }

    }

    #parseExpression(): Model {

        if (this.tokens[this.tokensIndex].tokenType != '#TokenType_False') {
            throw Error("Much to do")
        }

        const sourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])
        this.tokensIndex += 1

        return {
            tag: '#Model_BooleanLiteral',
            key: Symbol(),
            sourcePos,
            value: false
        }

    }

    /**
     * Parses one field in a structure.
     */
    #parseField(): Field {

        const startSourcePos = SourcePos.fromToken(this.tokens[this.tokensIndex])

        const fieldName: Identifier = this.#parseIdentifier()
        let endSourcePos = fieldName.sourcePos

        let typeExpr: Optional<Model> = none()
        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Colon') {
            this.tokensIndex += 1
            const expr: Model = this.#parseExpression()
            endSourcePos = expr.sourcePos
            typeExpr = some(expr)
        }

        let valueExpr: Optional<Model> = none()
        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_Equals') {
            this.tokensIndex += 1
            const expr: Model = this.#parseExpression()
            endSourcePos = expr.sourcePos
            valueExpr = some(expr)
        }

        let defaultValueExpr: Optional<Model> = none()
        if (this.tokens[this.tokensIndex].tokenType == '#TokenType_QuestionQuestionEquals') {
            this.tokensIndex += 1
            const expr: Model = this.#parseExpression()
            endSourcePos = expr.sourcePos
            defaultValueExpr = some(expr)
        }

        return {
            tag: '#Model_Field',
            key: Symbol(),
            sourcePos: startSourcePos.thru(endSourcePos),
            fieldName,
            typeExpr,
            valueExpr,
            defaultValueExpr
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

}

//=====================================================================================================================

