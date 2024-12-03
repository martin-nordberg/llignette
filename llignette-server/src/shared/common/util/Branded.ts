declare const __brand: unique symbol;

/** Marks a type with a compile time brand for TypeScript's equivalent to nominal typing. */
export type Branded<Type, Brand> = Type & {
    readonly [__brand]: Brand;
}

