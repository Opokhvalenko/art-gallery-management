import type {
  Artwork,
  ArtworkQueryParams,
  CreateArtworkPayload,
  UpdateArtworkPayload,
} from '../types/artwork';
import { httpClient } from './http-client';

function buildQueryString(params: ArtworkQueryParams): string {
  const search = new URLSearchParams();
  if (params.price) {
    search.set('price', params.price);
  }
  if (params.artist) {
    search.set('artist', params.artist);
  }
  if (params.type) {
    search.set('type', params.type);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function getArtworks(params: ArtworkQueryParams = {}): Promise<Artwork[]> {
  return httpClient.get<Artwork[]>(`/artworks${buildQueryString(params)}`);
}

export function getArtwork(id: string): Promise<Artwork> {
  return httpClient.get<Artwork>(`/artworks/${id}`);
}

export function createArtwork(payload: CreateArtworkPayload): Promise<Artwork> {
  return httpClient.post<Artwork>('/artworks', payload);
}

export function updateArtwork(id: string, payload: UpdateArtworkPayload): Promise<Artwork> {
  return httpClient.put<Artwork>(`/artworks/${id}`, payload);
}

export function deleteArtwork(id: string): Promise<void> {
  return httpClient.delete(`/artworks/${id}`);
}
