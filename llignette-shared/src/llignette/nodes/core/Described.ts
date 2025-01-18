import {Node, NodeId, nodeIdSchema} from "./Node";
import {z} from "zod";
import {Branded} from "$shared/util/Branded";


declare const __describedBrand: unique symbol;

/** Unique branded ID for a specific concrete node type. */
export type DescribedId = NodeId & {
    readonly [__describedBrand]: 'Described';
}

/** Validates the format of a node ID. */
export const describedIdSchema =
    nodeIdSchema

/** Constructs an organization ID from a string. */
export function toDescribedId(id: unknown) {
    return describedIdSchema.parse(id) as DescribedId
}


/** Zod schema for summary validation. */
const summarySchema = z.string()
    .trim()
    .min(1, "Summary must not be empty.")
    .max(200, "Summary can be at most 200 characters.")
    .regex(/^[^\r\n]*$/)

/** Summary type with constraints (currently none come up to type level). */
type SummaryStr = z.infer<typeof summarySchema>

/** Branded string containing a summary. */
export type Summary = Branded<SummaryStr, 'Summary'>

/**
 * Validates and brands a string to become a summary.
 * @param summary the raw summary string
 */
export function toSummary(summary: unknown): Summary {
    return summarySchema.parse(summary) as Summary
}


/** Zod schema for description validation. */
const descriptionSchema = z.string()
    .trim()
    .min(1, "Description must not be empty.")
    .max(10000, "Description can be at most 10000 characters.")

/** Description type with constraints (currently none come up to type level). */
type DescriptionStr = z.infer<typeof descriptionSchema>

/** Branded string containing a description. */
export type Description = Branded<DescriptionStr, 'Description'>

/**
 * Validates and brands a string to become a description.
 * @param description the raw description string
 */
export function toDescription(description: unknown): Description {
    return descriptionSchema.parse(description) as Description
}


/** Base type for model entities with a description. */
export type Described = Node & {

    /** The unique ID of the entity. */
    readonly id: DescribedId

    /** A multi-line description of the entity. */
    readonly description?: Description | null,

    /** A short one line summary description of the entity. */
    readonly summary?: Summary | null,

}


