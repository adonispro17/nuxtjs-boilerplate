import { getDb } from '../../utils/db';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler((event) => {
  requireAdmin(event);
  const db = getDb();
  const devices = db
    .prepare(
      `SELECT id, name, location, api_key as apiKey, last_seen_at as lastSeenAt, created_at as createdAt
       FROM devices ORDER BY created_at DESC`
    )
    .all();
  return { devices };
});
