import { useArtworksQuery } from '../hooks/useArtworks';
import { useDelayedFlag } from '../hooks/useDelayedFlag';
import type { Artwork, ArtworkQueryParams } from '../types/artwork';
import { ArtworkCard } from './ArtworkCard';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { Skeleton } from './ui/Skeleton';

const SKELETON_COUNT = 4;

/** After this long, a first load is most likely the free-tier API waking up, not a hang. */
const SLOW_LOAD_HINT_MS = 4000;

const GRID_CLASSES = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4';

interface ArtworkListProps {
  queryParams: ArtworkQueryParams;
  onEdit: (artwork: Artwork) => void;
}

export function ArtworkList({ queryParams, onEdit }: ArtworkListProps) {
  const { data, isPending, isError, error, refetch } = useArtworksQuery(queryParams);
  const isSlowLoad = useDelayedFlag(isPending, SLOW_LOAD_HINT_MS);

  if (isPending) {
    return (
      <div>
        {isSlowLoad && (
          <p role="status" className="mb-4 text-sm text-gray-500">
            Waking up the server — the free hosting plan sleeps when idle, so the first load can
            take up to a minute.
          </p>
        )}
        <div className={GRID_CLASSES}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list, never reordered
            <Skeleton key={index} className="h-56 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  if (data.length === 0) {
    const hasFilters = Boolean(queryParams.artist || queryParams.type);
    return (
      <EmptyState
        message={
          hasFilters
            ? 'No artworks match your filters.'
            : 'The collection is empty — add the first artwork.'
        }
      />
    );
  }

  return (
    <div className={GRID_CLASSES}>
      {data.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} onEdit={onEdit} />
      ))}
    </div>
  );
}
