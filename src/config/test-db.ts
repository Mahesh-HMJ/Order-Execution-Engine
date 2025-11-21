// src/config/test-db.ts
import { db } from './database';

async function main() {
  const result = await db.query('SELECT NOW()');
  console.log(result.rows);
  process.exit(0);
}

main().catch((err) => {
  console.error('DB test failed', err);
  process.exit(1);
});
