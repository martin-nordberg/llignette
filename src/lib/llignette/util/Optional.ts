//
// (C) Copyright 2023-2024 Martin E. Nordberg III
// Apache 2.0 License
//

//=====================================================================================================================

export type None = {
    readonly tag: 'Option#None'
}

export type Some<T> = {
    readonly tag: 'Option#Some',
    readonly value: T
}

//=====================================================================================================================

export type Optional<T> =
    | None
    | Some<T>
    ;

export function areEqual<T>(option1: Optional<T>, option2: Optional<T>): boolean {
    switch (option1.tag) {
        case 'Option#None':
            return option2.tag == 'Option#None';
        case 'Option#Some':
            return option2.tag == 'Option#Some' && option1.value == option2.value;
    }
}

// TBD: compare (compares values, with None < Some(v))

export function filter<T>(option: Optional<T>, predicate: (value: T) => boolean): Optional<T> {
    if (option.tag == 'Option#Some' && predicate(option.value)) {
        return option
    } else {
        return none()
    }
}

export function isNone<T>(option: Optional<T>): boolean {
    switch (option.tag) {
        case 'Option#None':
            return true
        case 'Option#Some':
            return false
    }
}

export function isSome<T>(option: Optional<T>): boolean {
    switch (option.tag) {
        case 'Option#None':
            return false
        case 'Option#Some':
            return true
    }
}

export function map<T, U>(option: Optional<T>, mapFn: (value: T) => U): Optional<U> {
    switch (option.tag) {
        case 'Option#None':
            return none()
        case 'Option#Some':
            return some(mapFn(option.value))
    }
}

export function match<T, U>(option: Optional<T>, dispatch: { ifNone: () => U, ifSome: (value: T) => U }): U {
    switch (option.tag) {
        case 'Option#None':
            return dispatch.ifNone()
        case 'Option#Some':
            return dispatch.ifSome(option.value)
    }
}

export function none(): None {
    return {tag: 'Option#None'}
}

export function some<T>(value: T): Some<T> {
    return {tag: 'Option#Some', value}
}

export function someOrNone<T>(value: T|undefined): Optional<T> {
    if (value) {
        return some(value)
    }
    return none()
}

export function toArray<T>(option: Optional<T>): T[] {
    switch (option.tag) {
        case 'Option#None':
            return []
        case 'Option#Some':
            return [option.value]
    }
}

// TBD: toResult (value or error)

export function value<T>(option: Optional<T>, defawlt: T): T {
    switch (option.tag) {
        case 'Option#None':
            return defawlt
        case 'Option#Some':
            return option.value
    }
}

//=====================================================================================================================
