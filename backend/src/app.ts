import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config.js';
import { prisma } from './lib/prisma.js';

export function buildApp() {
  const app = Fastify({ logger: config.NODE_ENV !== 'test' });
  app.register(cors, { origin: config.CORS_ORIGIN });
  app.get('/health', async () => ({ status: 'ok', service: 'sorb-api' }));
  app.get('/ready', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      app.log.error(error, 'Database readiness check failed');
      return reply.code(503).send({ status: 'unavailable', database: 'disconnected' });
    }
  });
  app.addHook('onClose', async () => { await prisma.$disconnect(); });
  return app;
}
