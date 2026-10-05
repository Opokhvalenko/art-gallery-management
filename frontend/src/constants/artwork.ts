/**
 * Mirrors backend/src/common/constants/artwork-types.constant.ts.
 * Duplicated deliberately — frontend and backend are separate packages
 * (see README decisions) — not imported across the monorepo boundary.
 */
export const ARTWORK_TYPES = ['painting', 'sculpture', 'photography', 'digital', 'print'] as const;

export type ArtworkType = (typeof ARTWORK_TYPES)[number];

export const ARTWORK_TITLE_MAX_LENGTH = 99;
export const ARTWORK_ARTIST_MAX_LENGTH = 50;
