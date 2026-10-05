import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDeleteArtwork } from '../hooks/useArtworkMutations';
import type { Artwork } from '../types/artwork';
import { ArtworkCard } from './ArtworkCard';

vi.mock('../hooks/useArtworkMutations');

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

function mockDeleteMutation(mutate: ReturnType<typeof vi.fn>) {
  return { mutate, isPending: false } as unknown as ReturnType<typeof useDeleteArtwork>;
}

describe('ArtworkCard delete flow', () => {
  it('opens a confirm dialog naming the artwork, and cancel does nothing', () => {
    const mutate = vi.fn();
    vi.mocked(useDeleteArtwork).mockReturnValue(mockDeleteMutation(mutate));

    render(<ArtworkCard artwork={artwork} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(
      screen.getByText(/"Sunset Over the Ocean" will be permanently removed/i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mutate).not.toHaveBeenCalled();
    expect(screen.queryByText(/delete artwork\?/i)).not.toBeInTheDocument();
  });

  it('calls the delete mutation with the artwork id on confirm', () => {
    const mutate = vi.fn();
    vi.mocked(useDeleteArtwork).mockReturnValue(mockDeleteMutation(mutate));

    render(<ArtworkCard artwork={artwork} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    expect(mutate).toHaveBeenCalledWith('1', expect.any(Object));
  });
});
