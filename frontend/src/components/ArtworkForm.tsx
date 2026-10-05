import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ApiError } from '../api/http-client';
import { ARTWORK_TYPES } from '../constants/artwork';
import { useCreateArtwork, useUpdateArtwork } from '../hooks/useArtworkMutations';
import {
  type ArtworkFormInput,
  type ArtworkFormValues,
  artworkFormDefaults,
  artworkFormSchema,
} from '../schemas/artwork.schema';
import type { Artwork } from '../types/artwork';

const INPUT_CLASSES =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none';

function isFormField(field: string): field is keyof ArtworkFormValues {
  return field in artworkFormSchema.shape;
}

function errorId(field: keyof ArtworkFormValues): string {
  return `form-${field}-error`;
}

function FieldError({ field, message }: { field: keyof ArtworkFormValues; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={errorId(field)} className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

/** `artwork` exists exactly when editing — the type system enforces it, no casts needed. */
type ArtworkFormProps = { onClose: () => void } & (
  | { mode: 'create' }
  | { mode: 'edit'; artwork: Artwork }
);

export function ArtworkForm(props: ArtworkFormProps) {
  const { mode, onClose } = props;
  const artwork = props.mode === 'edit' ? props.artwork : undefined;
  const createMutation = useCreateArtwork();
  const updateMutation = useUpdateArtwork();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ArtworkFormInput, unknown, ArtworkFormValues>({
    resolver: zodResolver(artworkFormSchema),
    defaultValues: artwork
      ? {
          title: artwork.title,
          artist: artwork.artist,
          type: artwork.type,
          price: artwork.price,
          availability: artwork.availability,
        }
      : artworkFormDefaults,
  });

  /** Links an invalid input to its error text for screen readers. */
  const a11yProps = (field: keyof ArtworkFormValues) =>
    errors[field]
      ? { 'aria-invalid': true as const, 'aria-describedby': errorId(field) }
      : { 'aria-invalid': false as const };

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

    if (props.mode === 'edit') {
      updateMutation.mutate({ id: props.artwork.id, payload: values }, callbacks);
    } else {
      createMutation.mutate(values, callbacks);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
      <div>
        <label htmlFor="form-title" className="mb-1 block text-xs font-medium text-gray-500">
          Title
        </label>
        <input
          id="form-title"
          type="text"
          data-autofocus
          className={INPUT_CLASSES}
          {...a11yProps('title')}
          {...register('title')}
        />
        <FieldError field="title" message={errors.title?.message} />
      </div>

      <div>
        <label htmlFor="form-artist" className="mb-1 block text-xs font-medium text-gray-500">
          Artist
        </label>
        <input
          id="form-artist"
          type="text"
          className={INPUT_CLASSES}
          {...a11yProps('artist')}
          {...register('artist')}
        />
        <FieldError field="artist" message={errors.artist?.message} />
      </div>

      <div>
        <label htmlFor="form-type" className="mb-1 block text-xs font-medium text-gray-500">
          Type
        </label>
        <select
          id="form-type"
          className={INPUT_CLASSES}
          {...a11yProps('type')}
          {...register('type')}
        >
          {ARTWORK_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <FieldError field="type" message={errors.type?.message} />
      </div>

      <div>
        <label htmlFor="form-price" className="mb-1 block text-xs font-medium text-gray-500">
          Price
        </label>
        <input
          id="form-price"
          type="number"
          step="0.01"
          inputMode="decimal"
          className={INPUT_CLASSES}
          {...a11yProps('price')}
          {...register('price')}
        />
        <FieldError field="price" message={errors.price?.message} />
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
