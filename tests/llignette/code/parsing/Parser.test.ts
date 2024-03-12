import {describe, it, expect} from 'vitest';
import {scan} from "../../../../src/lib/llignette/code/scanning/Scanner";
import {parseModule} from "../../../../src/lib/llignette/code/parsing/Parser";


describe('Parser test', () => {
    const check = function(sourceCode: string) {
        let scanResult = scan(sourceCode)

        const parseResult = parseModule(scanResult)

        expect(parseResult.module.sourcePos.getText(sourceCode).length).toBeGreaterThan(0)
    }

    it("parses boolean fields", () => {
        check("x = false")
        check("x = false, y = false")
        check("x = false\n\ny = false")
    })


});
