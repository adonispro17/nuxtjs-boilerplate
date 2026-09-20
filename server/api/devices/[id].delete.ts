import { getDb } from '../../utils/db';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = getRouterParam(event, 'id');
  const db = await getDb();
  const result = await db`DELETE FROM devices WHERE id = ${id}`;
  if (result.count === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Dispositivo no encontrado' });
  }
  return { ok: true };
});
