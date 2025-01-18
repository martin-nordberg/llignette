/**
 * One edition in the evolution of a versioned map.
 */
export type MapEdition<T> = {
    [key: string]: T | null
}

