import {describe, it, expect} from 'vitest';
import {scan} from "../../../../src/lib/llignette/code/scanning/Scanner";
import {parseModule} from "../../../../src/lib/llignette/code/parsing/Parser";

import srcFactorial from '../../../samples/rosettacode/Factorial.llignette?raw'
import srcFizzBuzz from '../../../samples/rosettacode/FizzBuzz.llignette?raw'
import srcOptional from '../../../samples/llignette/lang/Optional.llignette?raw'

// x
describe('Parsing Samples', () => {

    const check = function (sourceCode: string) {
        let scanResult = scan(sourceCode)

        const parseResult = parseModule(scanResult)

        expect(parseResult.module.sourcePos.getText(sourceCode).length).toBeGreaterThan(0)
    }

    it("parses the code for Factorial", () => {
        check(srcFactorial)
    })

    it("parses the code for FizzBuzz", () => {
        check(srcFizzBuzz)
    })

    it("parses the code for Optional", () => {
        check(srcOptional)
    })

});


