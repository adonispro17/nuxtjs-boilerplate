import { getDb } from '../../utils/db';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler((event) => {
  requireAdmin(event);
  const id = getRouterParam(event, 'id');
  const db = getDb();
  const result = db.prepare('DELETE FROM devices WHERE id = ?').run(id);
  if (result.changes === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Dispositivo no encontrado' });
  }
  return { ok: true };
});
