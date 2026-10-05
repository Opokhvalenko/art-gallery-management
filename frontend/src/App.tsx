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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Toaster richColors position="top-right" />

      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">
            🎨
          </span>
          <span className="font-semibold text-gray-900">Art Gallery Manager</span>
        </div>
        <button
          type="button"
          onClick={() => setFormDialog({ mode: 'create' })}
          className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Add artwork
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-6">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Explore Our Collection</h1>

        <div className="mb-6">
          <ArtworkFilters filters={filters} onChange={setFilters} />
        </div>
        <ArtworkList
          queryParams={queryParams}
          onEdit={(artwork) => setFormDialog({ mode: 'edit', artwork })}
        />
      </main>

      <footer className="flex items-center justify-between gap-4 bg-gray-900 px-4 py-6 text-gray-300 sm:px-6">
        <div>
          <p className="font-semibold text-white">Art Gallery Manager</p>
          <p className="text-sm">
            Your go-to platform for managing and exploring exquisite art pieces.
          </p>
        </div>
        <div className="flex shrink-0 gap-3" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <title>Facebook</title>
            <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H7.9V12h2.6V9.8c0-2.6 1.5-4 3.9-4 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <title>Twitter</title>
            <path d="M22 5.9c-.7.3-1.5.6-2.3.7a4 4 0 0 0 1.8-2.2 8 8 0 0 1-2.5 1 4 4 0 0 0-6.9 3.6A11.4 11.4 0 0 1 3.9 4.6a4 4 0 0 0 1.2 5.3c-.6 0-1.2-.2-1.7-.5v.1a4 4 0 0 0 3.2 3.9c-.5.1-1.1.2-1.7.1a4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 17.5a11.3 11.3 0 0 0 6.1 1.8c7.3 0 11.3-6.1 11.3-11.3v-.5c.8-.5 1.4-1.2 1.9-2Z" />
          </svg>
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <title>Instagram</title>
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5ZM17.8 6.2a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z" />
          </svg>
        </div>
      </footer>

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
