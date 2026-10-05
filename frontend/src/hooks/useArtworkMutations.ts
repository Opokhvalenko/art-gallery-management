import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createArtwork, updateArtwork } from '../api/artworks';
import { ApiError } from '../api/http-client';
import type { CreateArtworkPayload, UpdateArtworkPayload } from '../types/artwork';

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
}

export function useCreateArtwork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateArtworkPayload) => createArtwork(payload),
    onSuccess: (artwork) => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      toast.success(`"${artwork.title}" added to the collection`);
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}

export function useUpdateArtwork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateArtworkPayload }) =>
      updateArtwork(id, payload),
    onSuccess: (artwork) => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      toast.success(`"${artwork.title}" updated`);
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}
