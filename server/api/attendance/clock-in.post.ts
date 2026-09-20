import { requireUser } from '../../utils/auth';
import { registerAttendanceEvent } from '../../utils/attendance';

export default defineEventHandler(async (event) => {
  requireUser(event);
  const body = await readBody<{ employeeId?: string; notes?: string }>(event);

  if (!body?.employeeId) {
    throw createError({ statusCode: 400, statusMessage: 'employeeId es requerido' });
  }

  const result = registerAttendanceEvent({
    employeeId: body.employeeId,
    source: 'manual',
    type: 'in',
    notes: body.notes || null,
  });

  return result;
});
