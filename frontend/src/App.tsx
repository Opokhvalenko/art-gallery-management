import { useState } from 'react';
import { Toaster } from 'sonner';
import { ArtworkFilters, type ArtworkFiltersState } from './components/ArtworkFilters';
import { ArtworkForm } from './components/ArtworkForm';
import { ArtworkList } from './components/ArtworkList';
import { Modal } from './components/ui/Modal';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import type { Artwork, ArtworkQueryParams } from './types/artwork';

const ARTIST_DEBOUNCE_MS = 350;

const EMPTY_FILTERS: ArtworkFiltersState = { artist: '', type: '', price: '' };

type FormDialogState = { mode: 'create' } | { mode: 'edit'; artwork: Artwork } | null;

function App() {
  const [filters, setFilters] = useState<ArtworkFiltersState>(EMPTY_FILTERS);
  const [formDialog, setFormDialog] = useState<FormDialogState>(null);
  const debouncedArtist = useDebouncedValue(filters.artist, ARTIST_DEBOUNCE_MS);

  const queryParams: ArtworkQueryParams = {
    artist: debouncedArtist || undefined,
    type: filters.type || undefined,
    price: filters.price || undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster richColors position="top-right" />

      <header className="flex flex-col gap-3 border-b border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Art Gallery Manager</h1>
          <p className="text-sm text-gray-500">Explore Our Collection</p>
        </div>
        <button
          type="button"
          onClick={() => setFormDialog({ mode: 'create' })}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add artwork
        </button>
      </header>

      <main className="p-4 sm:p-6">
        <div className="mb-6">
          <ArtworkFilters filters={filters} onChange={setFilters} />
        </div>
        <ArtworkList
          queryParams={queryParams}
          onEdit={(artwork) => setFormDialog({ mode: 'edit', artwork })}
        />
      </main>

      {formDialog && (
        <Modal
          title={formDialog.mode === 'create' ? 'Add artwork' : 'Edit artwork'}
          onClose={() => setFormDialog(null)}
        >
          <ArtworkForm
            mode={formDialog.mode}
            artwork={formDialog.mode === 'edit' ? formDialog.artwork : undefined}
            onClose={() => setFormDialog(null)}
          />
        </Modal>
      )}
    </div>
  );
}

export default App;
