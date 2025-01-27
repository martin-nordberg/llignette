
/** A transaction in a versioned data structure. */
export type Tx = {
    id: number
}

/** A static source of transaction IDs. */
let nextTxId = 0

/** Makes a new transaction. */
export const makeTx= () => {
    return {id: nextTxId++}
}

