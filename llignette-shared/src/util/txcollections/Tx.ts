

export type Tx = {
    id: number
}

let nextTxId = 0

export const makeTx= () => {
    return {id: nextTxId++}
}

