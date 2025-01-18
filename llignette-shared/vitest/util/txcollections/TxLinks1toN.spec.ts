import { describe, it, expect } from 'vitest';
import {makeEmptyTxLinks1toN} from "$shared/util/txcollections/TxLinks1toN";
import {makeTx} from "$shared/util/txcollections/Tx";

describe('VersionedLinks1toN test', () => {
    it('sets some values and reads them back with immutability', () => {

        const l0 = makeEmptyTxLinks1toN<string, string>(makeTx())

        expect(l0.getTail('head1a')).toBeNull()

        const tx1 = makeTx()
        l0.add(tx1, 'tail1', 'head1a')
        l0.add(tx1, 'tail1', 'head1b')
        l0.add(tx1, 'tail1', 'head1c')

        expect(() => l0.add(tx1, 'tail1', 'head1c')).toThrow()

        expect(l0.getTail('head1a')).toBeNull()
        expect(l0.getTail('head1b')).toBeNull()
        expect(l0.getTail('head1c')).toBeNull()

        expect(l0.getTailInTx(tx1, 'head1a')).toEqual('tail1')
        expect(l0.getTailInTx(tx1, 'head1b')).toEqual('tail1')
        expect(l0.getTailInTx(tx1, 'head1c')).toEqual('tail1')
        expect(l0.getTailInTx(tx1, 'head1d')).toBeNull()

        const l1 = l0.withChangesCommitted(tx1)

        expect(() => l0.getTailInTx(tx1, 'head1a')).toThrow()
        expect(() => l0.add(tx1, 'tail1', 'head1d')).toThrow()

        expect(l0.getTail('head1a')).toBeNull()
        expect(l0.getTail('head1b')).toBeNull()
        expect(l0.getTail('head1c')).toBeNull()

        expect(l1.getTail('head1a')).toEqual('tail1')
        expect(l1.getTail('head1b')).toEqual('tail1')
        expect(l1.getTail('head1c')).toEqual('tail1')
        expect(l1.getTail('head1d')).toBeNull()

        const tx2 = makeTx()
        l1.add(tx2, 'tail2', 'head2b')
        l1.add(tx2, 'tail2', 'head1b')

        const l2 = l1.withChangesCommitted(tx2)

        expect(l1.getTail('head1a')).toEqual('tail1')
        expect(l1.getTail('head1b')).toEqual('tail1')
        expect(l1.getTail('head1c')).toEqual('tail1')

        expect(l2.getTail('head1a')).toEqual('tail1')
        expect(l2.getTail('head1b')).toEqual('tail2')
        expect(l2.getTail('head1c')).toEqual('tail1')
        expect(l2.getTail('head2b')).toEqual('tail2')

        const tx3 = makeTx()
        l2.add(tx3, 'tail1', 'head3b')
        l2.add(tx3, 'tail2', 'head3b')

        const l3 = l2.withChangesCommitted(tx3)

        expect(l1.getTail('head1a')).toEqual('tail1')
        expect(l1.getTail('head1b')).toEqual('tail1')
        expect(l1.getTail('head1c')).toEqual('tail1')

        expect(l2.getTail('head1a')).toEqual('tail1')
        expect(l2.getTail('head1b')).toEqual('tail2')
        expect(l2.getTail('head1c')).toEqual('tail1')
        expect(l2.getTail('head2b')).toEqual('tail2')

        expect(l3.getTail('head1a')).toEqual('tail1')
        expect(l3.getTail('head1b')).toEqual('tail2')
        expect(l3.getTail('head1c')).toEqual('tail1')
        expect(l3.getTail('head2b')).toEqual('tail2')
        expect(l3.getTail('head3b')).toEqual('tail2')

        const tx4 = makeTx()
        l3.delete(tx4, 'head1b')
        l3.add(tx4, 'tail2', 'head1d')
        l3.delete(tx4, 'head1d')

        expect(() => l3.delete(tx4, 'head1b')).toThrow()

        const l4 = l3.withChangesCommitted(tx4)

        expect(l3.getTail('head1a')).toEqual('tail1')
        expect(l3.getTail('head1b')).toEqual('tail2')
        expect(l3.getTail('head1c')).toEqual('tail1')
        expect(l3.getTail('head2b')).toEqual('tail2')
        expect(l3.getTail('head3b')).toEqual('tail2')

        expect(l4.getTail('head1a')).toEqual('tail1')
        expect(l4.getTail('head1b')).toBeNull()
        expect(l4.getTail('head1c')).toEqual('tail1')
        expect(l4.getTail('head2b')).toEqual('tail2')
        expect(l4.getTail('head3b')).toEqual('tail2')
        expect(l4.getTail('head1d')).toBeNull()

        let heads1 = ""
        let heads2 = ""

        l4.forEachHead('tail1', h => heads1 += h)
        l4.forEachHead('tail2', h => heads2 += h)

        expect(heads1).toEqual('head1ahead1c')
        expect(heads2).toEqual('head2bhead3b')

        heads1 = ""

        l1.forEachHead('tail1', h => heads1 += h)

        expect(heads1).toEqual('head1ahead1bhead1c')
    })
});
