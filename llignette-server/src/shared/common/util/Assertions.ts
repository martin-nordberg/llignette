/** Basic assertion function. */
export function check(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message)
    }
}

export function checkNonNull<T>(value: T | undefined, message: string): asserts value is T {
    if (value == null) {
        throw new Error(message)
    }
}