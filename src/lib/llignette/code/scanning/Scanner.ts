//
// # Scanner for Llignette tokens.
//
// (C) Copyright 2023 Martin E. Nordberg III
// Apache 2.0 License
//

import type {TokenType} from "./TokenType";
import type {Token} from "./Token";

//=====================================================================================================================

export type ScanningOutcome = {
    readonly sourceCode: string,
    readonly tokens: Token[],
    readonly newLineOffsets: number[]
}

//=====================================================================================================================

// Converts the given source code to an array of tokens plus an array of new line character offsets.
export function scan(sourceCode: string): ScanningOutcome {

    // Create a scanner.
    const scanner = new Scanner(sourceCode)

    // Scan the entire source code.
    scanner.scan()

    // Extract the results.
    return {
        sourceCode: sourceCode,
        tokens: scanner.tokens,
        newLineOffsets: scanner.newLineOffsets,
    }

}

//=====================================================================================================================

// Converts a string of Llignette source code into tokens.
class Scanner {
    readonly sourceCode: string;
    markedPos: number;
    currentPos: number;
    charAhead1: string;
    charAhead2: string;
    tokens: Token[];
    newLineOffsets: number[];

    constructor(sourceCode: string) {
        this.sourceCode = sourceCode
        this.markedPos = 0
        this.currentPos = 0
        this.charAhead1 = '\0'
        this.charAhead2 = '\0'
        this.newLineOffsets = []
        this.tokens = []

        // Read the first character.
        if (sourceCode.length > 0) {
            this.charAhead1 = sourceCode.charAt(0)
        }

        if (sourceCode.length > 1) {
            this.charAhead2 = sourceCode.charAt(1)
        }
    }

    /**
     * Converts the source code to an array of tokens.
     */
    scan() {
        while (true) {
            let token = this.#readToken()
            this.tokens.push(token)

            if (token.tokenType == '#TokenType_Eof') {
                // Two extra EOF tokens for no lookahead surprises.
                this.tokens.push(token)
                this.tokens.push(token)
                break
            }
        }
    }

    /** Consumes one character and stages the next one in the scanner. */
    #advance() {

        if (this.charAhead1 == '\n') {
            this.newLineOffsets.push(this.currentPos);
        }
        this.currentPos += 1;
        this.charAhead1 = this.charAhead2

        if (this.currentPos + 1 >= this.sourceCode.length) {
            this.charAhead2 = '\0';
        } else {
            this.charAhead2 = this.sourceCode.charAt(this.currentPos + 1)
        }

    }

    #isDigit(ch: string) {
        return "0123456789".indexOf(ch) >= 0
    }

    #isWhiteSpace(ch: string) {
        // TODO: needs work
        const whiteSpaceChars = " \t\r\n"

        return whiteSpaceChars.indexOf(ch) >= 0
    }

    /** Returns the next token from the scanner. */
    #readToken(): Token {

        // Ignore whitespace
        while (this.#isWhiteSpace(this.charAhead1)) {
            this.#advance()
        }

        // Mark the start of the token
        this.markedPos = this.currentPos

        // Consume the next character.
        let ch = this.charAhead1
        this.#advance()

        // Handle character ranges.
        if (this.#isIdentifierStart(ch)) {
            return this.#scanIdentifierOrKeyword()
        }

        if (this.#isDigit(ch)) {
            return this.#scanNumber()
        }

        // Handle individual characters.
        switch (ch) {
            case '&':
                return this.#oneOrTwoCharToken('#TokenType_Ampersand', '&', '#TokenType_AmpersandAmpersand')
            case '*':
                return this.#token('#TokenType_Asterisk')
            case '@':
                return this.#token('#TokenType_AtSign')
            case '`':
                return this.#scanBackTickedString()
            case ':':
                return this.#oneOrTwoCharToken('#TokenType_Colon', ':', '#TokenType_ColonColon')
            case ',':
                return this.#token('#TokenType_Comma')
            case '-':
                return this.#oneOrTwoCharToken('#TokenType_Dash', '>', '#TokenType_RightArrow')
            case '.':
                return this.#oneToThreeCharToken('#TokenType_Dot', '.', '#TokenType_DotDot', '.', '#TokenType_DotDotDot')
            case '=':
                return this.#scanAfterEquals()
            case '!':
                return this.#scanAfterExclamationMark()
            case '<':
                return this.#oneOrTwoCharToken('#TokenType_LessThan', '=', '#TokenType_LessThanOrEquals')
            case '>':
                return this.#oneOrTwoCharToken('#TokenType_GreaterThan', '=', '#TokenType_GreaterThanOrEquals')
            case '#':
                return this.#token('#TokenType_Hash')
            case '{':
                return this.#token('#TokenType_LeftBrace')
            case '[':
                return this.#token('#TokenType_LeftBracket')
            case '(':
                return this.#token('#TokenType_LeftParenthesis')
            case '+':
                return this.#token('#TokenType_Plus')
            case '?':
                return this.#scanAfterQuestionMark()
            case '}':
                return this.#token('#TokenType_RightBrace')
            case ']':
                return this.#token('#TokenType_RightBracket')
            case ')':
                return this.#token('#TokenType_RightParenthesis')
            case ';':
                return this.#token('#TokenType_Semicolon')
            case '/':
                return this.#token('#TokenType_Slash')
            case '"':
                return this.#scanDoubleQuotedString()
            case '\'':
                return this.#scanSingleQuotedString()
            case '|':
                return this.#token('#TokenType_VerticalBar')
            case '\0':
                return {
                    sourceOffset: this.markedPos,
                    sourceLength: 0,
                    tokenType: '#TokenType_Eof'
                }
        }

        return this.#token('#TokenType_UnrecognizedChar')

    }

    // Determines whether a given character could be the second or later character of an identifier.
    #isIdentifierPart(ch: string, chNext: string): boolean {
        return this.#isIdentifierStart(ch) || this.#isDigit(ch) ||
            ch == '-' && (this.#isIdentifierStart(chNext) || this.#isDigit(chNext))
    }

    // Determines whether a given character could be the opening character of an identifier.
    #isIdentifierStart(ch: string): boolean {
        // TODO: needs Unicode identifier chars
        return 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || ch == '_'
    }

    // Scans a sequence of characters that could be one or two characters in length.
    #oneOrTwoCharToken(
        oneCharType: TokenType,
        secondChar: string,
        twoCharType: TokenType
    ): Token {

        if (this.charAhead1 == secondChar) {
            this.#advance()
            return this.#token(twoCharType)
        }

        return this.#token(oneCharType)

    }

    // Scans a sequence of characters that could be one, two, or three characters in length.
    #oneToThreeCharToken(
        oneCharType: TokenType,
        secondChar: string,
        twoCharType: TokenType,
        thirdChar: string,
        threeCharType: TokenType
    ): Token {

        if (this.charAhead1 == secondChar) {
            this.#advance()

            if (this.charAhead1 == thirdChar) {
                this.#advance()

                return this.#token(threeCharType)
            }

            return this.#token(twoCharType)
        }

        return this.#token(oneCharType)

    }

    // Scans one of: '=', '==', '===', '=~'.
    #scanAfterEquals(): Token {

        if (this.charAhead1 == '=') {
            this.#advance()

            if (this.charAhead1 == '=') {
                this.#advance()

                return this.#token('#TokenType_EqualsEqualsEquals')
            }

            return this.#token('#TokenType_EqualsEquals')

        }

        if (this.charAhead1 == '~') {
            this.#advance()
            return this.#token('#TokenType_EqualsTilde')
        }

        return this.#token('#TokenType_Equals')

    }

    // Scans one of: '!', '!=', '!~'.
    #scanAfterExclamationMark(): Token {

        if (this.charAhead1 == '=') {
            this.#advance()

            return this.#token('#TokenType_ExclamationEquals')
        }

        if (this.charAhead1 == '~') {
            this.#advance()
            return this.#token('#TokenType_ExclamationTilde')
        }

        return this.#token('#TokenType_Exclamation')

    }

    // Scans one of the following tokens: '?', '?:', '??', '??='
    #scanAfterQuestionMark(): Token {

        if (this.charAhead1 == ':') {
            this.#advance()

            return this.#token('#TokenType_QuestionColon')
        }

        if (this.charAhead1 == '?') {
            this.#advance()

            // @ts-ignore
            if (this.charAhead1 == '=') {
                this.#advance()
                return this.#token('#TokenType_QuestionQuestionEquals')
            }

            return this.#token('#TokenType_QuestionQuestion')
        }

        return this.#token('#TokenType_Question')
    }

    // Consumes a multiline back-ticked string.
    #scanBackTickedString(): Token {

        if (this.charAhead1 == '`' && this.charAhead2 == '`') {
            this.#advance()
            this.#advance()
            return this.#scanTripleQuotedString('`', '#TokenType_TripleBackTickedString')
        }

        return this.#scanQuotedString('`', '#TokenType_BackTickedString')
    }

    // Scans the remainder of a string literal after the initial double quote character has been consumed.
    #scanDoubleQuotedString(): Token {

        if (this.charAhead1 == '"' && this.charAhead2 == '"') {
            this.#advance()
            this.#advance()
            return this.#scanTripleQuotedString('"', '#TokenType_TripleDoubleQuotedString')
        }

        return this.#scanQuotedString('"', '#TokenType_DoubleQuotedString')

    }

    #scanExclamationString() {
        const mark = this.markedPos

        while (true) {

            // TODO: handle single line back-ticked string

            // Consume to the end of the line.
            while (this.charAhead1 != '\n' && this.charAhead1 != '\0') {
                this.#advance()
            }

            // Quit if hit the end of input.
            if (this.charAhead1 == '\0') {
                break
            }

            this.#advance()

            // Ignore whitespace
            while (this.charAhead1 != '\n' && this.#isWhiteSpace(this.charAhead1)) {
                this.#advance()
            }

            // Quit after seeing something other than another exclamation mark on the subsequent line.
            // @ts-ignore
            if (this.charAhead1 != "!") {
                break
            }

            // Mark the start of the next line and consume the back tick
            this.markedPos = this.currentPos
            this.#advance()

        }

        return {
            sourceOffset: mark,
            sourceLength: this.currentPos - mark,
            tokenType: '#TokenType_ExclamationString'
        }

    }

    // Scans the remainder of an identifier after the opening letter has been consumed.
    #scanIdentifierOrKeyword(): Token {

        while (this.#isIdentifierPart(this.charAhead1, this.charAhead2)) {
            this.#advance()
        }

        const text = this.sourceCode.substring(this.markedPos, this.currentPos)

        const keywordTokenType = keywords[text]
        if (keywordTokenType) {
            return {
                sourceOffset: this.markedPos,
                sourceLength: this.currentPos - this.markedPos,
                tokenType: keywordTokenType,
            }
        }

        return {
            sourceOffset: this.markedPos,
            sourceLength: this.currentPos - this.markedPos,
            tokenType: '#TokenType_Identifier',
        }

    }

    // Scans a numeric literal after the opening digit has been consumed.
    #scanNumber(): Token {

        while (this.#isDigit(this.charAhead1)) {
            this.#advance()
        }

        if (this.charAhead1 == '.' && this.#isDigit(this.charAhead2)) {
            this.#advance()
            return this.#scanNumberFloatingPoint()
        }

        return this.#token('#TokenType_IntegerLiteral')

    }

    // Scans a floating point literal after the decimal point has been consumed.
    #scanNumberFloatingPoint(): Token {

        while (this.#isDigit(this.charAhead1)) {
            this.#advance()
        }

        // TODO: exponents

        return this.#token('#TokenType_FloatingPointLiteral')

    }

    // Scans a single line string up to given delimiter, returning given token type.
    #scanQuotedString(delimiter: string, tokenType: TokenType): Token {

        while (true) {
            switch (this.charAhead1) {
                case delimiter:
                    this.#advance()
                    return this.#token(tokenType)

                case '\\':
                    this.#advance()
                    // TODO: handle escape sequences properly
                    this.#advance()
                    break;

                case '\n':
                case '\0':
                    return this.#token('#TokenType_UnclosedString')

                default:
                    this.#advance()
            }
        }

    }

    // Scans the remainder of a string literal after the initial single quote character has been consumed.
    #scanSingleQuotedString(): Token {

        if (this.charAhead1 == "'" && this.charAhead2 == "'") {
            this.#advance()
            this.#advance()
            return this.#scanTripleQuotedString("'", '#TokenType_TripleSingleQuotedString')
        }

        return this.#scanQuotedString("'", '#TokenType_SingleQuotedString')

    }

    // Scans a multi line string up to given delimiter, returning given token type.
    #scanTripleQuotedString(delimiter: string, tokenType: TokenType): Token {

        while (true) {
            switch (this.charAhead1) {
                case delimiter:
                    this.#advance()

                    if (this.charAhead1 == delimiter) {
                        this.#advance()

                        if (this.charAhead1 == delimiter) {
                            this.#advance()
                            return this.#token(tokenType)
                        }
                    }

                    break;

                case '\0':
                    return this.#token('#TokenType_UnclosedString')

                default:
                    this.#advance()
            }
        }

    }

    // Builds a new token of given type with text from the marked position to the current position.
    #token(tokenType: TokenType): Token {
        return {
            sourceOffset: this.markedPos,
            sourceLength: this.currentPos - this.markedPos,
            tokenType: tokenType,
        }
    }

}

//=====================================================================================================================

const keywords: { [key: string]: TokenType } = {
    "and": '#TokenType_And',
    "as": '#TokenType_As',
    "Boolean": '#TokenType_Boolean',
    "false": '#TokenType_False',
    "Float64": '#TokenType_Float64',
    "is": '#TokenType_Is',
    "in": '#TokenType_In',
    "Int64": '#TokenType_Int64',
    "not": '#TokenType_Not',
    "or": '#TokenType_Or',
    "String": '#TokenType_String',
    "true": '#TokenType_True',
    "when": '#TokenType_When',
    "where": '#TokenType_Where',
}

//=====================================================================================================================
