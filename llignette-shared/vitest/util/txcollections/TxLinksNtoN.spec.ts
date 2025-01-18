import { describe, it, expect } from 'vitest';
import {makeEmptyTxLinksNtoN, TxLinksNtoN} from "$shared/util/txcollections/TxLinksNtoN";
import {makeTx} from "$shared/util/txcollections/Tx";

describe('VersionedLinksNtoN test', () => {
    it('sets some values and reads them back with immutability', () => {

        const getHeads = (l: TxLinksNtoN<string, string>, tail: string)=> {
            let heads = ""
            l.forEachHead(tail, h => heads += h)
            return heads
        }

        const getTails = (l: TxLinksNtoN<string, string>, head: string)=> {
            let tails = ""
            l.forEachTail(head, t => tails += t)
            return tails
        }

        const l0 = makeEmptyTxLinksNtoN<string, string>(makeTx())

        const tx1 = makeTx()
        l0.add(tx1, 'tail1x', 'head1a')
        l0.add(tx1, 'tail1x', 'head1b')
        l0.add(tx1, 'tail1x', 'head1c')
        l0.add(tx1, 'tail1y', 'head1a')
        l0.add(tx1, 'tail1y', 'head1b')
        l0.add(tx1, 'tail1y', 'head1c')

        const l1 = l0.withChangesCommitted(tx1)

        expect(getHeads(l0, 'tail1x')).toEqual('')
        expect(getHeads(l0, 'tail1y')).toEqual('')
        expect(getTails(l0, 'head1a')).toEqual('')

        expect(getHeads(l1, 'tail1x')).toEqual('head1ahead1bhead1c')
        expect(getHeads(l1, 'tail1y')).toEqual('head1ahead1bhead1c')
        expect(getTails(l1, 'head1a')).toEqual('tail1xtail1y')

        const tx2 = makeTx()
        l1.add(tx2, 'tail1z', 'head1a')
        l1.add(tx2, 'tail1z', 'head1b')
        l1.add(tx2, 'tail1z', 'head1c')

        const l2 = l1.withChangesCommitted(tx2)

        expect(getHeads(l0, 'tail1x')).toEqual('')
        expect(getHeads(l0, 'tail1y')).toEqual('')
        expect(getTails(l0, 'head1a')).toEqual('')

        expect(getHeads(l1, 'tail1x')).toEqual('head1ahead1bhead1c')
        expect(getHeads(l1, 'tail1y')).toEqual('head1ahead1bhead1c')
        expect(getTails(l1, 'head1a')).toEqual('tail1xtail1y')

        expect(getHeads(l2, 'tail1x')).toEqual('head1ahead1bhead1c')
        expect(getHeads(l2, 'tail1y')).toEqual('head1ahead1bhead1c')
        expect(getHeads(l2, 'tail1z')).toEqual('head1ahead1bhead1c')
        expect(getTails(l2, 'head1a')).toEqual('tail1xtail1ytail1z')

        const tx3 = makeTx()
        l2.delete(tx3, 'tail1x', 'head1b')
        l2.delete(tx3, 'tail1y', 'head1b')

        const l3 = l2.withChangesCommitted(tx3)

        expect(getHeads(l0, 'tail1x')).toEqual('')
        expect(getHeads(l0, 'tail1y')).toEqual('')
        expect(getTails(l0, 'head1a')).toEqual('')

        expect(getHeads(l1, 'tail1x')).toEqual('head1ahead1bhead1c')
        expect(getHeads(l1, 'tail1y')).toEqual('head1ahead1bhead1c')
        expect(getTails(l1, 'head1a')).toEqual('tail1xtail1y')

        expect(getHeads(l2, 'tail1x')).toEqual('head1ahead1bhead1c')
        expect(getHeads(l2, 'tail1y')).toEqual('head1ahead1bhead1c')
        expect(getHeads(l2, 'tail1z')).toEqual('head1ahead1bhead1c')
        expect(getTails(l2, 'head1a')).toEqual('tail1xtail1ytail1z')

        expect(getHeads(l3, 'tail1x')).toEqual('head1ahead1c')
        expect(getHeads(l3, 'tail1y')).toEqual('head1ahead1c')
        expect(getHeads(l3, 'tail1z')).toEqual('head1ahead1bhead1c')
        expect(getTails(l3, 'head1a')).toEqual('tail1xtail1ytail1z')
        expect(getTails(l3, 'head1b')).toEqual('tail1z')


    })
});
