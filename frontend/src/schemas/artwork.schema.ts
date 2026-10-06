import type { DefaultValues } from 'react-hook-form';
import { z } from 'zod';
import {
  ARTWORK_ARTIST_MAX_LENGTH,
  ARTWORK_TITLE_MAX_LENGTH,
  ARTWORK_TYPES,
  PRICE_MAX,
  PRICE_MAX_DECIMAL_PLACES,
} from '../constants/artwork';

const PRICE_STEP = 10 ** -PRICE_MAX_DECIMAL_PLACES;

export const artworkFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(ARTWORK_TITLE_MAX_LENGTH, `Title must be at most ${ARTWORK_TITLE_MAX_LENGTH} characters`),
  artist: z
    .string()
    .trim()
    .min(1, 'Artist is required')
    .max(
      ARTWORK_ARTIST_MAX_LENGTH,
      `Artist must be at most ${ARTWORK_ARTIST_MAX_LENGTH} characters`,
    ),
  type: z.enum(ARTWORK_TYPES, { message: 'Select a type' }),
  // An empty input must read as "required", not be coerced to 0 ("must be > 0").
  price: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce
      .number({ message: 'Price is required' })
      .positive('Price must be greater than 0')
      .max(PRICE_MAX, `Price must be at most ${PRICE_MAX.toLocaleString('en-US')}`)
      .multipleOf(PRICE_STEP, `Price can have at most ${PRICE_MAX_DECIMAL_PLACES} decimal places`),
  ),
  availability: z.boolean(),
});

/** What the inputs hold (price may still be '' / unknown before parsing). */
export type ArtworkFormInput = z.input<typeof artworkFormSchema>;
/** What the schema returns after successful validation. */
export type ArtworkFormValues = z.output<typeof artworkFormSchema>;

/**
 * `price` is intentionally left out so the create form starts with an empty
 * field instead of a pre-filled `0` that is immediately invalid.
 */
export const artworkFormDefaults: DefaultValues<ArtworkFormInput> = {
  title: '',
  artist: '',
  type: ARTWORK_TYPES[0],
  availability: true,
};
