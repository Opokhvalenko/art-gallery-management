import type { ArtworkType } from '../constants/artwork';

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  type: ArtworkType;
  price: number;
  availability: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArtworkPayload {
  title: string;
  artist: string;
  type: ArtworkType;
  price: number;
  availability?: boolean;
}

export type UpdateArtworkPayload = CreateArtworkPayload;

export interface ArtworkQueryParams {
  price?: 'asc' | 'desc';
  artist?: string;
  type?: string;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details: ApiErrorDetail[];
  };
}
