import type { ApiErrorBody, ApiErrorDetail } from '../types/artwork';

/** Falls back to the backend's default local port if `.env` wasn't copied. */
const DEFAULT_API_URL = 'http://localhost:3000';
const API_BASE_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

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

const NETWORK_ERROR_MESSAGE = `Can't reach the server at ${API_BASE_URL}. Is the backend running?`;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      // Only requests with a JSON body need Content-Type — on a bodiless GET
      // or DELETE it would turn a simple CORS request into a preflighted one.
      headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
    });
  } catch (error: unknown) {
    // Cancellation (TanStack Query's `signal`) must propagate unchanged.
    if (isAbortError(error)) {
      throw error;
    }
    throw new ApiError(0, 'NETWORK_ERROR', NETWORK_ERROR_MESSAGE);
  }

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
  get: <T>(path: string, signal?: AbortSignal): Promise<T> => request<T>(path, { signal }),
  post: <T>(path: string, data: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown): Promise<T> =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (path: string): Promise<void> => request<void>(path, { method: 'DELETE' }),
};
