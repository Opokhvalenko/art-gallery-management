import { useState } from 'react';
import { ArtworkFilters, type ArtworkFiltersState } from './components/ArtworkFilters';
import { ArtworkList } from './components/ArtworkList';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import type { ArtworkQueryParams } from './types/artwork';

const ARTIST_DEBOUNCE_MS = 350;

const EMPTY_FILTERS: ArtworkFiltersState = { artist: '', type: '', price: '' };

function App() {
  const [filters, setFilters] = useState<ArtworkFiltersState>(EMPTY_FILTERS);
  const debouncedArtist = useDebouncedValue(filters.artist, ARTIST_DEBOUNCE_MS);

  const queryParams: ArtworkQueryParams = {
    artist: debouncedArtist || undefined,
    type: filters.type || undefined,
    price: filters.price || undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Art Gallery Manager</h1>
        <p className="text-sm text-gray-500">Explore Our Collection</p>
      </header>

      <main className="p-6">
        <div className="mb-6">
          <ArtworkFilters filters={filters} onChange={setFilters} />
        </div>
        <ArtworkList queryParams={queryParams} />
      </main>
    </div>
  );
}

export default App;
