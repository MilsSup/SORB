import { afterAll, afterEach, expect, it, vi } from 'vitest';
import { buildApp } from './app.js';
import { prisma } from './lib/prisma.js';

const app = buildApp();
afterEach(() => vi.restoreAllMocks());
afterAll(() => prisma.$disconnect());

it('serves health without requiring a database connection', async () => {
  const query = vi.spyOn(prisma, '$queryRaw');
  const response = await app.request('/health');
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok', service: 'sorb-api' });
  expect(query).not.toHaveBeenCalled();
});

it('allows the configured frontend origin', async () => {
  const response = await app.request('/health', {
    method: 'OPTIONS',
    headers: {
      origin: 'http://localhost:5173',
      'access-control-request-method': 'GET',
    },
  });
  expect(response.status).toBe(204);
  expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
});

it('does not allow an unconfigured frontend origin', async () => {
  const response = await app.request('/health', {
    headers: { origin: 'https://untrusted.example' },
  });
  expect(response.headers.get('access-control-allow-origin')).not.toBe('https://untrusted.example');
});

it('reports readiness when the database query succeeds', async () => {
  vi.spyOn(prisma, '$queryRaw').mockResolvedValue([{ result: 1 }]);
  const response = await app.request('/ready');
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ status: 'ok', database: 'connected' });
});

it('returns 503 without exposing database errors when the query fails', async () => {
  vi.spyOn(prisma, '$queryRaw').mockRejectedValue(new Error('private database details'));
  const response = await app.request('/ready');
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ status: 'unavailable', database: 'disconnected' });
});

it('documents both readiness outcomes in OpenAPI', async () => {
  const response = await app.request('/openapi.json');
  expect(response.status).toBe(200);
  const document = await response.json();
  expect(document.info.title).toBe('SORB API');
  expect(document.paths['/health'].get.responses).toHaveProperty('200');
  expect(document.paths['/ready'].get.responses).toHaveProperty('200');
  expect(document.paths['/ready'].get.responses).toHaveProperty('503');
});
