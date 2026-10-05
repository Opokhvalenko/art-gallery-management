import { ArtworkList } from './components/ArtworkList';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Art Gallery Manager</h1>
        <p className="text-sm text-gray-500">Explore Our Collection</p>
      </header>

      <main className="p-6">
        <ArtworkList queryParams={{}} />
      </main>
    </div>
  );
}

export default App;
