
/** A transaction in a versioned data structure. */
export type Tx = {
    id: number
}

/** A static source of transaction IDs. */
let nextTxId = 0

/** Makes a new transaction. */
export const makeTx= () => {
    console.debug(`New transaction ${nextTxId+1}.`)
    return {id: nextTxId++}
}

