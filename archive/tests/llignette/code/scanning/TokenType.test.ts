import {describe, it, expect} from 'vitest';
import {textOfTokenType} from "../../../../src/lib/llignette/code/scanning/TokenType";


describe('TokenType test', () => {
    it('retrieves token text', () => {
        expect(textOfTokenType('#TokenType_Ampersand')).toBe("&");
        expect(textOfTokenType('#TokenType_Identifier')).toBe("[identifier]");
        expect(textOfTokenType('#TokenType_In')).toBe("in");
    });
});
