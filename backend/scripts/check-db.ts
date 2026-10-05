import { prisma } from '../src/lib/prisma.js';

try {
  await prisma.$queryRaw`SELECT 1`;
  console.log('PostgreSQL connection: OK');
  console.log(`Users table: OK (${await prisma.user.count()} rows)`);
} finally {
  await prisma.$disconnect();
}
