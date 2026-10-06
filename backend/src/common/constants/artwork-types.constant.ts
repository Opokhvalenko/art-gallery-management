/**
 * Predefined artwork types. Not specified in the task — chosen as a
 * reasonable, documented set (see README decisions). Shared between the
 * create/update DTOs (validation) and the query DTO (Swagger enum hint).
 */
export const ARTWORK_TYPES = ['painting', 'sculpture', 'photography', 'digital', 'print'] as const;

export type ArtworkType = (typeof ARTWORK_TYPES)[number];

export const ARTWORK_TITLE_MAX_LENGTH = 99;
export const ARTWORK_ARTIST_MAX_LENGTH = 50;

/** Money is stored as Decimal; cents are the smallest unit we accept. */
export const PRICE_MAX_DECIMAL_PLACES = 2;

/**
 * Upper bound on price. Without one, e.g. 1e300 is accepted and anything past
 * ~9e15 silently loses cents in a JS number. 1 billion is above any artwork
 * ever sold and keeps every value with 2 decimals exactly representable.
 */
export const PRICE_MAX = 1_000_000_000;
