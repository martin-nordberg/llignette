import {describe, it, expect} from 'vitest';
import {scan} from "../../../../src/lib/llignette/code/scanning/Scanner";
import {parseModule} from "../../../../src/lib/llignette/code/parsing/Parser";

import srcFactorial from '../../../samples/rosettacode/Factorial.llignette?raw'
import srcFibonacci from '../../../samples/rosettacode/Fibonacci.llignette?raw'
import srcFizzBuzz from '../../../samples/rosettacode/FizzBuzz.llignette?raw'
import srcOptional from '../../../samples/llignette/lang/Optional.llignette?raw'
import srcLineSegment from '../../../samples/geometry/LineSegment.llignette?raw'
import srcPoint from '../../../samples/geometry/Point.llignette?raw'

// x
describe('Parsing Samples', () => {

    const check = function (sourceCode: string) {
        let scanResult = scan(sourceCode)

        const module = parseModule(scanResult)

        expect(module.sourcePos.getText(sourceCode).length).toBeGreaterThan(0)
    }

    it("parses the code for Factorial", () => {
        check(srcFactorial)
    })

    it("parses the code for Fibonacci", () => {
        check(srcFibonacci)
    })

    it("parses the code for FizzBuzz", () => {
        check(srcFizzBuzz)
    })

    it("parses the code for Optional", () => {
        check(srcOptional)
    })

    it("parses the code for LineSegment", () => {
        check(srcLineSegment)
    })

    it("parses the code for Point", () => {
        check(srcPoint)
    })

});


