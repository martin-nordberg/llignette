import {describe, it, expect} from 'vitest';
import type {TokenType} from "../../../../src/lib/llignette/code/scanning/TokenType";
import {scan} from "../../../../src/lib/llignette/code/scanning/Scanner";
import type {Token} from "../../../../src/lib/llignette/code/scanning/Token";


describe('Scanner test', () => {

    const expectToken = function(token: Token, expectedTokenType: TokenType, expectedSourceOffset: number, expectedLength: number) {
        expect(token.tokenType).toBe(expectedTokenType);
        expect(token.sourceOffset).toBe(expectedSourceOffset);
        expect(token.sourceLength).toBe(expectedLength);
    }

    it("scans an empty string", () => {
        const result = scan("")

        expectToken(result.tokens[0], '#TokenType_Eof', 0, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans an unrecognized character", () => {
        const result = scan("‽")

        expectToken(result.tokens[0], '#TokenType_UnrecognizedChar', 0, 1)
        expectToken(result.tokens[1], '#TokenType_Eof', 1, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans a few punctuation tokens", () => {
        const result = scan(
            "& &&\n *: , ",
        )

        expectToken(result.tokens[0], '#TokenType_Ampersand', 0, 1)
        expectToken(result.tokens[1], '#TokenType_AmpersandAmpersand', 2, 2)
        expectToken(result.tokens[2], '#TokenType_Asterisk', 6, 1)
        expectToken(result.tokens[3], '#TokenType_Colon', 7, 1)
        expectToken(result.tokens[4], '#TokenType_Comma', 9, 1)
        expectToken(result.tokens[5], '#TokenType_Eof', 11, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few identifier tokens", () => {
        const result = scan(
            "a bb c23_f q-code _dfg",
        )

        expectToken(result.tokens[0], '#TokenType_Identifier', 0, 1)
        expectToken(result.tokens[1], '#TokenType_Identifier', 2, 2)
        expectToken(result.tokens[2], '#TokenType_Identifier', 5, 5)
        expectToken(result.tokens[3], '#TokenType_Identifier', 11, 6)
        expectToken(result.tokens[4], '#TokenType_Identifier', 18, 4)
        expectToken(result.tokens[5], '#TokenType_Eof', 22, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans a few integers", () => {
        const result = scan(
            "123 4\n(99000) 5",
        )

        expectToken(result.tokens[0], '#TokenType_IntegerLiteral', 0, 3)
        expectToken(result.tokens[1], '#TokenType_IntegerLiteral', 4, 1)
        expectToken(result.tokens[2], '#TokenType_LeftParenthesis', 6, 1)
        expectToken(result.tokens[3], '#TokenType_IntegerLiteral', 7, 5)
        expectToken(result.tokens[4], '#TokenType_RightParenthesis', 12, 1)
        expectToken(result.tokens[5], '#TokenType_IntegerLiteral', 14, 1)
        expectToken(result.tokens[6], '#TokenType_Eof', 15, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few numbers", () => {
        const result = scan(
            "12.3 4\n(990.00) 5.1",
        )

        expectToken(result.tokens[0], '#TokenType_FloatingPointLiteral', 0, 4)
        expectToken(result.tokens[1], '#TokenType_IntegerLiteral', 5, 1)
        expectToken(result.tokens[2], '#TokenType_LeftParenthesis', 7, 1)
        expectToken(result.tokens[3], '#TokenType_FloatingPointLiteral', 8, 6)
        expectToken(result.tokens[4], '#TokenType_RightParenthesis', 14, 1)
        expectToken(result.tokens[5], '#TokenType_FloatingPointLiteral', 16, 3)
        expectToken(result.tokens[6], '#TokenType_Eof', 19, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few double quoted strings", () => {
        const result = scan(
            `"abc" "xyz" "bad
 "start over"`,
        )

        expectToken(result.tokens[0], '#TokenType_DoubleQuote', 0, 1)
        expectToken(result.tokens[1], '#TokenType_StringFragment', 1, 3)
        expectToken(result.tokens[2], '#TokenType_DoubleQuote', 4, 1)
        expectToken(result.tokens[3], '#TokenType_DoubleQuote', 6, 1)
        expectToken(result.tokens[4], '#TokenType_StringFragment', 7, 3)
        expectToken(result.tokens[5], '#TokenType_DoubleQuote', 10, 1)
        expectToken(result.tokens[6], '#TokenType_DoubleQuote', 12, 1)
        expectToken(result.tokens[7], '#TokenType_UnclosedString', 13, 3)
        expectToken(result.tokens[8], '#TokenType_DoubleQuote', 18, 1)
        expectToken(result.tokens[9], '#TokenType_StringFragment', 19, 10)
        expectToken(result.tokens[10], '#TokenType_DoubleQuote', 29, 1)
        expectToken(result.tokens[11], '#TokenType_Eof', 30, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a one line triple double quoted string", () => {
        const result = scan(
            `"""aaa"""`,
        )

        expectToken(result.tokens[0], '#TokenType_TripleDoubleQuote', 0, 3)
        expectToken(result.tokens[1], '#TokenType_StringFragment', 3, 3)
        expectToken(result.tokens[2], '#TokenType_TripleDoubleQuote', 6, 3)
        expectToken(result.tokens[3], '#TokenType_Eof', 9, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans a multiline triple double quoted string", () => {
        const result = scan(
            `"""
     aaa
"""`,
        )

        expectToken(result.tokens[0], '#TokenType_TripleDoubleQuote', 0, 3)
        expectToken(result.tokens[1], '#TokenType_StringFragment', 3, 10)
        expectToken(result.tokens[2], '#TokenType_TripleDoubleQuote', 13, 3)
        expectToken(result.tokens[3], '#TokenType_Eof', 16, 0)
        expect(result.newLineOffsets.length).toBe(2)
    })

    it("scans a few single quoted strings", () => {
        const result = scan(
            `'abc' 'xyz' 'bad
 'start over'`,
        )

        expectToken(result.tokens[0], '#TokenType_SingleQuote', 0, 1)
        expectToken(result.tokens[1], '#TokenType_StringFragment', 1, 3)
        expectToken(result.tokens[2], '#TokenType_SingleQuote', 4, 1)
        expectToken(result.tokens[3], '#TokenType_SingleQuote', 6, 1)
        expectToken(result.tokens[4], '#TokenType_StringFragment', 7, 3)
        expectToken(result.tokens[5], '#TokenType_SingleQuote', 10, 1)
        expectToken(result.tokens[6], '#TokenType_SingleQuote', 12, 1)
        expectToken(result.tokens[7], '#TokenType_UnclosedString', 13, 3)
        expectToken(result.tokens[8], '#TokenType_SingleQuote', 18, 1)
        expectToken(result.tokens[9], '#TokenType_StringFragment', 19, 10)
        expectToken(result.tokens[10], '#TokenType_SingleQuote', 29, 1)
        expectToken(result.tokens[11], '#TokenType_Eof', 30, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few back ticked strings", () => {
        const result = scan(
            "`abc` `xyz` `bad\n `start over`",
        )

        expectToken(result.tokens[0], '#TokenType_BackTick', 0, 1)
        expectToken(result.tokens[1], '#TokenType_StringFragment', 1, 3)
        expectToken(result.tokens[2], '#TokenType_BackTick', 4, 1)
        expectToken(result.tokens[3], '#TokenType_BackTick', 6, 1)
        expectToken(result.tokens[4], '#TokenType_StringFragment', 7, 3)
        expectToken(result.tokens[5], '#TokenType_BackTick', 10, 1)
        expectToken(result.tokens[6], '#TokenType_BackTick', 12, 1)
        expectToken(result.tokens[7], '#TokenType_UnclosedString', 13, 3)
        expectToken(result.tokens[8], '#TokenType_BackTick', 18, 1)
        expectToken(result.tokens[9], '#TokenType_StringFragment', 19, 10)
        expectToken(result.tokens[10], '#TokenType_BackTick', 29, 1)
        expectToken(result.tokens[11], '#TokenType_Eof', 30, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans an interpolated back ticked string", () => {
        const result = scan(
            "`abc{{stuff}}`",
        )

        expectToken(result.tokens[0], '#TokenType_BackTick', 0, 1)
        expectToken(result.tokens[1], '#TokenType_StringFragment', 1, 3)
        expectToken(result.tokens[2], '#TokenType_LeftGuillemot', 4, 2)
        expectToken(result.tokens[3], '#TokenType_Identifier', 6, 5)
        expectToken(result.tokens[4], '#TokenType_RightGuillemot', 11, 2)
        expectToken(result.tokens[5], '#TokenType_BackTick', 13, 1)
        expectToken(result.tokens[6], '#TokenType_Eof', 14, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans a nested interpolated back ticked string", () => {
        const result = scan(
            "`abc{{funct('{{inner}}')}} then {{another}}`",
        )

        expectToken(result.tokens[0], '#TokenType_BackTick', 0, 1)
        expectToken(result.tokens[1], '#TokenType_StringFragment', 1, 3)
        expectToken(result.tokens[2], '#TokenType_LeftGuillemot', 4, 2)
        expectToken(result.tokens[3], '#TokenType_Identifier', 6, 5)
        expectToken(result.tokens[4], '#TokenType_LeftParenthesis', 11, 1)
        expectToken(result.tokens[5], '#TokenType_SingleQuote', 12, 1)
        expectToken(result.tokens[6], '#TokenType_LeftGuillemot', 13, 2)
        expectToken(result.tokens[7], '#TokenType_Identifier', 15, 5)
        expectToken(result.tokens[8], '#TokenType_RightGuillemot', 20, 2)
        expectToken(result.tokens[9], '#TokenType_SingleQuote', 22, 1)
        expectToken(result.tokens[10], '#TokenType_RightParenthesis', 23, 1)
        expectToken(result.tokens[11], '#TokenType_RightGuillemot', 24, 2)
        expectToken(result.tokens[12], '#TokenType_StringFragment', 26, 6)
        expectToken(result.tokens[13], '#TokenType_LeftGuillemot', 32, 2)
        expectToken(result.tokens[14], '#TokenType_Identifier', 34, 7)
        expectToken(result.tokens[15], '#TokenType_RightGuillemot', 41, 2)
        expectToken(result.tokens[16], '#TokenType_BackTick', 43, 1)
        expectToken(result.tokens[17], '#TokenType_Eof', 44, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans boolean literals", () => {
        const result = scan(
            "true false",
        )

        expectToken(result.tokens[0], '#TokenType_True', 0, 4)
        expectToken(result.tokens[1], '#TokenType_False', 5, 5)
        expectToken(result.tokens[2], '#TokenType_Eof', 10, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans built in types", () => {
        const result = scan(
            "Boolean Float64 Int64 String",
        )

        expectToken(result.tokens[0], '#TokenType_Boolean', 0, 7)
        expectToken(result.tokens[1], '#TokenType_Float64', 8, 7)
        expectToken(result.tokens[2], '#TokenType_Int64', 16, 5)
        expectToken(result.tokens[3], '#TokenType_String', 22, 6)
        expectToken(result.tokens[4], '#TokenType_Eof', 28, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })


});
