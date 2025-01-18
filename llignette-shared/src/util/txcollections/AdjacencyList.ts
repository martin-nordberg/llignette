
export type AdjacencyList<T extends string> = {
    readonly target: T,
    readonly nextLink: AdjacencyList<T> | null
}

export function addLink<T extends string>(
    start: AdjacencyList<T> | null,
    targetToAdd: T
): AdjacencyList<T> {
    return {
        target: targetToAdd,
        nextLink: start,
    }
}

export function removeLink<T extends string>(
    start: AdjacencyList<T> | null,
    targetToRemove: T
): AdjacencyList<T> | null {
    if (start == null) {
        return null
    }

    if (start.target == targetToRemove) {
        return start.nextLink
    }

    return {
        target: start.target,
        nextLink: removeLink(start.nextLink, targetToRemove)
    }
}
