import type { UseQueryResult } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDeleteArtwork } from '../hooks/useArtworkMutations';
import { useArtworksQuery } from '../hooks/useArtworks';
import type { Artwork } from '../types/artwork';
import { ArtworkList } from './ArtworkList';

vi.mock('../hooks/useArtworks');
vi.mock('../hooks/useArtworkMutations');

const mockedUseArtworksQuery = vi.mocked(useArtworksQuery);
vi.mocked(useDeleteArtwork).mockReturnValue({
  mutate: vi.fn(),
  isPending: false,
} as unknown as ReturnType<typeof useDeleteArtwork>);

function mockQueryResult(
  partial: Partial<UseQueryResult<Artwork[], Error>>,
): UseQueryResult<Artwork[], Error> {
  return partial as UseQueryResult<Artwork[], Error>;
}

const artwork: Artwork = {
  id: '1',
  title: 'Sunset Over the Ocean',
  artist: 'Claude Monet',
  type: 'painting',
  price: 4500,
  availability: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ArtworkList', () => {
  it('shows skeleton placeholders while the query is pending', () => {
    mockedUseArtworksQuery.mockReturnValue(
      mockQueryResult({ isPending: true, isError: false, data: undefined, refetch: vi.fn() }),
    );

    const { container } = render(<ArtworkList queryParams={{}} onEdit={vi.fn()} />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });

  it('explains a slow first load (sleeping free-tier API) instead of only showing skeletons', () => {
    vi.useFakeTimers();
    mockedUseArtworksQuery.mockReturnValue(
      mockQueryResult({ isPending: true, isError: false, data: undefined, refetch: vi.fn() }),
    );

    render(<ArtworkList queryParams={{}} onEdit={vi.fn()} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByRole('status')).toHaveTextContent(/waking up the server/i);
    vi.useRealTimers();
  });

  it('shows the error state with the message and a working retry button', () => {
    const refetch = vi.fn();
    mockedUseArtworksQuery.mockReturnValue(
      mockQueryResult({
        isPending: false,
        isError: true,
        data: undefined,
        error: new Error('Network down'),
        refetch,
      }),
    );

    render(<ArtworkList queryParams={{}} onEdit={vi.fn()} />);

    expect(screen.getByText(/network down/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state when the query resolves with no artworks', () => {
    mockedUseArtworksQuery.mockReturnValue(
      mockQueryResult({ isPending: false, isError: false, data: [], refetch: vi.fn() }),
    );

    render(<ArtworkList queryParams={{ type: 'sculpture' }} onEdit={vi.fn()} />);

    expect(screen.getByText(/no artworks match your filters/i)).toBeInTheDocument();
  });

  it('invites adding the first artwork when the collection itself is empty', () => {
    mockedUseArtworksQuery.mockReturnValue(
      mockQueryResult({ isPending: false, isError: false, data: [], refetch: vi.fn() }),
    );

    render(<ArtworkList queryParams={{}} onEdit={vi.fn()} />);

    expect(screen.getByText(/collection is empty/i)).toBeInTheDocument();
  });

  it('renders a card per artwork on success', () => {
    mockedUseArtworksQuery.mockReturnValue(
      mockQueryResult({ isPending: false, isError: false, data: [artwork], refetch: vi.fn() }),
    );

    render(<ArtworkList queryParams={{}} onEdit={vi.fn()} />);

    expect(screen.getByText('Sunset Over the Ocean')).toBeInTheDocument();
  });
});
