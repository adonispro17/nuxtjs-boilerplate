import { getDb } from '../../utils/db';

export default defineEventHandler(async () => {
  const db = await getDb();

  const records = await db`
    SELECT ar.id, ar.employee_id, e.full_name as employee_name,
           e.employee_code, ar.clock_in_at, ar.clock_out_at,
           ar.clock_in_source, ar.clock_out_source
    FROM attendance_records ar
    JOIN employees e ON e.id = ar.employee_id
    WHERE ar.clock_in_at >= date_trunc('day', now())
    ORDER BY ar.clock_in_at DESC
  `;

  return { records };
});
