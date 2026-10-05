import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCreateArtwork, useUpdateArtwork } from '../hooks/useArtworkMutations';
import type { Artwork } from '../types/artwork';
import { ArtworkForm } from './ArtworkForm';

vi.mock('../hooks/useArtworkMutations');

function mockCreateMutation(mutate: ReturnType<typeof vi.fn>) {
  return { mutate, isPending: false } as unknown as ReturnType<typeof useCreateArtwork>;
}

function mockUpdateMutation(mutate: ReturnType<typeof vi.fn>) {
  return { mutate, isPending: false } as unknown as ReturnType<typeof useUpdateArtwork>;
}

const artwork: Artwork = {
  id: '1',
  title: 'Sunset Over the Ocean',
  artist: 'Claude Monet',
  type: 'painting',
  price: 4500,
  availability: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ArtworkForm', () => {
  it('shows validation errors and does not call the mutation when required fields are empty', async () => {
    const createMutate = vi.fn();
    vi.mocked(useCreateArtwork).mockReturnValue(mockCreateMutation(createMutate));
    vi.mocked(useUpdateArtwork).mockReturnValue(mockUpdateMutation(vi.fn()));

    render(<ArtworkForm mode="create" onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /add artwork/i }));

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Artist is required')).toBeInTheDocument();
    expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();
  });

  it('pre-fills every field in edit mode', () => {
    vi.mocked(useCreateArtwork).mockReturnValue(mockCreateMutation(vi.fn()));
    vi.mocked(useUpdateArtwork).mockReturnValue(mockUpdateMutation(vi.fn()));

    render(<ArtworkForm mode="edit" artwork={artwork} onClose={vi.fn()} />);

    expect(screen.getByLabelText('Title')).toHaveValue('Sunset Over the Ocean');
    expect(screen.getByLabelText('Artist')).toHaveValue('Claude Monet');
    expect(screen.getByLabelText('Price')).toHaveValue(4500);
    expect(screen.getByLabelText('For sale')).not.toBeChecked();
  });

  it('submits the update mutation with the edited values', async () => {
    const updateMutate = vi.fn();
    vi.mocked(useCreateArtwork).mockReturnValue(mockCreateMutation(vi.fn()));
    vi.mocked(useUpdateArtwork).mockReturnValue(mockUpdateMutation(updateMutate));

    render(<ArtworkForm mode="edit" artwork={artwork} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '5000' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(updateMutate).toHaveBeenCalledTimes(1));
    expect(updateMutate).toHaveBeenCalledWith(
      { id: '1', payload: expect.objectContaining({ price: 5000 }) },
      expect.any(Object),
    );
  });
});
