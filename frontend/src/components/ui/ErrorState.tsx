interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
      <p className="text-red-600">Failed to load artworks: {message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Retry
      </button>
    </div>
  );
}
