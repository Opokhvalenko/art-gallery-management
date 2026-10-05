import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ApiError } from '../api/http-client';
import { ARTWORK_TYPES } from '../constants/artwork';
import { useCreateArtwork, useUpdateArtwork } from '../hooks/useArtworkMutations';
import {
  type ArtworkFormValues,
  artworkFormDefaults,
  artworkFormSchema,
} from '../schemas/artwork.schema';
import type { Artwork } from '../types/artwork';

const INPUT_CLASSES =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none';

function isFormField(field: string): field is keyof ArtworkFormValues {
  return field in artworkFormDefaults;
}

interface ArtworkFormProps {
  mode: 'create' | 'edit';
  artwork?: Artwork;
  onClose: () => void;
}

export function ArtworkForm({ mode, artwork, onClose }: ArtworkFormProps) {
  const createMutation = useCreateArtwork();
  const updateMutation = useUpdateArtwork();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ArtworkFormValues>({
    resolver: zodResolver(artworkFormSchema),
    defaultValues: artwork
      ? {
          title: artwork.title,
          artist: artwork.artist,
          type: artwork.type as ArtworkFormValues['type'],
          price: artwork.price,
          availability: artwork.availability,
        }
      : artworkFormDefaults,
  });

  const onSubmit = handleSubmit((values) => {
    const callbacks = {
      onSuccess: () => onClose(),
      onError: (error: unknown) => {
        if (error instanceof ApiError) {
          for (const detail of error.details) {
            if (isFormField(detail.field)) {
              setError(detail.field, { message: detail.message });
            }
          }
        }
      },
    };

    if (mode === 'create') {
      createMutation.mutate(values, callbacks);
    } else {
      updateMutation.mutate({ id: (artwork as Artwork).id, payload: values }, callbacks);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div>
        <label htmlFor="form-title" className="mb-1 block text-xs font-medium text-gray-500">
          Title
        </label>
        <input id="form-title" type="text" className={INPUT_CLASSES} {...register('title')} />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="form-artist" className="mb-1 block text-xs font-medium text-gray-500">
          Artist
        </label>
        <input id="form-artist" type="text" className={INPUT_CLASSES} {...register('artist')} />
        {errors.artist && <p className="mt-1 text-xs text-red-600">{errors.artist.message}</p>}
      </div>

      <div>
        <label htmlFor="form-type" className="mb-1 block text-xs font-medium text-gray-500">
          Type
        </label>
        <select id="form-type" className={INPUT_CLASSES} {...register('type')}>
          {ARTWORK_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type.message}</p>}
      </div>

      <div>
        <label htmlFor="form-price" className="mb-1 block text-xs font-medium text-gray-500">
          Price
        </label>
        <input
          id="form-price"
          type="number"
          step="0.01"
          className={INPUT_CLASSES}
          {...register('price')}
        />
        {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
      </div>

      <label htmlFor="form-availability" className="flex items-center gap-2 text-sm text-gray-700">
        <input
          id="form-availability"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          {...register('availability')}
        />
        For sale
      </label>

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {mode === 'create' ? 'Add artwork' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
