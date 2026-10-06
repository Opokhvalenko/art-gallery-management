import { useState } from 'react';
import { useDeleteArtwork } from '../hooks/useArtworkMutations';
import {
  getArtworkGradient,
  getArtworkImage,
  getArtworkInitials,
} from '../lib/artwork-placeholder';
import { formatPrice } from '../lib/format';
import type { Artwork } from '../types/artwork';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface ArtworkCardProps {
  artwork: Artwork;
  onEdit: (artwork: Artwork) => void;
}

export function ArtworkCard({ artwork, onEdit }: ArtworkCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const deleteMutation = useDeleteArtwork();
  const imageSrc = getArtworkImage(artwork.title);

  return (
    <article className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:shadow-md focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/40">
      <div className="aspect-video overflow-hidden bg-gray-100">
        {imageSrc && !imageFailed ? (
          <img
            src={imageSrc}
            alt={`${artwork.title} by ${artwork.artist}`}
            className="h-full w-full object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className={`flex h-full items-center justify-center bg-linear-to-br text-3xl font-bold text-white ${getArtworkGradient(artwork.type)}`}
          >
            {getArtworkInitials(artwork.title)}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="truncate font-semibold text-gray-900" title={artwork.title}>
            {artwork.title}
          </h2>
          <span className="shrink-0 font-bold text-gray-900">{formatPrice(artwork.price)}</span>
        </div>
        <p className="text-sm text-gray-500">
          <span className="capitalize">{artwork.type}</span> · By: {artwork.artist}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${
              artwork.availability ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {artwork.availability ? 'For sale' : 'Exhibition only'}
          </span>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onEdit(artwork)}
              aria-label={`Edit ${artwork.title}`}
              className="min-h-9 rounded-md px-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              aria-label={`Delete ${artwork.title}`}
              className="min-h-9 rounded-md px-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {isConfirmingDelete && (
        <ConfirmDialog
          title="Delete artwork?"
          message={`"${artwork.title}" will be permanently removed from the collection.`}
          confirmLabel="Delete"
          isConfirming={deleteMutation.isPending}
          onCancel={() => setIsConfirmingDelete(false)}
          onConfirm={() => deleteMutation.mutate(artwork.id)}
        />
      )}
    </article>
  );
}
