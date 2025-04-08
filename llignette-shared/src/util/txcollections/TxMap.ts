import {check} from "$shared/util/Assertions";
import {MapEdition} from "$shared/util/txcollections/MapEdition";
import {Tx} from "$shared/util/txcollections/Tx";

/**
 * A versioned map is a time-traveling map from branded string keys to values.
 *
 * The latest version is a plain map with O(1) access to its keyed values.
 * Each previous version has a local override to return the original values
 * changed in the subsequent version but otherwise reads values from the subsequent
 * version. The net effect is that historical versions pay a lookup performance
 * penalty proportional to how many versions have been created subsequently.
 *
 * During an update sequence the versioned map stages the values for its next
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
export class TxMap<K extends string, V> {

    constructor(
        private next: TxMap<K, V> | null,
        private values: MapEdition<V>,
        private tx: Tx,
    ) {
    }

    /** Removes the value associated with given key. Starts a change sequence if needed. */
    delete(tx: Tx, key: K) {
        this.setValue(tx, key, null)
    }

    /** Gets the snapshot value for given key. */
    get(key: K): V | null {

        // First look in our own edition.
        let result = this.values[key]

        // If not found, look in the next edition, if any.
        if (result === undefined && this.next) {
            result = this.next.get(key)
        }

        return result || null
    }

    /** Gets the latest (changed) value for given key. */
    getInTx(tx: Tx, key: K): V | null {

        check(!Object.isFrozen(this.values), () => 'Cannot read changes after they have been committed.')

        // Look in the next edition, if present, otherwise our own.
        if (this.next) {
            check(this.next.tx === tx, () => "A different transaction is in progress.")
            return this.next.values[key] || null
        } else {
            return this.values[key] || null
        }
    }

    /** Tests whether the given key has a value (before any changes in progress). */
    has(key: K): boolean {
        return this.get(key) != null
    }

    /** Tests whether the given key has a changed value. */
    hasInTx(tx: Tx, key: K): boolean {
        return this.getInTx(tx, key) != null
    }

    /** Abandons changes in progress. */
    revertChanges(tx: Tx): TxMap<K, V> {

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

    /** Changes the value associated with given key. Starts a change sequence if needed. */
    set(tx: Tx, key: K, value: V) {
        this.setValue(tx, key, value)
        return this
    }

    /** Freezes the current edition; returns the next edition. */
    withChangesCommitted(tx: Tx): TxMap<K, V> {

        // If not changed just return the same version
        if (!this.next) {
            return this
        }

        check(this.next.tx === tx, () => "A different transaction is in progress.")
        check(!Object.isFrozen(this.values), () => 'Cannot commit changes twice.')

        // Freeze this old version and return the new one.
        Object.freeze(this.values)
        return this.next
    }

    /** Changes or removes the value associated with given key. Starts a change sequence if needed. */
    private setValue(tx: Tx, key: K, value: V | null) {

        check(!Object.isFrozen(this.values), () => 'Cannot change further after changes have been committed.')

        // Start a new version if needed.
        if (!this.next) {
            this.next = new TxMap<K, V>(
                null,
                this.values,
                tx
            )
            this.values = {}
        }

        // Save the prior value here.
        if (!this.values.hasOwnProperty(key)) {
            this.values[key] = this.next.values[key] || null
        }

        // Set the new value in the new version.
        this.next.values[key] = value
    }

}

/** Creates a new empty versioned Map. */
export function makeEmptyTxMap<K extends string, V>(tx: Tx) {
    return new TxMap<K, V>(null, {}, tx)
}