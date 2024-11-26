declare const __brand: unique symbol;

// Mark any type with a compile time brand.
export type Branded<Type, Brand> = Type & {
    readonly [__brand]: Brand;
}

