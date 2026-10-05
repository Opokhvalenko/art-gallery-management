import { useState } from 'react';
import { useDeleteArtwork } from '../hooks/useArtworkMutations';
import { getArtworkGradient, getArtworkInitials } from '../lib/artwork-placeholder';
import type { Artwork } from '../types/artwork';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface ArtworkCardProps {
  artwork: Artwork;
  onEdit: (artwork: Artwork) => void;
}

export function ArtworkCard({ artwork, onEdit }: ArtworkCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const deleteMutation = useDeleteArtwork();

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`flex h-40 items-center justify-center bg-gradient-to-br text-3xl font-bold text-white ${getArtworkGradient(artwork.type)}`}
      >
        {getArtworkInitials(artwork.title)}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold text-gray-900">{artwork.title}</h3>
          <div className="flex shrink-0 gap-2 text-xs font-medium">
            <button
              type="button"
              onClick={() => onEdit(artwork)}
              className="text-gray-500 hover:text-gray-900"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500">By: {artwork.artist}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-medium text-gray-900">
            ${artwork.price.toLocaleString('en-US')}
          </span>
          <span className={`text-xs ${artwork.availability ? 'text-green-600' : 'text-gray-400'}`}>
            {artwork.availability ? 'For sale' : 'Exhibition only'}
          </span>
        </div>
      </div>

      {isConfirmingDelete && (
        <ConfirmDialog
          title="Delete artwork?"
          message={`"${artwork.title}" will be permanently removed from the collection.`}
          confirmLabel="Delete"
          isConfirming={deleteMutation.isPending}
          onCancel={() => setIsConfirmingDelete(false)}
          onConfirm={() =>
            deleteMutation.mutate(artwork.id, { onSuccess: () => setIsConfirmingDelete(false) })
          }
        />
      )}
    </article>
  );
}
