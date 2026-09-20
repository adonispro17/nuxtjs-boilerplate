import { getDb, newId } from '../../utils/db';
import { requireAdmin } from '../../utils/auth';

interface EmployeeInput {
  employeeCode?: string;
  fullName?: string;
  role?: string;
  department?: string;
  email?: string;
  biometricId?: string;
}

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = await readBody<EmployeeInput>(event);

  const employeeCode = body?.employeeCode?.trim();
  const fullName = body?.fullName?.trim();

  if (!employeeCode || !fullName) {
    throw createError({ statusCode: 400, statusMessage: 'employeeCode y fullName son requeridos' });
  }

  const db = await getDb();
  const id = newId();

  try {
    await db`
      INSERT INTO employees (id, employee_code, full_name, role, department, email, biometric_id, active)
      VALUES (
        ${id}, ${employeeCode}, ${fullName},
        ${body.role?.trim() || 'Enfermera/o'}, ${body.department?.trim() || 'Enfermería'},
        ${body.email?.trim() || null}, ${body.biometricId?.trim() || null}, true
      )
    `;
  } catch (err: any) {
    if (err?.code === '23505') {
      throw createError({
        statusCode: 409,
        statusMessage: 'El código de empleado o el ID biométrico ya existen',
      });
    }
    throw err;
  }

  return { id };
});
