import { getDb } from '../../utils/db';
import { verifyDeviceApiKey } from '../../utils/auth';
import { findEmployeeByBiometricId, registerAttendanceEvent } from '../../utils/attendance';

interface BiometricPayload {
  biometricId?: string;
  type?: 'in' | 'out';
}

/**
 * Endpoint genérico para receptores/lectores biométricos (huella, rostro, tarjeta).
 * El dispositivo (o un "bridge" que traduzca su protocolo propietario, p. ej.
 * ZKTeco/Suprema/Hikvision) hace POST aquí con su api_key en el header x-api-key.
 *
 * Body: { "biometricId": "BIO-0001", "type": "in" | "out" }  (type es opcional;
 * si se omite, el sistema detecta automáticamente si es entrada o salida
 * según si el empleado ya tiene una marca abierta).
 */
export default defineEventHandler(async (event) => {
  const apiKey = getHeader(event, 'x-api-key');
  const device = await verifyDeviceApiKey(apiKey);

  const body = await readBody<BiometricPayload>(event);
  const biometricId = body?.biometricId?.trim();
  if (!biometricId) {
    throw createError({ statusCode: 400, statusMessage: 'biometricId es requerido' });
  }

  const employee = await findEmployeeByBiometricId(biometricId);
  if (!employee) {
    throw createError({
      statusCode: 404,
      statusMessage: `No existe ningún empleado registrado con el ID biométrico "${biometricId}"`,
    });
  }
  if (!employee.active) {
    throw createError({ statusCode: 403, statusMessage: 'El empleado está inactivo' });
  }

  const db = await getDb();
  await db`UPDATE devices SET last_seen_at = now() WHERE id = ${device.id}`;

  const result = await registerAttendanceEvent({
    employeeId: employee.id,
    source: 'biometric',
    deviceId: device.id,
    type: body.type,
  });

  return {
    ...result,
    employee: { id: employee.id, fullName: employee.fullName, employeeCode: employee.employeeCode },
    device: { id: device.id, name: device.name },
  };
});
