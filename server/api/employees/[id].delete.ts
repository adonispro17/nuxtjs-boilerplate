import { getDb } from '../../utils/db';
import { requireAdmin } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = getRouterParam(event, 'id');
  const db = await getDb();

  try {
    const result = await db`DELETE FROM employees WHERE id = ${id}`;
    if (result.count === 0) {
      throw createError({ statusCode: 404, statusMessage: 'Empleado no encontrado' });
    }
  } catch (err: any) {
    if (err?.code === '23503') {
      throw createError({
        statusCode: 409,
        statusMessage: 'No se puede eliminar: el empleado tiene registros de asistencia. Desactívelo en su lugar.',
      });
    }
    throw err;
  }
  return { ok: true };
});
