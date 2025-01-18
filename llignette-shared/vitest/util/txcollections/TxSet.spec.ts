import { describe, it, expect } from 'vitest';
import {makeEmptyTxSet} from "$shared/util/txcollections/TxSet";
import {makeTx} from "$shared/util/txcollections/Tx";

describe('VersionedSet test', () => {
    it('sets some values and reads them back with immutability', () => {

        const s0 = makeEmptyTxSet<string>(makeTx())

        expect(s0.has('a')).toBeFalsy()
        expect(s0.has('b')).toBeFalsy()
        expect(s0.has('c')).toBeFalsy()

        const tx1 = makeTx()
        s0.add(tx1, 'a')
        s0.add(tx1, 'b')
        s0.add(tx1, 'c')

        expect(s0.has('a')).toBeFalsy()
        expect(s0.has('b')).toBeFalsy()
        expect(s0.has('c')).toBeFalsy()

        expect(s0.hasInTx(tx1, 'a')).toBeTruthy()
        expect(s0.hasInTx(tx1, 'b')).toBeTruthy()
        expect(s0.hasInTx(tx1, 'c')).toBeTruthy()
        expect(s0.hasInTx(tx1, 'd')).toBeFalsy()

        const s1 = s0.withChangesCommitted(tx1)

        expect(() => s0.hasInTx(tx1, 'a')).toThrow()
        expect(() => s0.add(tx1, 'd')).toThrow()

        expect(s1.has('a')).toBeTruthy()
        expect(s1.has('b')).toBeTruthy()
        expect(s1.has('c')).toBeTruthy()

        const tx2 = makeTx()
        s1.delete(tx2, 'b')
        s1.add(tx2, 'b')
        s1.delete(tx2, 'c')
        s1.add(tx2, 'd')
        s1.add(tx2, 'e')
        s1.delete(tx2, 'e')

        const s2 = s1.withChangesCommitted(tx2)

        expect(() => s1.withChangesCommitted(tx2)).toThrow()

        expect(s0.has('a')).toBeFalsy()
        expect(s0.has('b')).toBeFalsy()
        expect(s0.has('c')).toBeFalsy()

        expect(s1.has('a')).toBeTruthy()
        expect(s1.has('b')).toBeTruthy()
        expect(s1.has('c')).toBeTruthy()
        expect(s1.has('d')).toBeFalsy()
        expect(s2.has('e')).toBeFalsy()

        expect(s2.has('a')).toBeTruthy()
        expect(s2.has('b')).toBeTruthy()
        expect(s2.has('c')).toBeFalsy()
        expect(s2.has('d')).toBeTruthy()
        expect(s2.has('e')).toBeFalsy()

        const tx3 = makeTx()
        s2.add(tx3, 'e')

        expect(s2.has('a')).toBeTruthy()
        expect(s2.hasInTx(tx3, 'a')).toBeTruthy()
        expect(s2.has('e')).toBeFalsy()
        expect(s2.hasInTx(tx3, 'e')).toBeTruthy()

        s2.revertChanges(tx3)

        expect(s2.has('a')).toBeTruthy()
        expect(s2.hasInTx(tx3, 'a')).toBeTruthy()
        expect(s2.has('e')).toBeFalsy()
        expect(s2.hasInTx(tx3, 'e')).toBeFalsy()

    })
});
