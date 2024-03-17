import {describe, it, expect} from 'vitest';
import {scan} from "../../../../src/lib/llignette/code/scanning/Scanner";
import {parseModule} from "../../../../src/lib/llignette/code/parsing/Parser";


describe('Parsing Sample: Optional', () => {
    const check = function (sourceCode: string) {
        let scanResult = scan(sourceCode)

        const parseResult = parseModule(scanResult)

        expect(parseResult.module.sourcePos.getText(sourceCode).length).toBeGreaterThan(0)
    }

    it("parses the code for Optional", () => {
        check(`
        
lligne = ( 

  util: Package = (

    None: (T:Type) -> Type =
        fn(T) => (
            tag = #None
        )
    
    Some: (T: Type) -> Type =
        fn(T) => (
            tag = #Some,
            value: T
        )

    Optional: (T: Type) -> Type =
        None(T)
        | Some(T)

    none: (T: Type) -> None(T) =
        fn(T) => (
            tag = #None
        )

    eq :: "Equality",
    eq : (T: Type, option1: Optional(T), option2: Optional(T)) -> Bool,
    eq ??= fn(T: Type, option1: Optional(T), option2: Optional(T)) =>
            option1 is None(T) and option2 is None(T) or
            option1 is Some(T) and option2 is Some(T) and option1.value == option2.value

    exists :: "Tests whether a value is present and satisfies a predicate" :
        (T: Type, option: Optional(T), predicate: (value: T) -> boolean) -> Bool ??=
        fn(T, option, predicate) =>
            option is Some(T) and predicate(option.value)

    filter: (T: Type, option: Optional(T), predicate: (value: T) -> boolean) -> Optional(T) ??=
        fn(T, option, predicate) =>
            o option when option is Some(T) and predicate(option.value)
            o none otherwise

    isNone: (T: Type, option: Optional(T)) -> Bool ??=
        fn(T, option) =>
            option is None(T)

    isSome: (T: Type, option: Optional(T)) -> Bool ??=
        fn(T, option) =>
            option is Some(T)

    map: (T: Type, U: Type, option: Option(T), mapFn: (value: T) -> U) -> Option(U) ??=
        fn(T, U, option, mapFn) =>
            ◆ none(U) when option is None(T)
            ◆ some(mapFn(option.value)) otherwise

    match: (T: Type, U: Type, option: Option(T), dispatch: (ifNone: () -> U, ifSome: (value: T) -> U)) -> U ??=
        fn(T, U, option, dispatch) =>
            ◆ dispatch.ifNone() when option is None(T)
            ◆ dispatch.ifSome(option.value) otherwise

    some: (T: Type, value: T) -> Some(T) ??=
        fn(T, value) => (
            tag = #Some,
            value
        )

    toArray: (T: Type, option: Optional(T)) -> T[] ??=
        fn(option) =>
            ◆ [option.value] when option is Some(T)
            ◆ [] otherwise

    value: (T: Type, option: Optional(T), defaultValue: T) -> T ??=
        fn(option) =>
            ◆ option.value when option is Some(T)
            ◆ defaultValue otherwise

  )
)
        `)
    })


});


