import type { ApiErrorBody, ApiErrorDetail } from '../types/artwork';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];

  constructor(status: number, code: string, message: string, details: ApiErrorDetail[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && 'error' in value;
}

const HttpStatus = { NoContent: 204 } as const;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (response.status === HttpStatus.NoContent) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message, body.error.details);
    }
    throw new ApiError(response.status, 'UNKNOWN_ERROR', 'Request failed');
  }

  return body as T;
}

export const httpClient = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, data: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown): Promise<T> =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (path: string): Promise<void> => request<void>(path, { method: 'DELETE' }),
};
