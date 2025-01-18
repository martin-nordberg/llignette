/**
 * Basic assertion function.
 * @param condition the condition expected to be true.
 * @param message callback to produce the error message if the condition is false
 */
export function check(condition: boolean, message: () => string): void {
    if (!condition) {
        fail(message())
    }
}

export function checkHasKey<K, V>(map: Map<K, V>, key: K, message: () => string) {
    if (!map.has(key)) {
        fail(message())
    }
}

/**
 * Assertion of a non-null value.
 * @param value a value that must not be null or undefined
 * @param message callback to produce the error message if the value is null
 */
export function checkNonNull<T>(value: T | undefined, message: () => string): asserts value is T {
    if (value == null) {
        fail(message())
    }
}


export function checkNotHasKey<K, V>(map: Map<K, V>, key: K, message: () => string) {
    if (map.has(key)) {
        fail(message())
    }
}


export function fail(message: string): never {
    if (failureLoggingEnabled) {
        console.error(message)
    }
    throw new Error(message)
}

export let failureLoggingEnabled = false