import { serve } from '@hono/node-server';
import { buildApp } from './app.js';
import { config } from './config.js';
import { prisma } from './lib/prisma.js';

const app = buildApp();
const server = serve({
  fetch: app.fetch,
  hostname: config.HOST,
  port: config.PORT,
}, (info) => {
  console.log(`SORB API: http://${config.HOST}:${info.port}`);
  console.log(`Swagger: http://${config.HOST}:${info.port}/swagger`);
});

let closing = false;
function shutdown(error?: Error) {
  if (closing) return;
  closing = true;
  if (error) {
    console.error(error);
    process.exitCode = 1;
  }
  const timeout = setTimeout(() => process.exit(1), 10_000);
  timeout.unref();
  server.close(() => {
    void prisma.$disconnect().catch((disconnectError: unknown) => {
      console.error(disconnectError);
      process.exitCode = 1;
    }).finally(() => clearTimeout(timeout));
  });
}

server.on('error', shutdown);
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => shutdown());
}
