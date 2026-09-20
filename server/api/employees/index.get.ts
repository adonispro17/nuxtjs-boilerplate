import { getDb } from '../../utils/db';

export default defineEventHandler(async () => {
  const db = await getDb();
  const employees = await db`
    SELECT id, employee_code, full_name, role, department, email, biometric_id, active, created_at
    FROM employees ORDER BY full_name ASC
  `;
  return { employees };
});
