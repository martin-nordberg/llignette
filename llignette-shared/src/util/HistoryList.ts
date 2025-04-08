/**
 * A link in a singly linked list where the head of the list is the newest item.
 */
export type HistoryList<T> = {
    readonly item: T,
    readonly priorLink: HistoryList<T> | null
}

/**
 * Adds a new item to the start of a history list.
 * @param histList the history list to add to.
 * @param itemToAdd the element being added
 */
export function addToHistory<T>(
    histList: HistoryList<T> | null,
    itemToAdd: T
): HistoryList<T> {
    return {
        item: itemToAdd,
        priorLink: histList,
    }
}

