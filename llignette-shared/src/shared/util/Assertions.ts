/**
 * Basic assertion function.
 * @param condition the condition expected to be true.
 * @param message callback to produce the error message if the condition is false
 */
export function check(condition: boolean, message: () => string): void {
    if (!condition) {
        throw new Error(message())
    }
}

/**
 * Assertion of a non-null value.
 * @param value a value that must not be null or undefined
 * @param message callback to produce the error message if the value is null
 */
export function checkNonNull<T>(value: T | undefined, message: () => string): asserts value is T {
    if (value == null) {
        throw new Error(message())
    }
}