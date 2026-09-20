import { randomBytes } from 'node:crypto';
import { getDb, newId } from '../../utils/db';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readBody<{ name?: string; location?: string }>(event);

  const name = body?.name?.trim();
  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'El nombre del dispositivo es requerido' });
  }

  const db = await getDb();
  const id = newId();
  const apiKey = randomBytes(24).toString('hex');

  await db`
    INSERT INTO devices (id, name, location, api_key)
    VALUES (${id}, ${name}, ${body.location?.trim() || null}, ${apiKey})
  `;

  return { id, apiKey };
});
