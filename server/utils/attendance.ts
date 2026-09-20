import { getDb, newId } from './db';

export type AttendanceSource = 'manual' | 'biometric';
export type AttendanceType = 'in' | 'out';

interface OpenRecord {
  id: string;
  clockInAt: string;
}

async function getOpenRecord(employeeId: string): Promise<OpenRecord | null> {
  const db = await getDb();
  const rows = await db<OpenRecord[]>`
    SELECT id, clock_in_at FROM attendance_records
    WHERE employee_id = ${employeeId} AND clock_out_at IS NULL
    ORDER BY clock_in_at DESC LIMIT 1
  `;
  return rows[0] || null;
}

export async function findEmployeeByBiometricId(biometricId: string) {
  const db = await getDb();
  const rows = await db<{ id: string; fullName: string; employeeCode: string; active: boolean }[]>`
    SELECT id, full_name, employee_code, active
    FROM employees WHERE biometric_id = ${biometricId}
  `;
  return rows[0];
}

export async function registerAttendanceEvent(params: {
  employeeId: string;
  source: AttendanceSource;
  deviceId?: string | null;
  type?: AttendanceType;
  notes?: string | null;
}) {
  const db = await getDb();
  const { employeeId, source, deviceId = null, notes = null } = params;
  const open = await getOpenRecord(employeeId);
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
    await db`
      UPDATE attendance_records
      SET clock_out_at = now(), clock_out_source = ${source}, clock_out_device_id = ${deviceId}
      WHERE id = ${open.id}
    `;
    return { type: 'out' as const, recordId: open.id };
  }

  const id = newId();
  await db`
    INSERT INTO attendance_records (id, employee_id, clock_in_at, clock_in_source, clock_in_device_id, notes)
    VALUES (${id}, ${employeeId}, now(), ${source}, ${deviceId}, ${notes})
  `;
  return { type: 'in' as const, recordId: id };
}
