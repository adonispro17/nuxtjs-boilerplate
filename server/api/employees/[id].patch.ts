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
  const db = getDb();

  const existing = db.prepare('SELECT id FROM employees WHERE id = ?').get(id);
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Empleado no encontrado' });
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.fullName !== undefined) {
    fields.push('full_name = ?');
    values.push(body.fullName.trim());
  }
  if (body.role !== undefined) {
    fields.push('role = ?');
    values.push(body.role.trim());
  }
  if (body.department !== undefined) {
    fields.push('department = ?');
    values.push(body.department.trim());
  }
  if (body.email !== undefined) {
    fields.push('email = ?');
    values.push(body.email.trim() || null);
  }
  if (body.biometricId !== undefined) {
    fields.push('biometric_id = ?');
    values.push(body.biometricId.trim() || null);
  }
  if (body.active !== undefined) {
    fields.push('active = ?');
    values.push(body.active ? 1 : 0);
  }

  if (fields.length === 0) {
    return { ok: true };
  }

  values.push(id);
  try {
    db.prepare(`UPDATE employees SET ${fields.join(', ')} WHERE id = ?`).run(...(values as any[]));
  } catch (err: any) {
    if (String(err?.message || '').includes('UNIQUE')) {
      throw createError({ statusCode: 409, statusMessage: 'El ID biométrico ya está en uso' });
    }
    throw err;
  }

  return { ok: true };
});
