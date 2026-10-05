import { ARTWORK_TYPES } from '../constants/artwork';

export interface ArtworkFiltersState {
  artist: string;
  type: string;
  price: '' | 'asc' | 'desc';
}

interface ArtworkFiltersProps {
  filters: ArtworkFiltersState;
  onChange: (next: ArtworkFiltersState) => void;
}

const SELECT_CLASSES =
  'rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none';

export function ArtworkFilters({ filters, onChange }: ArtworkFiltersProps) {
  const hasActiveFilters = filters.artist !== '' || filters.type !== '' || filters.price !== '';

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="artist-filter" className="text-xs font-medium text-gray-500">
          Artist
        </label>
        <input
          id="artist-filter"
          type="text"
          placeholder="Search by artist..."
          value={filters.artist}
          onChange={(event) => onChange({ ...filters, artist: event.target.value })}
          className={`${SELECT_CLASSES} w-48`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="type-filter" className="text-xs font-medium text-gray-500">
          Type
        </label>
        <select
          id="type-filter"
          value={filters.type}
          onChange={(event) => onChange({ ...filters, type: event.target.value })}
          className={SELECT_CLASSES}
        >
          <option value="">All types</option>
          {ARTWORK_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="price-sort" className="text-xs font-medium text-gray-500">
          Sort by price
        </label>
        <select
          id="price-sort"
          value={filters.price}
          onChange={(event) =>
            onChange({ ...filters, price: event.target.value as ArtworkFiltersState['price'] })
          }
          className={SELECT_CLASSES}
        >
          <option value="">Default</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onChange({ artist: '', type: '', price: '' })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
