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

  it('sends Content-Type only with a body, so a GET stays a simple (non-preflighted) CORS request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await httpClient.get('/artworks');
    await httpClient.post('/artworks', { title: 'x' });

    expect(fetchMock.mock.calls[0][1].headers).toBeUndefined();
    expect(fetchMock.mock.calls[1][1].headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('lets an aborted request propagate as AbortError, not as a network error', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

    await expect(httpClient.get('/artworks')).rejects.toBe(abortError);
  });
});
