import {check, fail} from "$shared/util/Assertions";
import {addLink, AdjacencyList, removeLink} from "$shared/util/txcollections/AdjacencyList";
import {MapEdition} from "$shared/util/txcollections/MapEdition";
import {Tx} from "$shared/util/txcollections/Tx";

/**
 * A transactional 1-to-many relationship.
 */
export class TxLinks1toN<Tail extends string, Head extends string> {

    constructor(
        private next: TxLinks1toN<Tail, Head> | null,
        private forwardLinks: MapEdition<AdjacencyList<Head>>,
        private backwardLinks: MapEdition<Tail>,
        private tx: Tx,
    ) {
    }

    /** Adds a link. Starts a change sequence if needed. */
    add(tx: Tx, tail: Tail, head: Head) {
        check(!Object.isFrozen(this.forwardLinks), () => 'Cannot change further after changes have been committed.')

        // Find the at most one existing link to the given head.
        const existingTail = (this.next ? this.next.backwardLinks[head] : this.backwardLinks[head]) || null

        if (existingTail == tail) {
            fail("Cannot duplicate existing link")
        }

        // Start a new version if needed.
        if (!this.next) {
            this.next = new TxLinks1toN<Tail, Head>(
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

        // Remove any existing link with the same tail value
        if (existingTail != null) {
            if (!this.forwardLinks.hasOwnProperty(existingTail)) {
                this.forwardLinks[existingTail] = this.next.forwardLinks[existingTail] || null
            }

            this.next.forwardLinks[existingTail] = removeLink(this.next.forwardLinks[existingTail], head)
        }

        // Add the new forward link to the start of the adjacency list in the new version.
        this.next.forwardLinks[tail] = addLink(this.next.forwardLinks[tail], head)

        // Set the new backward link.
        this.next.backwardLinks[head] = tail
    }

    /** Removes a link. Starts a change sequence if needed. */
    delete(tx: Tx, head: Head) {
        check(!Object.isFrozen(this.forwardLinks), () => 'Cannot change further after changes have been committed.')

        // Find the at most one existing link to the given head.
        const tail = (this.next ? this.next.backwardLinks[head] : this.backwardLinks[head]) || null

        if (tail == null) {
            fail("Cannot delete nonexistent link")
        }

        // Start a new version if needed.
        if (!this.next) {
            this.next = new TxLinks1toN<Tail, Head>(
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
        this.next.backwardLinks[head] = null
    }

    /** Iterates over each head reachable from given tail. */
    forEachHead(tail: Tail, callback: (head: Head) => void) {
        let headsAlreadyVisited = new Set<Head>()

        const callbackLink = (link: AdjacencyList<Head> | null) => {
            if (link == null) {
                return
            }

            callbackLink(link.nextLink)

            if (!headsAlreadyVisited.has(link.target)) {
                callback(link.target)
                headsAlreadyVisited.add(link.target)
            }
        }

        let edition: TxLinks1toN<Tail, Head> | null = this
        while (edition != null) {
            callbackLink(edition.forwardLinks[tail])
            edition = edition.next
        }
    }

    /** Returns the tail for given head. */
    getTail(head: Head): Tail | null {

        // First look in our own edition.
        let result = this.backwardLinks[head]

        // If not found, look in the next edition, if any.
        if (result === undefined && this.next) {
            result = this.next.getTail(head)
        }

        return result || null
    }

    /** Returns the tail for given head, accounting for changes from the open transaction. */
    getTailInTx(tx: Tx, head: Head): Tail | null {

        check(!Object.isFrozen(this.forwardLinks), () => 'Cannot read changes after they have been committed.')

        // Look in the next edition, if present, otherwise our own.
        let result = this.next ? this.next.backwardLinks[head] : this.backwardLinks[head]

        return result || null
    }

    /** Abandons changes in progress. */
    revertChanges(tx: Tx): TxLinks1toN<Tail, Head> {

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
    withChangesCommitted(tx: Tx): TxLinks1toN<Tail, Head> {

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
export function makeEmptyTxLinks1toN<Tail extends string, Head extends string>(tx: Tx) {
    return new TxLinks1toN<Tail, Head>(null, {}, {}, tx)
}