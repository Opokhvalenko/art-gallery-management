import { useArtworksQuery } from '../hooks/useArtworks';
import type { Artwork, ArtworkQueryParams } from '../types/artwork';
import { ArtworkCard } from './ArtworkCard';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { Skeleton } from './ui/Skeleton';

const SKELETON_COUNT = 4;

const GRID_CLASSES = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4';

interface ArtworkListProps {
  queryParams: ArtworkQueryParams;
  onEdit: (artwork: Artwork) => void;
}

export function ArtworkList({ queryParams, onEdit }: ArtworkListProps) {
  const { data, isPending, isError, error, refetch } = useArtworksQuery(queryParams);

  if (isPending) {
    return (
      <div className={GRID_CLASSES}>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list, never reordered
          <Skeleton key={index} className="h-56 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  if (data.length === 0) {
    return <EmptyState message="No artworks match your filters yet." />;
  }

  return (
    <div className={GRID_CLASSES}>
      {data.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} onEdit={onEdit} />
      ))}
    </div>
  );
}
