import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { config } from './config.js';
import { prisma } from './lib/prisma.js';

export function buildApp() {
  const app = new OpenAPIHono();
  if (config.NODE_ENV !== 'test') app.use('*', logger());
  app.use('*', cors({ origin: config.CORS_ORIGIN }));

  app.openapi(createRoute({
    method: 'get',
    path: '/health',
    tags: ['System'],
    responses: {
      200: {
        description: 'API is running',
        content: { 'application/json': { schema: z.object({
          status: z.literal('ok'), service: z.literal('sorb-api'),
        }) } },
      },
    },
  }), (c) => c.json({ status: 'ok', service: 'sorb-api' } as const, 200));

  app.openapi(createRoute({
    method: 'get',
    path: '/ready',
    tags: ['System'],
    responses: {
      200: {
        description: 'PostgreSQL is available',
        content: { 'application/json': { schema: z.object({
          status: z.literal('ok'), database: z.literal('connected'),
        }) } },
      },
      503: {
        description: 'PostgreSQL is unavailable',
        content: { 'application/json': { schema: z.object({
          status: z.literal('unavailable'), database: z.literal('disconnected'),
        }) } },
      },
    },
  }), async (c) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return c.json({ status: 'ok', database: 'connected' } as const, 200);
    } catch (error) {
      if (config.NODE_ENV !== 'test') console.error('Database readiness check failed', error);
      return c.json({ status: 'unavailable', database: 'disconnected' } as const, 503);
    }
  });
  app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: { title: 'SORB API', version: '0.1.0' },
  });
  app.get('/swagger', swaggerUI({ url: '/openapi.json' }));
  return app;
}
