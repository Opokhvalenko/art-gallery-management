interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
