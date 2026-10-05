import { getArtworkGradient, getArtworkInitials } from '../lib/artwork-placeholder';
import type { Artwork } from '../types/artwork';

interface ArtworkCardProps {
  artwork: Artwork;
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div
        className={`flex h-40 items-center justify-center bg-gradient-to-br text-3xl font-bold text-white ${getArtworkGradient(artwork.type)}`}
      >
        {getArtworkInitials(artwork.title)}
      </div>
      <div className="p-4">
        <h3 className="truncate font-semibold text-gray-900">{artwork.title}</h3>
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
    </article>
  );
}
