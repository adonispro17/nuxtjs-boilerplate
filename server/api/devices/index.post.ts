import { randomBytes } from 'node:crypto';
import { getDb, newId, nowIso } from '../../utils/db';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readBody<{ name?: string; location?: string }>(event);

  const name = body?.name?.trim();
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'El nombre del dispositivo es requerido' });
  }

  const db = getDb();
  const id = newId();
  const apiKey = randomBytes(24).toString('hex');

  db.prepare(
    'INSERT INTO devices (id, name, location, api_key, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, name, body.location?.trim() || null, apiKey, nowIso());

  return { id, apiKey };
});
