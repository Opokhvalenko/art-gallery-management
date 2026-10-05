import { useArtworksQuery } from './hooks/useArtworks';

/**
 * Temporary sanity check that the API layer + TanStack Query wiring
 * actually works end to end against the real backend. The real UI
 * (list, card, 4 states, filters, form...) lands in the following
 * branches — this file gets replaced there.
 */
function App() {
  const { data, isPending, isError, error } = useArtworksQuery({});

  if (isPending) {
    return <p className="p-6 text-gray-500">Loading artworks…</p>;
  }

  if (isError) {
    return <p className="p-6 text-red-600">Failed to load artworks: {error.message}</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold text-gray-900">Art Gallery ({data.length})</h1>
      <ul className="mt-4 space-y-1">
        {data.map((artwork) => (
          <li key={artwork.id} className="text-gray-700">
            {artwork.title} — {artwork.artist} (${artwork.price})
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
