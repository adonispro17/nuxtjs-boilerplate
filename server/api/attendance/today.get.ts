import { getDb } from '../../utils/db';

export default defineEventHandler(() => {
  const db = getDb();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const records = db
    .prepare(
      `SELECT ar.id, ar.employee_id as employeeId, e.full_name as employeeName,
              e.employee_code as employeeCode, ar.clock_in_at as clockInAt,
              ar.clock_out_at as clockOutAt, ar.clock_in_source as clockInSource,
              ar.clock_out_source as clockOutSource
       FROM attendance_records ar
       JOIN employees e ON e.id = ar.employee_id
       WHERE ar.clock_in_at >= ?
       ORDER BY ar.clock_in_at DESC`
    )
    .all(startOfDay.toISOString());

  return { records };
});
