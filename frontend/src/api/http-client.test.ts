import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, httpClient } from './http-client';

describe('httpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('turns a network failure into a readable NETWORK_ERROR', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const error = await httpClient.get('/artworks').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).code).toBe('NETWORK_ERROR');
    expect((error as ApiError).message).toMatch(/can't reach the server/i);
  });

  it('lets an aborted request propagate as AbortError, not as a network error', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

    await expect(httpClient.get('/artworks')).rejects.toBe(abortError);
  });
});
