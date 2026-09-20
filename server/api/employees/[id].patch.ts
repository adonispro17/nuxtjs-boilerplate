import { getDb } from '../../utils/db';
import { requireAdmin } from '../../utils/auth';

interface EmployeeInput {
  fullName?: string;
  role?: string;
  department?: string;
  email?: string;
  biometricId?: string;
  active?: boolean;
}

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const id = getRouterParam(event, 'id');
  const body = await readBody<EmployeeInput>(event);
  const db = await getDb();

  const existing = await db`SELECT id FROM employees WHERE id = ${id}`;
  if (!existing[0]) {
    throw createError({ statusCode: 404, statusMessage: 'Empleado no encontrado' });
  }

  const updates: Record<string, unknown> = {};
  if (body.fullName !== undefined) updates.full_name = body.fullName.trim();
  if (body.role !== undefined) updates.role = body.role.trim();
  if (body.department !== undefined) updates.department = body.department.trim();
  if (body.email !== undefined) updates.email = body.email.trim() || null;
  if (body.biometricId !== undefined) updates.biometric_id = body.biometricId.trim() || null;
  if (body.active !== undefined) updates.active = Boolean(body.active);

  const keys = Object.keys(updates);
  if (keys.length === 0) {
    return { ok: true };
  }

  try {
    await db`UPDATE employees SET ${db(updates, ...(keys as [string, ...string[]]))} WHERE id = ${id}`;
  } catch (err: any) {
    if (err?.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'El ID biométrico ya está en uso' });
    }
    throw err;
  }

  return { ok: true };
});
