import { z } from 'zod';
import {
  ARTWORK_ARTIST_MAX_LENGTH,
  ARTWORK_TITLE_MAX_LENGTH,
  ARTWORK_TYPES,
} from '../constants/artwork';

export const artworkFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(ARTWORK_TITLE_MAX_LENGTH),
  artist: z.string().trim().min(1, 'Artist is required').max(ARTWORK_ARTIST_MAX_LENGTH),
  type: z.enum(ARTWORK_TYPES, { message: 'Select a type' }),
  price: z.coerce.number({ message: 'Price is required' }).positive('Price must be greater than 0'),
  availability: z.boolean(),
});

export type ArtworkFormValues = z.infer<typeof artworkFormSchema>;

export const artworkFormDefaults: ArtworkFormValues = {
  title: '',
  artist: '',
  type: ARTWORK_TYPES[0],
  price: 0,
  availability: true,
};
