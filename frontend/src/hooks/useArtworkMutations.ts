import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createArtwork, deleteArtwork, updateArtwork } from '../api/artworks';
import { ApiError } from '../api/http-client';
import type { Artwork, CreateArtworkPayload, UpdateArtworkPayload } from '../types/artwork';

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

interface DeleteContext {
  previousQueries: [readonly unknown[], Artwork[] | undefined][];
}

export function useDeleteArtwork() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, string, DeleteContext>({
    mutationFn: (id: string) => deleteArtwork(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['artworks'] });
      const previousQueries = queryClient.getQueriesData<Artwork[]>({ queryKey: ['artworks'] });

      for (const [queryKey, data] of previousQueries) {
        if (data) {
          queryClient.setQueryData<Artwork[]>(
            queryKey,
            data.filter((artwork) => artwork.id !== id),
          );
        }
      }

      return { previousQueries };
    },
    onError: (error, _id, context) => {
      for (const [queryKey, data] of context?.previousQueries ?? []) {
        queryClient.setQueryData(queryKey, data);
      }
      toast.error(errorMessage(error));
    },
    onSuccess: () => {
      toast.success('Artwork deleted');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
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
