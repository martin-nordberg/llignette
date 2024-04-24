import {describe, it, expect} from 'vitest';
import {scan} from "../../../../src/lib/llignette/code/scanning/Scanner";
import {parseModule} from "../../../../src/lib/llignette/code/parsing/Parser";


describe('Simple Parsing Tests', () => {

    const check = function (sourceCode: string) {
        let scanResult = scan(sourceCode)

        const module = parseModule(scanResult)

        expect(module.sourcePos.getText(sourceCode).length).toBeGreaterThan(0)
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
        check("s3 = 'three'")
        check(`x = """
        yea
        verily
        """`)
        check(`x = '''
        yea
        verily
        '''`)
        check("x = '''\n  yea\n  verily'''")
    })

    it("parses empty string literals", () => {
        check(`s1 = ""`)
        check(`s2 = ''`)
        check(`s1 = """"""`)
        check(`s1 = ''''''`)
    })

    it("parses interpolated string literals", () => {
        check(`s1 = "a{{b}}c"`)
        check(`s1 = 'a{{b}}'`)
        check(`s1 = "{{b}}c"`)
        check(`s1 = """a{{ b + 1 }}c"""`)
        check(`s1 = '''a{{ b + 1 }}'''`)
        check("s1 = '''{{ b + 1 }}c'''")
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

    it("parses Boolean expressions", () => {
        check("x = true and false")
        check("x : Boolean = a and b")
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
        check("x = (a::'stuff')" )
        check("x = ()")
        check("x = (t = #Tag, state = #Ready, value: String)")
        check("c = sqrt(_a**2 + _b**2), _a = 3, _b = 4")

        check("v ^: VALUE : Int64 :: 'My favorite' ??= 42")
        check("x = (v ^: VALUE : Int64 :: 'My favorite' ??= 42)")
    })

    it("parses alias fields", () => {
        check("x =:= my.fine.x")
    })

    it("parses documentation", () => {
        check("x :: 'a fine field' = (a = 3, b=4)")
        check("x :: '''another one''' = (a: Int64 = 3)")
        check('x :: "a third" = (a)')
    })

    it("parses field references", () => {
        check("x = a.x")
        check("x = a.x - b.t.x")
    })

    it("parses function declarations", () => {
        check("f = fn(x:Float64) -> Float64 => x**3 + 2 * x**2")
        check("f : () -> (x:Int64, y:Int64), f = fn() -> (x:Int64, y:Int64) => (x=1, y=3)")
        check("f = fn() -> (tag: #Tag) => (tag = #Tag)")
    })

    it("parses function calls", () => {
        check("y = f(x=5)")
        check("y = f(x)")
        check("y = f(5+7)")
        check("y = s.length()")
        check("y = a.append(x)")
        check("y = a.append((x))")
        check("y = a.append(...x)")
        check("y = a.append(...f(x+7))")
    })

    it("parses array indexing", () => {
        check("y = y0[1]")
        check("y = yAB[m-1][n+1]")
    })

    it("parses type combinations", () => {
        check("x: Int64 | String")
        check("x: Float64 && <0 | >100")
    })

    it("parses type constraints", () => {
        check("s: Int64 & >0 & <100")
        check("s: Int64 & >=0 & <=100")
        check("s: String? & .length() < 50 & .matches(regex('[A-Za-z0-9]'))")
        check("q = (x: Float64 & >0 & units('mm'), y: Float64 & >0 & units('mm')) & .x < .y")
    })

    it("parses metadata operators", () => {
        check("_ymeta_ = y^")
        check("_yname_ = y^.name")
        check("_yname_ = y^.path()")
    })

    it("parses 'in' expressions", () => {
        check("athlete = studentActivity in sports")
        check("athlete = `studentActivity` in sports")
    })

    it("parses type states", () => {
        check("close : fn(file: File~Open~>Closed) => true")
        check("x = 4, file ~= file & (open: true)")
    })

    it("parses identifier interpolations", () => {
        check("x = fn(s:String) => ({{s}}: Int64 = 42)")
        check("x = fn(t:String) => (s: {{t}} = 42)")
        check("x = fn(t:String) => (s: t = {{t}})")
    })

    it("parses generator options", () => {
        check("x = gen(V: Type) => (o = Int64 when V <: Special, o = absent otherwise)")
    })

});
