import {describe, it, expect} from 'vitest';
import {scan} from "../../../../src/lib/llignette/code/scanning/Scanner";
import {parseModule} from "../../../../src/lib/llignette/code/parsing/Parser";


describe('Simple Parsing Tests', () => {
    const check = function (sourceCode: string) {
        let scanResult = scan(sourceCode)

        const parseResult = parseModule(scanResult)

        expect(parseResult.module.sourcePos.getText(sourceCode).length).toBeGreaterThan(0)
    }

    it("parses boolean fields", () => {
        check("x = false")
        check("x = true, y = false")
        check("x = false\n\ny = false")
    })

    it("parses identifier literals", () => {
        check("q = abcd")
        check("\n  c = d  \n")
    })

    it("parses built in types", () => {
        check("x: Int64")
        check("isWorking: Bool")
        check("amount: Float64")
        check("name: String")
    })

    it("parses integer literals", () => {
        check("one = 123, two = 3")
        check("many = 789")
    })

    it("parses floating point literals", () => {
        check("w = 1.23")
        check("f = 78.9")
    })

    it("parses simple string literals", () => {
        check(`s1 = "123"`)
        check(`s2 = '789'`)
        check("s3 = `three`")
    })

    it("parses arithmetic", () => {
        check("a = x + 1")
        check("b = 3 - y")
        check("c = x * 1.7")
        check("d = 3.666 / y")
        check("e = 2 ** n")
    })

    it("parses parenthesized expressions", () => {
        check("x = (a + b)")
        check("x = (a + b) * c")
        check("x = 2 / (a + b) * c")
        check("x = (x + 5)")
        check("x = ((x + 5) / ( u*3 ))")
        check("x = ()")
    })

    it("parses logical expressions", () => {
        check("x = true and false")
        check("x = a and b")
        check("x = a and b or c")
        check("x = a and not b")
        check("x = not a or b")
        check("x = a xor not b and c")
    })

    it("parses comparison operations", () => {
        check("x = 1 == 2")
        check("x = 1 + 1 == 2 / 1")
        check("x = 1 + 1 < 2 / 1")
        check("x = 1 + 1 <= 2 / 1")
        check("x = 1 + 1 >= 2 / 1")
    })

    it("parses regex operations", () => {
        check("m = x =~ y")
        check("m = x !~ y")
    })

    it("parses ranges", () => {
        check("x = 1..9")
        check("x = w in 1..9")
    })

    it("parses array literals", () => {
        check("x = []")
        check("x: Int64[] = [1,2,3]")
        check("x: String[] = ['1','2','3']")
    })

    it("parses records", () => {
        check("x = (a = 3, b=4)")
        check("x = (a: Int64 = 3)")
        check("x = (a)")
        check("x = ()")
    })

    it("parses documentation", () => {
        check("x :: 'a fine field' = (a = 3, b=4)")
        check("x :: `another one` = (a: Int64 = 3)")
        check('x :: "a third" = (a)')
    })

    it("parses field references", () => {
        check("x = a.x")
        check("x = a.x - b.t.x")
    })

    it("parses function declarations", () => {
        check("f = fn(x:Float64) => x**3 + 2 * x**2")
    })

    it("parses function calls", () => {
        check("y = f(x=5)")
        check("y = f(x)")
        check("y = f(5)")
    })

    it("parses type constraints", () => {
        check("s: Int64 & >0 & <100")
        check("s: Int64 & >=0 & <=100")
        check("s: String? & .length() < 50 & .matches(regex('[A-Za-z0-9]'))")
        check("q = (x: Float64 & >0 & units('mm'), y: Float64 & >0 & units('mm')) & .x < .y")
    })

    it("parses alternatives", () => {
        check(`
            x = o 12 when y == 3
                o 13 when y == 2
                o 14 otherwise
        `)
        check(`
            x = ◆ 12 when y == 3
                ◆ 13 when y == 2
                ◆ 14 otherwise
        `)
    })

    it("parses where clauses", () => {
        check("c = sqrt(a**2 + b**2) where (a = 3, b = 4)")
    })

});
