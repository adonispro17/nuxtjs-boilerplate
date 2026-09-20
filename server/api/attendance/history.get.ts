import { getDb } from '../../utils/db';

export default defineEventHandler((event) => {
  const query = getQuery(event);
  const from = typeof query.from === 'string' && query.from ? query.from : null;
  const to = typeof query.to === 'string' && query.to ? query.to : null;
  const employeeId = typeof query.employeeId === 'string' && query.employeeId ? query.employeeId : null;

  const db = getDb();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (from) {
    conditions.push('ar.clock_in_at >= ?');
    params.push(new Date(from).toISOString());
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    conditions.push('ar.clock_in_at <= ?');
    params.push(toDate.toISOString());
  }
  if (employeeId) {
    conditions.push('ar.employee_id = ?');
    params.push(employeeId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const records = db
    .prepare(
      `SELECT ar.id, ar.employee_id as employeeId, e.full_name as employeeName,
              e.employee_code as employeeCode, e.department as department,
              ar.clock_in_at as clockInAt, ar.clock_out_at as clockOutAt,
              ar.clock_in_source as clockInSource, ar.clock_out_source as clockOutSource
       FROM attendance_records ar
       JOIN employees e ON e.id = ar.employee_id
       ${where}
       ORDER BY ar.clock_in_at DESC
       LIMIT 1000`
    )
    .all(...(params as any[]));

  return { records };
});
