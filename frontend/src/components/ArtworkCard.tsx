import { useState } from 'react';
import { useDeleteArtwork } from '../hooks/useArtworkMutations';
import {
  getArtworkGradient,
  getArtworkImage,
  getArtworkInitials,
} from '../lib/artwork-placeholder';
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
  const imageSrc = getArtworkImage(artwork.type, artwork.id);

  return (
    <article className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all hover:shadow-md focus-within:border-green-500 focus-within:ring-4 focus-within:ring-green-500/40">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {imageSrc && !imageFailed ? (
          <img
            src={imageSrc}
            alt={`Example ${artwork.type} artwork`}
            className="h-full w-full object-contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className={`flex h-full items-center justify-center bg-gradient-to-br text-3xl font-bold text-white ${getArtworkGradient(artwork.type)}`}
          >
            {getArtworkInitials(artwork.title)}
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(artwork)}
            aria-label={`Edit ${artwork.title}`}
            className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-white"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            aria-label={`Delete ${artwork.title}`}
            className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow-sm hover:bg-white"
          >
            Delete
          </button>
        </div>

        <span
          className={`absolute bottom-2 left-2 rounded-full px-2 py-1 text-xs font-medium shadow-sm ${
            artwork.availability ? 'bg-white/90 text-green-700' : 'bg-white/90 text-gray-600'
          }`}
        >
          {artwork.availability ? 'For sale' : 'Exhibition only'}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate font-semibold text-gray-900">{artwork.title}</h3>
          <span className="shrink-0 font-bold text-gray-900">
            ${artwork.price.toLocaleString('en-US')}
          </span>
        </div>
        <p className="text-sm text-gray-500">By: {artwork.artist}</p>
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
