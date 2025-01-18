import {check} from "$shared/util/Assertions";
import {addLink, AdjacencyList, removeLink} from "$shared/util/txcollections/AdjacencyList";
import {MapEdition} from "$shared/util/txcollections/MapEdition";
import {Tx} from "$shared/util/txcollections/Tx";


export class TxLinksNtoN<Tail extends string, Head extends string> {

    constructor(
        private next: TxLinksNtoN<Tail, Head> | null,
        private forwardLinks: MapEdition<AdjacencyList<Head>>,
        private backwardLinks: MapEdition<AdjacencyList<Tail>>,
        private tx: Tx
    ) {
    }

    /** Adds a link. Starts a change sequence if needed. */
    add(tx: Tx, tail: Tail, head: Head) {
        check(!Object.isFrozen(this.forwardLinks), () => 'Cannot change further after changes have been committed.')

        // TODO: Prevent duplicates

        // Start a new version if needed.
        if (!this.next) {
            this.next = new TxLinksNtoN<Tail, Head>(
                null,
                this.forwardLinks,
                this.backwardLinks,
                tx
            )
            this.forwardLinks = {}
            this.backwardLinks = {}
        } else {
            check(this.next.tx === tx, () => "A different transaction is in progress.")
        }

        // Save the prior values here.
        if (!this.forwardLinks.hasOwnProperty(tail)) {
            this.forwardLinks[tail] = this.next.forwardLinks[tail] || null
        }
        if (!this.backwardLinks.hasOwnProperty(head)) {
            this.backwardLinks[head] = this.next.backwardLinks[head] || null
        }

        // Add the new forward link to the start of the adjacency list in the new version.
        this.next.forwardLinks[tail] = addLink(this.next.forwardLinks[tail], head)

        // Add the new backward link.
        this.next.backwardLinks[head] = addLink(this.next.backwardLinks[head], tail)
    }

    /** Removes a link. Starts a change sequence if needed. */
    delete(tx: Tx, tail: Tail, head: Head) {
        check(!Object.isFrozen(this.forwardLinks), () => 'Cannot change further after changes have been committed.')

        // Start a new version if needed.
        if (!this.next) {
            this.next = new TxLinksNtoN<Tail, Head>(
                null,
                this.forwardLinks,
                this.backwardLinks,
                tx
            )
            this.forwardLinks = {}
            this.backwardLinks = {}
        } else {
            check(this.next.tx === tx, () => "A different transaction is in progress.")
        }

        // Save the prior values here.
        if (!this.forwardLinks.hasOwnProperty(tail)) {
            this.forwardLinks[tail] = this.next.forwardLinks[tail] || null
        }
        if (!this.backwardLinks.hasOwnProperty(head)) {
            this.backwardLinks[head] = this.next.backwardLinks[head] || null
        }

        // Remove the link.
        this.next.forwardLinks[tail] = removeLink(this.next.forwardLinks[tail], head)
        this.next.backwardLinks[head] = removeLink(this.next.backwardLinks[head], tail)
    }

    forEachHead(tail: Tail, callback: (head: Head) => void) {
        const callbackLink = (link: AdjacencyList<Head> | null) => {
            if (link == null) {
                return
            }

            callbackLink(link.nextLink)
            callback(link.target)
        }

        let edition: TxLinksNtoN<Tail, Head> | null = this
        while (edition != null) {
            if (edition.forwardLinks.hasOwnProperty(tail)) {
                callbackLink(edition.forwardLinks[tail])
                break;
            }
            edition = edition.next
        }
    }

    forEachTail(head: Head, callback: (tail: Tail) => void) {
        const callbackLink = (link: AdjacencyList<Tail> | null) => {
            if (link == null) {
                return
            }

            callbackLink(link.nextLink)
            callback(link.target)
        }

        let edition: TxLinksNtoN<Tail, Head> | null = this
        while (edition != null) {
            if (edition.backwardLinks.hasOwnProperty(head)) {
                callbackLink(edition.backwardLinks[head])
                break;
            }
            edition = edition.next
        }
    }

    /** Abandons changes in progress. */
    revertChanges(tx: Tx): TxLinksNtoN<Tail, Head> {

        // Nothing to revert if unchanged.
        if (!this.next) {
            return this
        }

        check(this.next.tx === tx, () => "A different transaction is in progress.")

        // If changes are still in progress, just reverse them.
        // TODO

        // If changes are committed, duplicate then reverse the future state.

        // TODO: needs to be recursive
        throw new Error('Not yet implemented')

    }

    /** Freezes the current edition; returns the next edition. */
    withChangesCommitted(tx: Tx): TxLinksNtoN<Tail, Head> {

        // If not changed, just return the same version.
        if (!this.next) {
            return this
        }

        check(this.next.tx === tx, () => "A different transaction is in progress.")
        check(!Object.isFrozen(this.forwardLinks), () => 'Cannot commit changes twice.')

        // Freeze this old version and return the new one.
        Object.freeze(this.forwardLinks)
        return this.next
    }

}

/** Creates a new empty versioned adjacency list. */
export function makeEmptyTxLinksNtoN<Tail extends string, Head extends string>(tx: Tx) {
    return new TxLinksNtoN<Tail, Head>(null, {}, {}, tx)
}