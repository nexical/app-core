import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient, NexicalError } from '../../src/client.ts';

describe('ApiClient', () => {
  const baseUrl = 'https://api.example.com/';
  let client: ApiClient;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    client = new ApiClient({ baseUrl });
  });

  it('should strip trailing slash from baseUrl', () => {
    const clientWithSlash = new ApiClient({ baseUrl: 'https://example.com/' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((clientWithSlash as any).baseUrl).toBe('https://example.com');
  });

  it('should make a successful request', async () => {
    const mockResponse = { data: 'test' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    } as Response);

    const result = await client.request('GET', '/test');

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
      }),
    );
    expect(result).toEqual(mockResponse);
  });

  it('should include auth headers if strategy is provided', async () => {
    const authStrategy = {
      getHeaders: vi.fn().mockResolvedValue({ Authorization: 'Bearer token' }),
    };
    const authenticatedClient = new ApiClient({ baseUrl, authStrategy });

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await authenticatedClient.request('GET', '/test');

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token',
        }),
      }),
    );
  });

  it('should handle non-ok responses with JSON error data', async () => {
    const errorData = { message: 'Bad Request' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      text: async () => JSON.stringify(errorData),
    } as Response);

    await expect(client.request('GET', '/test')).rejects.toThrow(NexicalError);
  });

  it('should handle non-ok responses with plain text error data', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => 'Something went wrong',
    } as Response);

    try {
      await client.request('GET', '/test');
    } catch (error) {
      const err = error as NexicalError;
      expect(err).toBeInstanceOf(NexicalError);
      expect(err.status).toBe(500);
      expect(err.data).toBe('Something went wrong');
    }
  });

  it('should return empty object for 204 No Content', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 204,
      statusText: 'No Content',
    } as Response);

    const result = await client.request('DELETE', '/test');
    expect(result).toEqual({});
  });

  it('should allow overriding headers', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await client.request('GET', '/test', null, {
      headers: { 'X-Custom': 'value' },
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Custom': 'value',
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('should handle request body', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    const body = { foo: 'bar' };
    await client.request('POST', '/test', body);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify(body),
      }),
    );
  });

  it('should not override credentials if already set', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await client.request('GET', '/test', null, {
      credentials: 'omit',
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        credentials: 'omit',
      }),
    );
  });
});

describe('NexicalError', () => {
  it('should use error message from data.error if available', () => {
    const error = new NexicalError(400, 'Bad Request', { error: 'Detailed error' });
    expect(error.message).toBe('Detailed error');
  });

  it('should use error message from data.message if available', () => {
    const error = new NexicalError(400, 'Bad Request', { message: 'Internal message' });
    expect(error.message).toBe('Internal message');
  });

  it('should fallback to statusText if no data message found', () => {
    const error = new NexicalError(400, 'Bad Request', {});
    expect(error.message).toBe('Bad Request');
  });
});
