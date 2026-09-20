import { getDb, newId, nowIso } from './db';

export type AttendanceSource = 'manual' | 'biometric';
export type AttendanceType = 'in' | 'out';

interface OpenRecord {
  id: string;
  clockInAt: string;
}

function getOpenRecord(employeeId: string): OpenRecord | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, clock_in_at as clockInAt FROM attendance_records
       WHERE employee_id = ? AND clock_out_at IS NULL
       ORDER BY clock_in_at DESC LIMIT 1`
    )
    .get(employeeId) as OpenRecord | undefined;
  return row || null;
}

export function findEmployeeByBiometricId(biometricId: string) {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, full_name as fullName, employee_code as employeeCode, active
       FROM employees WHERE biometric_id = ?`
    )
    .get(biometricId) as
    | { id: string; fullName: string; employeeCode: string; active: number }
    | undefined;
}

export function registerAttendanceEvent(params: {
  employeeId: string;
  source: AttendanceSource;
  deviceId?: string | null;
  type?: AttendanceType;
  notes?: string | null;
}) {
  const db = getDb();
  const { employeeId, source, deviceId = null, notes = null } = params;
  const open = getOpenRecord(employeeId);
  const requestedType = params.type;

  if (requestedType === 'in' && open) {
    throw createError({
      statusCode: 409,
      statusMessage: 'El empleado ya tiene una entrada activa sin marcar salida',
    });
  }
  if (requestedType === 'out' && !open) {
    throw createError({
      statusCode: 409,
      statusMessage: 'El empleado no tiene una entrada activa para marcar salida',
    });
  }

  const type: AttendanceType = requestedType || (open ? 'out' : 'in');

  if (type === 'out' && open) {
    db.prepare(
      `UPDATE attendance_records
       SET clock_out_at = ?, clock_out_source = ?, clock_out_device_id = ?
       WHERE id = ?`
    ).run(nowIso(), source, deviceId, open.id);
    return { type: 'out' as const, recordId: open.id };
  }

  const id = newId();
  db.prepare(
    `INSERT INTO attendance_records
      (id, employee_id, clock_in_at, clock_in_source, clock_in_device_id, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, employeeId, nowIso(), source, deviceId, notes, nowIso());
  return { type: 'in' as const, recordId: id };
}
