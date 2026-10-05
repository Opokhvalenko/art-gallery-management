import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { getArtworks } from '../api/artworks';
import type { Artwork, ArtworkQueryParams } from '../types/artwork';

export const artworksQueryKey = (params: ArtworkQueryParams) => ['artworks', params] as const;

export function useArtworksQuery(params: ArtworkQueryParams): UseQueryResult<Artwork[], Error> {
  return useQuery({
    queryKey: artworksQueryKey(params),
    queryFn: () => getArtworks(params),
  });
}
