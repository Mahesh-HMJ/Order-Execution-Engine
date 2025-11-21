// tests/setup.ts
import { beforeAll, afterAll } from 'vitest';
import { db } from '../src/config/database';
import { redis } from '../src/config/redis';

beforeAll(async () => {
  // Clean up test data before tests
  await db.query('DELETE FROM orders WHERE token_in = $1', ['TEST']);
});

afterAll(async () => {
  // Clean up after tests
  await db.query('DELETE FROM orders WHERE token_in = $1', ['TEST']);
  await db.pool.end();
  redis.disconnect();
});
