// src/config/test-redis.ts
import { redis } from './redis';

async function main() {
  await redis.set('ping', 'pong');
  const val = await redis.get('ping');
  console.log('Redis ping =', val);
  process.exit(0);
}

main().catch((err) => {
  console.error('Redis test failed', err);
  process.exit(1);
});
