import { getDb } from '../../utils/db';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler((event) => {
  requireAdmin(event);
  const id = getRouterParam(event, 'id');
  const db = getDb();

  try {
    const result = db.prepare('DELETE FROM employees WHERE id = ?').run(id);
    if (result.changes === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Empleado no encontrado' });
    }
  } catch (err: any) {
    if (String(err?.message || '').includes('FOREIGN KEY')) {
      throw createError({
        statusCode: 409,
        statusMessage: 'No se puede eliminar: el empleado tiene registros de asistencia. Desactívelo en su lugar.',
      });
    }
    throw err;
  }
  return { ok: true };
});
