import { getDb } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const from = typeof query.from === 'string' && query.from ? query.from : null;
  const to = typeof query.to === 'string' && query.to ? query.to : null;
  const employeeId = typeof query.employeeId === 'string' && query.employeeId ? query.employeeId : null;

  const db = await getDb();

  const records = await db`
    SELECT ar.id, ar.employee_id, e.full_name as employee_name,
           e.employee_code, e.department,
           ar.clock_in_at, ar.clock_out_at,
           ar.clock_in_source, ar.clock_out_source
    FROM attendance_records ar
    JOIN employees e ON e.id = ar.employee_id
    WHERE (${from}::text IS NULL OR ar.clock_in_at >= ${from}::date)
      AND (${to}::text IS NULL OR ar.clock_in_at < (${to}::date + interval '1 day'))
      AND (${employeeId}::text IS NULL OR ar.employee_id = ${employeeId}::text)
    ORDER BY ar.clock_in_at DESC
    LIMIT 1000
  `;

  return { records };
});
