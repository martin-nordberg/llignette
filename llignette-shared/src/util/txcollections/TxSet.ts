import {check} from "$shared/util/Assertions";
import {Tx} from "$shared/util/txcollections/Tx";

/**
 * One edition in the evolution of a versioned set.
 */
type SetEdition = {
    [key: string]: boolean | null
}

/**
 * A versioned set is a time-traveling set of branded string values.
 *
 * The latest version is a plain set with O(1) access to its contained values.
 * Each previous version has a local override to return the original values
 * changed in the subsequent version but otherwise reads values from the subsequent
 * version. The net effect is that historical versions pay a lookup performance
 * penalty proportional to how many versions have been created subsequently.
 *
 * During an update sequence the versioned set stages the values for its next
 * version. A client can read either the snapshot starting state (get) or the
 * in progress changes (getChanged). Once changes are committed (returning
 * a new version), the original becomes immutable, and further state evolution
 * must proceed from the new version.
 *
 * States:
 *   Unchanged:
 *     next == null
 *     isFrozen == false
 *     values holds latest information
 *   Changes In Progress:
 *     next != null
 *     next has no aliases
 *     next.values holds latest (changed and unchanged) information
 *     isFrozen == false
 *     values holds information overwritten by current changes
 *   Changes Committed:
 *     next != null
 *     next has aliases
 *     next holds latest information, including subsequent changes recursively
 *     isFrozen == true
 *     values holds information overwritten during this change sequence
 */
export class TxSet<T extends string> {

    constructor(
        private next: TxSet<T> | null,
        private values: SetEdition,
        private tx: Tx,
    ) {
    }

    /** Adds the given value. Starts a change sequence if needed. */
    add(tx: Tx, value: T)   {
        this.setFlag(tx, value, true)
    }

    /** Removes the given value. Starts a change sequence if needed. */
    delete(tx: Tx, value: T) {
        this.setFlag(tx, value, false)
    }

    /** Checks whether the set contains a given value. */
    has(value: T): boolean {

        // First look in our own edition.
        let result = this.values[value]

        // If not found, look in the next edition, if any.
        if (result === undefined && this.next) {
            result = this.next.has(value)
        }

        return result || false
    }

    /** Returns the changed presence of given value in the set. */
    hasInTx(tx: Tx, value: T): boolean {

        check(!Object.isFrozen(this.values), () => 'Cannot read changes after they have been committed.')

        // Look in the next edition, if present (i.e. the value has not been removed by tx), otherwise our own.
        if (this.next) {
            check(this.next.tx === tx, () => "A different transaction is in progress.")
            return this.next.values[value] || false
        }

        return this.values[value] || false
    }

    /** Abandons changes in progress. */
    revertChanges(tx: Tx): TxSet<T> {

        // Nothing to revert if unchanged.
        if (!this.next) {
            return this
        }

        check(this.next.tx === tx, () => "A different transaction is in progress.")

        // If changes are still in progress, just reverse them.
        if (!Object.isFrozen(this.values)) {
            const values = this.values

            this.values = this.next.values
            for (let key in values) {
                this.values[key] = values[key]
            }

            this.next = null

            return this
        }

        // If changes are committed, duplicate then reverse the future state.

        // TODO: needs to be recursive
        throw new Error('Not yet implemented')

    }

    /** Freezes the current edition; returns the next edition. */
    withChangesCommitted(tx: Tx): TxSet<T> {

        // If not changed, just return the same version.
        if (!this.next) {
            return this
        }

        check(this.next.tx === tx, () => "A different transaction is in progress.")
        check(!Object.isFrozen(this.values), () => 'Cannot commit changes twice.')

        // Freeze this old version and return the new one.
        Object.freeze(this.values)
        return this.next
    }

    /** Adds or removes the given value according to the flag. Starts a change sequence if needed. */
    private setFlag(tx: Tx, value: T, flag: boolean) {

        check(!Object.isFrozen(this.values), () => 'Cannot change further after changes have been committed.')

        // Start a new version if needed.
        if (!this.next) {
            this.next = new TxSet<T>(
                null,
                this.values,
                tx
            )
            this.values = {}
        } else {
            check(this.next.tx === tx, () => "Another transaction is already in progress.")
        }

        // Save the prior value here.
        if (!this.values.hasOwnProperty(value)) {
            this.values[value] = this.next.values[value] || null
        }

        // Set the new value in the new version.
        this.next.values[value] = flag
    }

}

/** Creates a new empty versioned set. */
export function makeEmptyTxSet<K extends string>(tx: Tx) {
    return new TxSet<K>(null, {}, tx)
}