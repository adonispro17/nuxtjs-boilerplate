import { getDb } from '../../utils/db';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const db = await getDb();
  const devices = await db`
    SELECT id, name, location, api_key, last_seen_at, created_at
    FROM devices ORDER BY created_at DESC
  `;
  return { devices };
});
