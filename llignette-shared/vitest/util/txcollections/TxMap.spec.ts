import { describe, it, expect } from 'vitest';
import {makeEmptyTxMap} from "$shared/util/txcollections/TxMap";
import {makeTx, Tx} from "$shared/util/txcollections/Tx";

describe('VersionedMap test', () => {
    it('sets some values and reads them back with immutability', () => {

        const m0 = makeEmptyTxMap<string, string>(makeTx())

        expect(m0.get('a')).toBeNull()
        expect(m0.get('b')).toBeNull()
        expect(m0.get('c')).toBeNull()

        const tx1 = makeTx()
        m0.set(tx1, 'a', 'A')
        m0.set(tx1, 'b', 'B')
        m0.set(tx1, 'c', 'C')

        expect(m0.get('a')).toBeNull()
        expect(m0.get('b')).toBeNull()
        expect(m0.get('c')).toBeNull()

        expect(m0.getInTx(tx1, 'a')).toEqual("A")
        expect(m0.getInTx(tx1, 'b')).toEqual("B")
        expect(m0.getInTx(tx1, 'c')).toEqual("C")
        expect(m0.getInTx(tx1, 'd')).toBeNull()

        expect(m0.has('a')).toBeFalsy()
        expect(m0.has('b')).toBeFalsy()
        expect(m0.has('c')).toBeFalsy()

        expect(m0.hasInTx(tx1, 'a')).toBeTruthy()
        expect(m0.hasInTx(tx1, 'b')).toBeTruthy()
        expect(m0.hasInTx(tx1, 'c')).toBeTruthy()
        expect(m0.hasInTx(tx1, 'd')).toBeFalsy()

        const m1 = m0.withChangesCommitted(tx1)

        expect(() => m0.getInTx(tx1, 'a')).toThrow()
        expect(() => m0.set(tx1, 'd', "D")).toThrow()

        expect(m1.get('a')).toEqual("A")
        expect(m1.get('b')).toEqual("B")
        expect(m1.get('c')).toEqual("C")

        const tx2 = makeTx()
        m1.set(tx2, 'a', 'AA')
        m1.delete(tx2, 'c')
        m1.set(tx2, 'd', 'D')

        const m2 = m1.withChangesCommitted(tx2)

        expect(() => m1.withChangesCommitted(tx2)).toThrow()

        expect(m0.get('a')).toBeNull()
        expect(m0.get('b')).toBeNull()
        expect(m0.get('c')).toBeNull()

        expect(m1.get('a')).toEqual("A")
        expect(m1.get('b')).toEqual("B")
        expect(m1.get('c')).toEqual("C")
        expect(m1.get('d')).toBeNull()

        expect(m2.get('a')).toEqual("AA")
        expect(m2.get('b')).toEqual("B")
        expect(m2.get('c')).toBeNull()
        expect(m2.get('d')).toEqual("D")

        const tx3 = makeTx()
        m2.set(tx3, 'a', 'AAA')
        m2.set(tx3, 'e', 'E')

        expect(m2.get('a')).toEqual("AA")
        expect(m2.getInTx(tx3, 'a')).toEqual("AAA")
        expect(m2.get('e')).toBeNull()
        expect(m2.getInTx(tx3, 'e')).toEqual("E")

        m2.revertChanges(tx3)

        expect(m2.get('a')).toEqual("AA")
        expect(m2.getInTx(tx3, 'a')).toEqual("AA")
        expect(m2.get('e')).toBeNull()
        expect(m2.getInTx(tx3, 'e')).toBeNull()

        m2.set(tx3, 'a', 'AAA')
        m2.set(tx3, 'a', 'AAAA')
        m2.set(tx3, 'e', 'EE')
        m2.set(tx3, 'f', 'F')
        m2.delete(tx3, 'f')

        expect(m2.get('a')).toEqual("AA")
        expect(m2.getInTx(tx3, 'a')).toEqual("AAAA")
        expect(m2.get('e')).toBeNull()
        expect(m2.getInTx(tx3, 'e')).toEqual("EE")

        const m3 = m2.withChangesCommitted(tx3)

        expect(m0.get('a')).toBeNull()
        expect(m0.get('b')).toBeNull()
        expect(m0.get('c')).toBeNull()

        expect(m1.get('a')).toEqual("A")
        expect(m1.get('b')).toEqual("B")
        expect(m1.get('c')).toEqual("C")
        expect(m1.get('d')).toBeNull()

        expect(m2.get('a')).toEqual("AA")
        expect(m2.get('b')).toEqual("B")
        expect(m2.get('c')).toBeNull()
        expect(m2.get('d')).toEqual("D")
        expect(m2.get('f')).toBeNull()

        expect(m3.get('a')).toEqual("AAAA")
        expect(m3.get('b')).toEqual("B")
        expect(m3.get('c')).toBeNull()
        expect(m3.get('d')).toEqual("D")
        expect(m3.get('e')).toEqual("EE")
        expect(m3.get('f')).toBeNull()


    })
});
