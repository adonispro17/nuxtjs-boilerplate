import { getDb } from '../../utils/db';

export default defineEventHandler(() => {
  const db = getDb();
  const employees = db
    .prepare(
      `SELECT id, employee_code as employeeCode, full_name as fullName, role, department,
              email, biometric_id as biometricId, active, created_at as createdAt
       FROM employees ORDER BY full_name ASC`
    )
    .all();
  return { employees };
});
