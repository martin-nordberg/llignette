/**
 * A link in a singly linked adjacency list.
 */
export type AdjacencyList<T extends string> = {
    readonly target: T,
    readonly nextLink: AdjacencyList<T> | null
}

/**
 * Adds a new link to the start of an adjacency list.
 * @param adjList the adjacency list to add to.
 * @param targetToAdd the element being added
 */
export function addLink<T extends string>(
    adjList: AdjacencyList<T> | null,
    targetToAdd: T
): AdjacencyList<T> {
    return {
        target: targetToAdd,
        nextLink: adjList,
    }
}

/**
 * Removes a link from an adjacency list, returning the altered list.
 * Keeps the tail of the original list after the removed element.
 * @param adjList the adjacency list to remove from
 * @param targetToRemove the element to remove
 */
export function removeLink<T extends string>(
    adjList: AdjacencyList<T> | null,
    targetToRemove: T
): AdjacencyList<T> | null {
    if (adjList == null) {
        return null
    }

    if (adjList.target == targetToRemove) {
        return adjList.nextLink
    }

    return {
        target: adjList.target,
        nextLink: removeLink(adjList.nextLink, targetToRemove)
    }
}
